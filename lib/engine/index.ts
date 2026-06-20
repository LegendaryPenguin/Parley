import type {
  NPCPersona,
  SceneDefinition,
  PlayerProfile,
  NPCMemory,
  ConversationState,
  DialogueTurn,
  JudgeResult,
  JudgePrompt,
  CEFR,
  VocabItem,
  SrsState,
  Mastery,
} from '@/lib/types';

// The tutor brain. Pure logic — no 0G, no UI. The compute calls live in the
// API routes (which import lib/og + these prompt builders).

const LANG_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  ja: 'Japanese',
  de: 'German',
};

export function langName(code: string): string {
  return LANG_NAMES[code] ?? code;
}

// ---- Prompt construction ----

export function buildNPCSystemPrompt(
  persona: NPCPersona,
  scene: SceneDefinition,
  profile: PlayerProfile,
  memory: NPCMemory | null,
): string {
  const lang = langName(profile.targetLanguage);
  const memoryNote =
    memory && memory.notes.length
      ? `You remember this traveler. Notes: ${memory.notes.slice(-3).join('; ')}. Rapport: ${memory.rapport}/10. Greet them as someone you've met before.`
      : 'You have not met this traveler before.';

  return [
    `[scene:${scene.id}]`,
    `[lang:${profile.targetLanguage}]`,
    `You are ${persona.name}, a ${persona.role} at the ${scene.place.toLowerCase()}.`,
    persona.personaPrompt,
    `Speak ONLY in ${lang}, at CEFR ${profile.level} level — short, natural, speakable lines (1–2 sentences).`,
    `Stay fully in character. NEVER explain grammar or break role to teach.`,
    `The traveler is trying to: ${scene.goalSummaryNative}`,
    `Steer the conversation gently toward that goal.`,
    `If they make a mistake, react naturally as a real person would (mild confusion, ask again) — do not correct them out loud.`,
    memoryNote,
  ].join(' ');
}

export function buildJudgePrompt(state: ConversationState, scene: SceneDefinition, profile: PlayerProfile): JudgePrompt {
  return {
    successCriteria: scene.successCriteria,
    transcript: state.turns,
    targetLanguage: profile.targetLanguage,
    level: profile.level,
  };
}

// The instruction text a live judge model receives (used by lib/og/compute).
export function judgeInstruction(prompt: JudgePrompt): string {
  return [
    `You are a friendly ${langName(prompt.targetLanguage)} tutor grading a CEFR ${prompt.level} learner.`,
    `Scene success criteria: "${prompt.successCriteria}".`,
    `Given the exchange transcript, return JSON ONLY with this shape:`,
    `{ "goalMet": boolean, "fluency": 0-100, "corrections": [{ "original": string, "suggestion": string, "note": string }], "newWordsUsed": [{ "term": string, "reading"?: string, "meaning": string }], "difficultyHint": number(-1..1) }`,
    `Judge meaning and communication over perfection. Corrections: the 1–2 most useful fixes, friendly and short.`,
  ].join(' ');
}

// ---- Folding judge results into conversation state ----

export function applyJudge(state: ConversationState, judge: JudgeResult): ConversationState {
  // Attach the most recent correction to the last player turn (for margin note).
  const turns = [...state.turns];
  if (judge.corrections.length) {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].role === 'player' && !turns[i].correction) {
        turns[i] = { ...turns[i], correction: judge.corrections[0] };
        break;
      }
    }
  }
  return {
    ...state,
    turns,
    goalMet: judge.goalMet || state.goalMet,
    fluencyScore: judge.fluency,
  };
}

// ---- Difficulty adaptation ----

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export function adaptDifficulty(profile: PlayerProfile, recent: JudgeResult[]): { level: CEFR; bias: number } {
  if (!recent.length) return { level: profile.level, bias: 0 };
  const avgHint = recent.reduce((s, r) => s + r.difficultyHint, 0) / recent.length;
  const idx = LEVELS.indexOf(profile.level);
  let nextIdx = idx;
  if (avgHint > 0.4 && idx < LEVELS.length - 1) nextIdx = idx + 1;
  if (avgHint < -0.4 && idx > 0) nextIdx = idx - 1;
  return { level: LEVELS[nextIdx], bias: Math.max(-1, Math.min(1, avgHint)) };
}

// ---- SRS (SM-2-ish) ----

export function freshSrs(now: number): SrsState {
  return { ease: 2.5, intervalDays: 0, dueAt: now, reps: 0, lapses: 0 };
}

const DAY = 86_400_000;

export function updateSrsOnReview(item: VocabItem, grade: 0 | 1 | 2, now: number): VocabItem {
  const srs = { ...item.srs };
  if (grade === 0) {
    srs.lapses += 1;
    srs.reps = 0;
    srs.intervalDays = 0;
    srs.ease = Math.max(1.3, srs.ease - 0.2);
  } else {
    srs.reps += 1;
    srs.ease = Math.max(1.3, srs.ease + (grade === 2 ? 0.15 : 0));
    if (srs.reps === 1) srs.intervalDays = 1;
    else if (srs.reps === 2) srs.intervalDays = 3;
    else srs.intervalDays = Math.round(srs.intervalDays * srs.ease);
  }
  srs.dueAt = now + srs.intervalDays * DAY;

  let mastery: Mastery = item.mastery;
  if (srs.reps === 0) mastery = 'learning';
  else if (srs.reps >= 4 && srs.ease >= 2.5) mastery = 'mastered';
  else if (srs.reps >= 2) mastery = 'known';
  else mastery = 'learning';

  return { ...item, srs, mastery };
}

export function scheduleReview(vocab: VocabItem[], now: number): VocabItem[] {
  return vocab
    .filter((v) => v.srs.dueAt <= now || v.mastery === 'new' || v.mastery === 'learning')
    .sort((a, b) => a.srs.dueAt - b.srs.dueAt);
}

// ---- Vocab creation from a judge result ----

export function vocabFromJudge(
  judge: JudgeResult,
  sceneId: string,
  lang: string,
  now: number,
  exampleLine?: string,
): VocabItem[] {
  return judge.newWordsUsed.map((w) => ({
    id: `${lang}:${w.term.toLowerCase()}`,
    term: w.term,
    reading: w.reading,
    meaning: w.meaning,
    learnedSceneId: sceneId,
    learnedAt: now,
    mastery: 'new' as Mastery,
    srs: freshSrs(now),
    exampleLine,
  }));
}

export function mergeVocab(existing: VocabItem[], incoming: VocabItem[]): VocabItem[] {
  const byId = new Map(existing.map((v) => [v.id, v]));
  for (const v of incoming) {
    if (!byId.has(v.id)) byId.set(v.id, v);
  }
  return [...byId.values()];
}
