"use client";

// Tiny WebAudio engine — synthesizes all sound (no asset files). SSR-safe (only
// touches AudioContext in the browser, lazily on first use). OFF BY DEFAULT and
// autoplay-safe: nothing plays until the user unmutes, and the context is created
// on a user gesture. Crisp playful SFX (the kid-pleasing feedback) + a gentle
// per-scene ambient room tone.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = true;
let ambientStop: (() => void) | null = null;

const MUTE_KEY = "pw:muted";

export function initMutedFromStorage(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(MUTE_KEY);
  muted = v === null ? true : v === "1";
  return muted;
}

export function isMuted(): boolean {
  return muted;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(next: boolean): boolean {
  muted = next;
  if (typeof window !== "undefined") window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(next ? 0 : 0.6, ctx.currentTime + 0.08);
  }
  if (next && ambientStop) {
    ambientStop();
    ambientStop = null;
  }
  return muted;
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function blip(freq: number, when: number, dur: number, type: OscillatorType = "square", gain = 0.18) {
  const c = ensureCtx();
  if (!c || !master || muted) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noiseHit(when: number, dur: number, freq: number, q: number, gain: number) {
  const c = ensureCtx();
  if (!c || !master || muted) return;
  const t = c.currentTime + when;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur + 0.05);
  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = freq;
  filt.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// ---- SFX ----
export const sfx = {
  flap() {
    // split-flap clatter: a few quick ticks
    for (let i = 0; i < 5; i++) noiseHit(i * 0.045, 0.03, 2200 - i * 120, 6, 0.06);
  },
  stamp() {
    // rubber-stamp thunk: low thud + ink slap
    blip(150, 0, 0.12, "sine", 0.3);
    noiseHit(0, 0.09, 500, 1.5, 0.16);
  },
  collect() {
    // word flips into the phrasebook: rising blip
    blip(520, 0, 0.09, "triangle", 0.16);
    blip(780, 0.06, 0.1, "triangle", 0.14);
  },
  success() {
    // goal met: a bright little major arpeggio
    [523, 659, 784, 1047].forEach((f, i) => blip(f, i * 0.08, 0.22, "triangle", 0.16));
  },
  page() {
    noiseHit(0, 0.18, 1200, 0.7, 0.05);
  },
  pop() {
    blip(440, 0, 0.06, "square", 0.1);
  },
};

// ---- Ambient per scene: a gentle filtered room tone + sparse motifs ----
const SCENE_TONE: Record<string, { base: number; q: number; motif?: () => void }> = {
  market: { base: 380, q: 0.7 },
  border: { base: 260, q: 0.8 },
  cafe: { base: 320, q: 0.9 },
  harbor: { base: 220, q: 0.6 },
  platform: { base: 200, q: 0.5 },
};

export function startAmbient(sceneId: string) {
  const c = ensureCtx();
  if (!c || !master || muted) return;
  if (ambientStop) ambientStop();
  const tone = SCENE_TONE[sceneId] ?? SCENE_TONE.market;

  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 2);
  src.loop = true;
  const filt = c.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = tone.base;
  filt.Q.value = tone.q;
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.05, c.currentTime + 1.2); // very quiet bed
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start();

  ambientStop = () => {
    try {
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
      src.stop(c.currentTime + 0.5);
    } catch {
      /* already stopped */
    }
  };
}

export function stopAmbient() {
  if (ambientStop) {
    ambientStop();
    ambientStop = null;
  }
}
