// Shared contracts (Build Brief §6.3). Every module codes against these types.
// Nobody reaches across boundaries; only lib/og touches the 0G SDKs.

export type LanguageCode = 'es' | 'fr' | 'ja' | 'de' | (string & {});
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface PlayerProfile {
  id: string; // wallet address (or mock id)
  displayName: string;
  avatarId: string;
  targetLanguage: LanguageCode;
  level: CEFR;
  xp: number;
  streakDays: number;
  lastActiveDay: string; // YYYY-MM-DD for streaks
  visitedSceneIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SrsState {
  ease: number;
  intervalDays: number;
  dueAt: number;
  reps: number;
  lapses: number;
}

export type Mastery = 'new' | 'learning' | 'known' | 'mastered';

export interface VocabItem {
  id: string; // `${lang}:${lemma}`
  term: string;
  reading?: string;
  meaning: string;
  learnedSceneId: string;
  learnedAt: number;
  mastery: Mastery;
  srs: SrsState;
  exampleLine?: string;
}

export interface NPCPersona {
  id: string;
  name: string;
  role: string;
  sceneId: string;
  personaPrompt: string;
  voiceId?: string;
}

export interface SceneDefinition {
  id: string;
  title: string;
  place: string;
  npcId: string;
  skill: string; // the learning stage this place teaches, e.g. "Introductions"
  goalSummaryNative: string; // shown to player (their language)
  successCriteria: string; // fed to the judge
  targetVocab: string[];
  difficultyBias: number; // -1..+1 relative to player level
  art: { background: string; npcSprite: string; ambientSound?: string };
  // Atlas placement (percentage of map viewport)
  mapPos: { x: number; y: number };
  order: number;
}

export interface Correction {
  original: string;
  suggestion: string;
  note: string;
}

export type DialogueRole = 'npc' | 'player' | 'narrator';

export interface DialogueTurn {
  role: DialogueRole;
  textTarget?: string;
  textNative?: string;
  correction?: Correction;
  ts: number;
}

export interface ConversationState {
  sceneId: string;
  turns: DialogueTurn[];
  goalMet: boolean;
  hintsUsed: number;
  fluencyScore: number; // 0..100
}

export interface ProviderAttestation {
  provider?: string;
  model?: string;
  signature?: string;
  raw?: unknown;
}

export interface JudgeResult {
  goalMet: boolean;
  fluency: number; // 0..100
  corrections: Correction[];
  newWordsUsed: { term: string; reading?: string; meaning: string }[];
  difficultyHint: number; // -1..+1
  attestation?: ProviderAttestation;
}

export interface NPCMemory {
  npcId: string;
  playerId: string;
  notes: string[];
  rapport: number;
  lastSeenAt: number;
}

export interface SceneRecord {
  sceneId: string;
  playerId: string;
  startedAt: number;
  completedAt: number;
  goalMet: boolean;
  fluencyScore: number;
  wordsUsed: string[];
  transcriptStorageRoot: string; // 0G Storage root of the full transcript
  recordHash: string; // hash anchored on-chain
  attestation?: ProviderAttestation;
  anchorTx?: string; // 0G Chain tx hash
}

// ---- Compute helper types ----
export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOpts {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ModelInfo {
  id: string;
  capabilities?: { json?: boolean; tools?: boolean; vision?: boolean };
}

export interface JudgePrompt {
  successCriteria: string;
  transcript: DialogueTurn[];
  targetLanguage: LanguageCode;
  level: CEFR;
}
