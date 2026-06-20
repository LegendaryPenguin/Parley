import type { NPCPersona, SceneDefinition } from '@/lib/types';

// The seed world for Spanish (es). Architecture supports more languages/scenes.

export const PERSONAS: Record<string, NPCPersona> = {
  'officer-border': {
    id: 'officer-border',
    name: 'Inés',
    role: 'border officer',
    sceneId: 'border',
    voiceId: 'es-female-warm',
    personaPrompt:
      'A friendly, curious border officer who loves meeting travelers. Warm, a little chatty, asks simple getting-to-know-you questions. Keeps things very easy for newcomers.',
  },
  'vendor-market': {
    id: 'vendor-market',
    name: 'Rosa',
    role: 'fruit vendor',
    sceneId: 'market',
    voiceId: 'es-female-bright',
    personaPrompt:
      'A bustling, good-humored fruit vendor at a night market. Calls travelers "joven", quick and cheerful, proud of her oranges. Patient but busy.',
  },
  'barista-cafe': {
    id: 'barista-cafe',
    name: 'Mateo',
    role: 'café barista',
    sceneId: 'cafe',
    voiceId: 'es-male-calm',
    personaPrompt:
      'A relaxed neighborhood barista who knows the regulars. Easygoing, makes small talk about the weather and the day. Likes to recommend the cortado.',
  },
  'sailor-harbor': {
    id: 'sailor-harbor',
    name: 'Lucía',
    role: 'harbor ferrywoman',
    sceneId: 'harbor',
    voiceId: 'es-female-deep',
    personaPrompt:
      'A weathered, kind ferrywoman at the harbor. Speaks plainly, a touch of sea-salt humor, helps travelers find the right boat and the right time.',
  },
  'agent-platform': {
    id: 'agent-platform',
    name: 'Don Felipe',
    role: 'station agent',
    sceneId: 'platform',
    voiceId: 'es-male-formal',
    personaPrompt:
      'A precise but warm-hearted train station agent. Slightly formal, helpful under pressure, will bend a small rule for a polite traveler in a bind.',
  },
};

export const SCENES: Record<string, SceneDefinition> = {
  border: {
    id: 'border',
    title: 'Border Control',
    place: 'BORDER',
    npcId: 'officer-border',
    goalSummaryNative: 'Say hello, say where you are from, and where you are headed.',
    successCriteria:
      'The traveler greeted the officer, stated where they are from, and indicated a destination — in Spanish, however simply.',
    targetVocab: ['hola', 'soy de', 'voy a', 'gracias'],
    difficultyBias: -1,
    art: { background: 'border', npcSprite: 'officer-border', ambientSound: 'border' },
    mapPos: { x: 18, y: 70 },
    order: 0,
  },
  market: {
    id: 'market',
    title: 'The Night Market',
    place: 'MERCADO',
    npcId: 'vendor-market',
    goalSummaryNative: 'Buy a kilo of oranges and ask how much it costs.',
    successCriteria:
      'The traveler asked for a kilo of oranges (correct quantity word) AND asked the price — in Spanish.',
    targetVocab: ['naranja', 'un kilo', '¿cuánto cuesta?', 'por favor'],
    difficultyBias: 0,
    art: { background: 'market', npcSprite: 'vendor-market', ambientSound: 'market' },
    mapPos: { x: 38, y: 52 },
    order: 1,
  },
  cafe: {
    id: 'cafe',
    title: 'The Corner Café',
    place: 'CAFÉ',
    npcId: 'barista-cafe',
    goalSummaryNative: 'Order a coffee the way the locals do, and say thank you.',
    successCriteria:
      'The traveler ordered a coffee (politely, with por favor or similar) and thanked the barista — in Spanish.',
    targetVocab: ['un café', 'cortado', 'por favor', 'la cuenta'],
    difficultyBias: 0,
    art: { background: 'cafe', npcSprite: 'barista-cafe', ambientSound: 'cafe' },
    mapPos: { x: 60, y: 60 },
    order: 2,
  },
  harbor: {
    id: 'harbor',
    title: 'The Harbor',
    place: 'PUERTO',
    npcId: 'sailor-harbor',
    goalSummaryNative: 'Ask which boat goes to the island and what time it leaves.',
    successCriteria:
      'The traveler asked which boat/ferry goes to the island AND asked what time it departs — in Spanish.',
    targetVocab: ['el barco', 'la isla', '¿a qué hora?', 'el billete'],
    difficultyBias: 0.5,
    art: { background: 'harbor', npcSprite: 'sailor-harbor', ambientSound: 'harbor' },
    mapPos: { x: 78, y: 38 },
    order: 3,
  },
  platform: {
    id: 'platform',
    title: 'The Train Platform',
    place: 'ANDÉN',
    npcId: 'agent-platform',
    goalSummaryNative: 'Talk your way onto the last train — explain you missed yours.',
    successCriteria:
      'The traveler explained (in Spanish) that they missed their train and politely asked to board the last one.',
    targetVocab: ['el tren', 'perdí', 'el último', 'por favor'],
    difficultyBias: 1,
    art: { background: 'platform', npcSprite: 'agent-platform', ambientSound: 'platform' },
    mapPos: { x: 52, y: 24 },
    order: 4,
  },
};

export const SCENE_ORDER = ['border', 'market', 'cafe', 'harbor', 'platform'];

export function getScene(id: string): SceneDefinition | undefined {
  return SCENES[id];
}

export function getPersona(id: string): NPCPersona | undefined {
  return PERSONAS[id];
}

// Only fully-playable languages are offered. bcp47 drives speech recognition /
// TTS; script flags Devanagari (Hindi) for the romanization toggle.
export const LANGUAGES: {
  code: string;
  label: string;
  flag: string;
  bcp47: string;
  script: 'latin' | 'deva' | 'kana' | 'hanzi';
  hello: string;
}[] = [
  { code: 'es', label: 'Spanish', flag: 'ES', bcp47: 'es-ES', script: 'latin', hello: '¡Hola!' },
  { code: 'fr', label: 'French', flag: 'FR', bcp47: 'fr-FR', script: 'latin', hello: 'Bonjour !' },
  { code: 'hi', label: 'Hindi', flag: 'हि', bcp47: 'hi-IN', script: 'deva', hello: 'नमस्ते' },
  { code: 'de', label: 'German', flag: 'DE', bcp47: 'de-DE', script: 'latin', hello: 'Hallo!' },
  { code: 'it', label: 'Italian', flag: 'IT', bcp47: 'it-IT', script: 'latin', hello: 'Ciao!' },
  { code: 'ja', label: 'Japanese', flag: '日', bcp47: 'ja-JP', script: 'kana', hello: 'こんにちは' },
  { code: 'zh', label: 'Mandarin', flag: '中', bcp47: 'zh-CN', script: 'hanzi', hello: '你好' },
];

export function langMeta(code: string) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export const AVATARS = ['wren', 'fox', 'moth', 'crane'];
