// Per-language, per-scene "script" — the data that makes a language playable:
// the local's canned lines (mock mode), goal detection, gentle corrections,
// line translations, hints, and the vocabulary (with romanization for non-Latin
// scripts). Live mode (0G Compute) speaks/judges natively; this still powers
// tap-to-translate fallback, hints, and the offline mock conversation.

export interface ScriptVocab {
  term: string;
  reading?: string; // romanization (e.g. for Devanagari)
  meaning: string;
}

export interface SceneScript {
  // the local's first line when you walk up
  opening: string;
  // fallback when nothing matches
  fallback: string;
  // NPC reply rules, first match wins. `needs` is AND-of-OR: every inner group
  // must have at least one keyword present (accent/case-insensitive). `avoid`:
  // skip the rule if any of these appear.
  rules: { needs: string[][]; avoid?: string[]; reply: string }[];
  // goal is met when EVERY group has at least one of its keywords in the
  // player's combined lines. e.g. [["kilo","naranja"],["cuanto","precio"]]
  goal: string[][];
  // gentle in-flow corrections: if `bad` appears, suggest `good`. `recast` is an
  // optional in-language line the local says to model the correct phrasing.
  corrections?: { bad: string; good: string; note: string; recast?: string }[];
  // canned NPC line -> English (tap to translate, offline)
  translations: Record<string, string>;
  // optional NPC line -> romanization (non-Latin scripts)
  readings?: Record<string, string>;
  // escalating hints (a nudge, then the phrase)
  hints: string[];
  // the words this scene teaches
  vocab: ScriptVocab[];
}

export type LangScript = Record<string, SceneScript>; // keyed by sceneId
