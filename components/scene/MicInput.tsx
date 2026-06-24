"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MicIcon } from "@/components/design/Icons";

// Tap-to-talk + text. Tap the mic once to start; it keeps listening continuously
// and AUTO-STOPS + sends after ~2s of silence (or tap again to send now). STT via
// the browser SpeechRecognition API (0G STT slots in here later, Brief §6).

type SRResultList = ArrayLike<ArrayLike<{ transcript: string }>>;
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: SRResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const SILENCE_MS = 2000; // auto-stop after this much quiet

// Inky waveform — taller, livelier bars that "speak" while you talk.
const BAR_HEIGHTS = ["35%", "100%", "55%", "85%", "40%", "95%", "50%"];

function InkWaveform({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;
  return (
    <div className="flex items-center gap-[3px] h-5" aria-hidden>
      {BAR_HEIGHTS.map((peak, i) => (
        <motion.span
          key={i}
          className="block w-[3px] rounded-full bg-riso-pink"
          style={{ height: peak }}
          initial={{ scaleY: 0.25 }}
          animate={animate ? { scaleY: [0.25, 1, 0.4] } : { scaleY: active ? 1 : 0.25 }}
          transition={
            animate
              ? {
                  duration: 0.55 + (i % 3) * 0.12,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: i * 0.06,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

export function MicInput({
  onSend,
  disabled,
  lang = "es-ES",
  placeholder = "Say it…",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  lang?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const reduceMotion = useReducedMotion();

  const recRef = useRef<SR | null>(null);
  const textRef = useRef("");
  const onSendRef = useRef(onSend);
  const disabledRef = useRef(disabled);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppingRef = useRef(false);

  useEffect(() => {
    onSendRef.current = onSend;
    disabledRef.current = disabled;
  }, [onSend, disabled]);

  function setBoth(v: string) {
    textRef.current = v;
    setText(v);
  }

  function clearSilence() {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
  }

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SR;
      webkitSpeechRecognition?: new () => SR;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true; // keep listening across pauses within a sentence
    rec.interimResults = true;

    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setBoth(t);
      // heard something → reset the silence countdown
      clearSilence();
      silenceTimer.current = setTimeout(() => {
        stoppingRef.current = true;
        try {
          rec.stop();
        } catch {
          /* already stopped */
        }
      }, SILENCE_MS);
    };

    rec.onend = () => {
      clearSilence();
      setListening(false);
      stoppingRef.current = false;
      // commit whatever was captured
      const t = textRef.current.trim();
      if (t && !disabledRef.current) {
        onSendRef.current(t);
        setBoth("");
        setJustSent(true);
        window.setTimeout(() => setJustSent(false), 320);
      }
    };

    rec.onerror = () => {
      clearSilence();
      setListening(false);
    };

    recRef.current = rec;
    return () => {
      clearSilence();
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, [lang]);

  function startListen() {
    if (!recRef.current || disabled) return;
    setBoth("");
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopListen() {
    clearSilence();
    try {
      recRef.current?.stop(); // onend commits + sends
    } catch {
      setListening(false);
    }
  }

  function toggleListen() {
    if (listening) stopListen();
    else startListen();
  }

  function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    if (listening) {
      stopListen(); // onend will send
      return;
    }
    onSend(t);
    setBoth("");
    setJustSent(true);
    window.setTimeout(() => setJustSent(false), 320);
  }

  const canSend = !disabled && !!text.trim();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="relative w-full sm:flex-1">
        <textarea
          value={text}
          onChange={(e) => setBoth(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={listening ? "Listening… pause when you're done" : placeholder}
          className="w-full resize-none bg-paper border-2 border-ink rounded-sm px-3 py-2.5 pr-14 font-read text-ink placeholder:text-ink-soft/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 transition-shadow"
          style={listening ? { boxShadow: "3px 3px 0 var(--riso-pink)" } : undefined}
        />

        {/* Live ink waveform tucked inside the field while you speak */}
        <AnimatePresence>
          {listening && (
            <motion.div
              key="wave"
              className="absolute right-3 bottom-3 pointer-events-none"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              <InkWaveform active />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-end gap-2 shrink-0">
        {supported && (
          <button
            type="button"
            onClick={toggleListen}
            disabled={disabled}
            aria-label={listening ? "Stop and send" : "Tap to speak"}
            aria-pressed={listening}
            title={listening ? "Listening — tap to send, or just pause" : "Tap to speak"}
            className={`relative shrink-0 grid place-items-center w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-sm border-2 border-ink select-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed ${
              listening ? "bg-riso-pink text-paper" : "bg-marigold text-ink hover:bg-sunny"
            }`}
            style={{ boxShadow: listening ? "none" : "3px 3px 0 var(--ink)" }}
          >
            {/* a soft listening pulse so it's obvious the mic is open */}
            {listening && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-sm border-2 border-riso-pink motion-reduce:hidden"
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <motion.span
              className="grid place-items-center leading-none"
              aria-hidden
              animate={listening && !reduceMotion ? { rotate: [-7, 7, -7] } : { rotate: 0 }}
              transition={
                listening && !reduceMotion
                  ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
              }
            >
              <MicIcon size={22} />
            </motion.span>
          </button>
        )}

        <motion.button
          type="button"
          onClick={submit}
          disabled={!canSend && !listening}
          aria-label="Send your message"
          className="flex-1 sm:flex-none sm:shrink-0 font-display font-extrabold uppercase text-sm tracking-wide text-paper px-4 h-11 sm:h-12 min-h-[44px] rounded-sm border-2 border-ink transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
          style={{
            background: "var(--riso-blue)",
            boxShadow: canSend || listening ? "3px 3px 0 var(--ink)" : "none",
          }}
          animate={
            justSent && !reduceMotion
              ? { scale: [1, 1.14, 0.96, 1], rotate: [0, -3, 2, 0] }
              : canSend && !reduceMotion
                ? { scale: [1, 1.04, 1] }
                : { scale: 1, rotate: 0 }
          }
          transition={
            justSent && !reduceMotion
              ? { duration: 0.32, ease: "easeOut" }
              : canSend && !reduceMotion
                ? { duration: 0.4, ease: "easeOut" }
                : { duration: 0.2 }
          }
        >
          Say it
        </motion.button>
      </div>
    </div>
  );
}
