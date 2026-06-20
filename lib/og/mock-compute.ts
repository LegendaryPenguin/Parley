import type { JudgePrompt, JudgeResult, ChatMsg, ModelInfo } from '@/lib/types';

// Mock 0G Compute. Keyword-aware so the golden path actually feels alive in
// OG_MODE=mock. Real inference (lib/og/compute.ts) swaps in behind the same API.

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!.,]/g, ' ');

function has(text: string, ...needles: string[]): boolean {
  const n = norm(text);
  return needles.some((w) => n.includes(norm(w)));
}

const MOCK_ATTESTATION = {
  provider: '0g-compute-mock',
  model: 'mock-llama-3.1-8b',
  signature: '0xMOCKSIGdeadbeefcafe…' ,
  raw: { teeVerified: true, note: 'mock attestation — replace with live TEE signature' },
};

// Pull out the scene id + last player line from the message stack.
function lastPlayer(messages: ChatMsg[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return '';
}

function sceneFromSystem(messages: ChatMsg[]): string {
  const sys = messages.find((m) => m.role === 'system')?.content ?? '';
  const m = sys.match(/\[scene:([a-z-]+)\]/);
  return m ? m[1] : 'market';
}

// ---- Mock NPC turn ----
export function mockChat(messages: ChatMsg[]): { text: string; attestation: typeof MOCK_ATTESTATION } {
  const scene = sceneFromSystem(messages);
  const player = lastPlayer(messages);
  // The opener is the very first NPC line — i.e. no assistant turns spoken yet.
  const opening = messages.filter((m) => m.role === 'assistant').length === 0;
  let text = '';

  if (scene === 'border') {
    if (opening) text = '¡Bienvenido! ¿De dónde vienes hoy?';
    else if (has(player, 'soy de', 'vengo de', 'de ')) text = '¡Qué bien! ¿Y a dónde vas?';
    else if (has(player, 'voy a', 'a ')) text = 'Perfecto. ¡Buen viaje, viajero!';
    else text = 'Mmm… cuéntame, ¿de dónde vienes?';
  } else if (scene === 'market') {
    if (opening) text = '¿Qué le pongo, joven? Tengo naranjas muy dulces.';
    else if (has(player, 'una kilo')) text = '¿Cómo? ¿Cuántas naranjas, joven?';
    else if (has(player, 'kilo', 'naranja') && has(player, 'cuanto', 'precio', 'cuesta', 'vale'))
      text = '¡Marchando un kilo! Son dos euros. ¿Algo más?';
    else if (has(player, 'kilo', 'naranja')) text = 'Marchando un kilo de naranjas. ¿Algo más?';
    else if (has(player, 'cuanto', 'precio', 'cuesta', 'vale')) text = 'Las naranjas están a dos euros el kilo. ¿Le pongo?';
    else text = 'Dígame, joven, ¿qué desea?';
  } else if (scene === 'cafe') {
    if (opening) text = 'Buenas. ¿Qué le pongo de tomar?';
    else if (has(player, 'cafe', 'cortado') && has(player, 'gracias', 'por favor'))
      text = 'Marchando un café. ¡Gracias a ti!';
    else if (has(player, 'cafe', 'cortado')) text = 'Un café enseguida. ¿Algo más?';
    else text = '¿Le apetece un café? Tengo un cortado buenísimo.';
  } else if (scene === 'harbor') {
    if (opening) text = 'Buenas, viajera. ¿A dónde te llevo?';
    else if (has(player, 'isla', 'barco') && has(player, 'hora')) text = 'El barco a la isla sale a las cinco. ¿Te saco billete?';
    else if (has(player, 'isla', 'barco')) text = 'Ah, a la isla. ¿Y a qué hora quieres ir?';
    else text = 'Aquí hay muchos barcos. ¿Cuál buscas?';
  } else if (scene === 'platform') {
    if (opening) text = 'El andén está cerrando. ¿Qué ocurre?';
    else if (has(player, 'perdi', 'perdido') && has(player, 'tren', 'ultimo'))
      text = 'Vaya… está bien, sube rápido al último. ¡Corre!';
    else if (has(player, 'tren')) text = '¿Su tren? Dígame qué pasó.';
    else text = 'Tiene que darse prisa. ¿Qué necesita?';
  } else {
    text = '¿Sí? Dígame.';
  }

  return { text, attestation: MOCK_ATTESTATION };
}

// ---- Mock judge ----
const WORD_BANK: Record<string, { meaning: string; reading?: string }> = {
  hola: { meaning: 'hello' },
  gracias: { meaning: 'thank you' },
  'soy de': { meaning: 'I am from' },
  'voy a': { meaning: 'I am going to' },
  naranja: { meaning: 'orange' },
  naranjas: { meaning: 'oranges' },
  'un kilo': { meaning: 'a kilo' },
  kilo: { meaning: 'a kilo' },
  '¿cuánto cuesta?': { meaning: 'how much does it cost?' },
  cuanto: { meaning: 'how much' },
  'por favor': { meaning: 'please' },
  cafe: { meaning: 'coffee' },
  cortado: { meaning: 'coffee with a dash of milk' },
  barco: { meaning: 'boat' },
  isla: { meaning: 'island' },
  tren: { meaning: 'train' },
  perdi: { meaning: 'I missed / lost' },
};

export function mockJudge(prompt: JudgePrompt): JudgeResult {
  const playerLines = prompt.transcript.filter((t) => t.role === 'player').map((t) => t.textTarget ?? '');
  const joined = playerLines.join(' ');
  const crit = norm(prompt.successCriteria);

  const corrections = [] as JudgeResult['corrections'];
  // The classic gendered-quantity slip from the brief.
  if (has(joined, 'una kilo')) {
    corrections.push({ original: 'una kilo', suggestion: 'un kilo', note: "try: un kilo (kilo is masculine)" });
  }
  if (has(joined, 'mucho gracias')) {
    corrections.push({ original: 'mucho gracias', suggestion: 'muchas gracias', note: 'try: muchas gracias' });
  }

  // Goal detection per scene success criteria keywords.
  let goalMet = false;
  if (crit.includes('oranges')) {
    goalMet = has(joined, 'kilo', 'naranja') && has(joined, 'cuanto', 'cuesta', 'precio', 'vale', 'cuestan');
  } else if (crit.includes('coffee')) {
    goalMet = has(joined, 'cafe', 'cortado');
  } else if (crit.includes('from') && crit.includes('destination')) {
    goalMet = has(joined, 'soy de', 'vengo', 'de') && has(joined, 'voy a', 'a ');
  } else if (crit.includes('island')) {
    goalMet = (has(joined, 'isla') || has(joined, 'barco')) && has(joined, 'hora');
  } else if (crit.includes('missed')) {
    goalMet = has(joined, 'perdi', 'perdido') && has(joined, 'tren', 'ultimo');
  } else {
    goalMet = playerLines.length >= 2;
  }

  // Detect collected words.
  const newWordsUsed: JudgeResult['newWordsUsed'] = [];
  const seen = new Set<string>();
  for (const [term, meta] of Object.entries(WORD_BANK)) {
    if (has(joined, term) && !seen.has(meta.meaning)) {
      seen.add(meta.meaning);
      newWordsUsed.push({ term, meaning: meta.meaning, reading: meta.reading });
    }
  }

  // Fluency: base on length, deduct for corrections.
  let fluency = Math.min(95, 50 + playerLines.length * 12 - corrections.length * 12);
  if (goalMet) fluency = Math.max(fluency, 72);
  fluency = Math.max(20, Math.min(98, fluency));

  const difficultyHint = corrections.length >= 2 ? -0.5 : fluency > 85 ? 0.5 : 0;

  return {
    goalMet,
    fluency,
    corrections,
    newWordsUsed: goalMet ? newWordsUsed : newWordsUsed.slice(0, 2),
    difficultyHint,
    attestation: MOCK_ATTESTATION,
  };
}

export const MOCK_MODELS: ModelInfo[] = [
  { id: 'mock-llama-3.1-8b', capabilities: { json: true, tools: false, vision: false } },
];
