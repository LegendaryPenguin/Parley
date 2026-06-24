import type { JudgePrompt, JudgeResult, ChatMsg, ModelInfo } from '@/lib/types';
import { getSceneScript, normalize, matchesAll, matchesAnyWord } from '@/lib/content/scripts';

// Mock 0G Compute — generic over the per-language content scripts, so every
// supported language plays offline. Real inference (lib/og/compute.ts) swaps in
// behind the same API; live mode speaks/judges any language natively.

const MOCK_ATTESTATION = {
  provider: '0g-compute-mock',
  model: 'mock-llama-3.1-8b',
  signature: '0xMOCKSIGdeadbeefcafe…',
  raw: { teeVerified: true, note: 'mock attestation — replace with live TEE signature' },
};

function lastPlayer(messages: ChatMsg[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return '';
}

function tagFromSystem(messages: ChatMsg[], tag: string, fallback: string): string {
  const sys = messages.find((m) => m.role === 'system')?.content ?? '';
  const m = sys.match(new RegExp(`\\[${tag}:([a-z-]+)\\]`));
  return m ? m[1] : fallback;
}

// ---- Mock NPC turn ----
export function mockChat(messages: ChatMsg[]): { text: string; attestation: typeof MOCK_ATTESTATION } {
  const sceneId = tagFromSystem(messages, 'scene', 'market');
  const lang = tagFromSystem(messages, 'lang', 'es');
  const script = getSceneScript(lang, sceneId);
  const opening = messages.filter((m) => m.role === 'assistant').length === 0;

  let text = script.fallback;
  if (opening) {
    text = script.opening;
  } else {
    const player = lastPlayer(messages);
    // First: if the traveler made a known slip, the local gently recasts the
    // correct phrasing in-language (a kind native's corrective recast).
    const recast = (script.corrections ?? []).find((c) => c.recast && matchesAnyWord(player, c.bad));
    if (recast?.recast) {
      text = recast.recast;
    } else {
      for (const rule of script.rules) {
        if (rule.avoid && rule.avoid.some((w) => matchesAnyWord(player, w))) continue;
        if (matchesAll(player, rule.needs)) {
          text = rule.reply;
          break;
        }
      }
    }
  }
  return { text, attestation: MOCK_ATTESTATION };
}

// ---- Mock judge ----
export function mockJudge(prompt: JudgePrompt): JudgeResult {
  const sceneId = inferSceneId(prompt);
  const script = getSceneScript(prompt.targetLanguage, sceneId);
  const playerLines = prompt.transcript.filter((t) => t.role === 'player').map((t) => t.textTarget ?? '');
  const joined = playerLines.join(' ');

  const corrections: JudgeResult['corrections'] = [];
  for (const c of script.corrections ?? []) {
    if (matchesAnyWord(joined, c.bad)) corrections.push({ original: c.bad, suggestion: c.good, note: c.note });
  }

  const goalMet = playerLines.length > 0 && matchesAll(joined, script.goal);

  const newWordsUsed: JudgeResult['newWordsUsed'] = [];
  const seen = new Set<string>();
  for (const v of script.vocab) {
    // match on the term, its first word, or the romanization (Hinglish input)
    const head = normalize(v.term).split(' ')[0];
    const byReading = v.reading ? matchesAnyWord(joined, v.reading) || matchesAnyWord(joined, normalize(v.reading).split(' ')[0]) : false;
    if ((matchesAnyWord(joined, v.term) || matchesAnyWord(joined, head) || byReading) && !seen.has(v.meaning)) {
      seen.add(v.meaning);
      newWordsUsed.push({ term: v.term, reading: v.reading, meaning: v.meaning });
    }
  }

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

// The judge prompt doesn't carry the scene id directly, so infer it from the
// success criteria keywords (which are scene-unique).
function inferSceneId(prompt: JudgePrompt): string {
  const crit = normalize(prompt.successCriteria);
  if (crit.includes('orange')) return 'market';
  if (crit.includes('coffee')) return 'cafe';
  if (crit.includes('island')) return 'harbor';
  if (crit.includes('missed') || crit.includes('train')) return 'platform';
  if (crit.includes('from') && crit.includes('destination')) return 'border';
  return 'market';
}

export const MOCK_MODELS: ModelInfo[] = [
  { id: 'mock-llama-3.1-8b', capabilities: { json: true, tools: false, vision: false } },
];
