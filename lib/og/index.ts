// The ONLY place the rest of the app touches "0G". Everything imports these
// typed functions; nobody imports a 0G SDK directly. Toggled by OG_MODE.
//
// - Compute (chat/judge/transcribe/speak): called from server routes.
// - Storage/Chain: called from the client with the user's wallet.
//
// In OG_MODE=mock everything is canned/local. Real impls (compute.ts,
// storage.ts, chain.ts) slot in behind these same signatures — the UI never
// knows the difference.

import type {
  PlayerProfile,
  VocabItem,
  NPCMemory,
  SceneRecord,
  DialogueTurn,
  JudgePrompt,
  JudgeResult,
  ChatMsg,
  ChatOpts,
  ModelInfo,
  ProviderAttestation,
} from '@/lib/types';
import { mockChat, mockJudge, MOCK_MODELS } from './mock-compute';
import { mockStorage, mockChain } from './mock-storage';

export const OG_MODE = process.env.OG_MODE ?? process.env.NEXT_PUBLIC_OG_MODE ?? 'mock';
export const isMock = OG_MODE === 'mock';

// ---------------- Compute (server-side) ----------------

export async function listModels(): Promise<ModelInfo[]> {
  if (isMock) return MOCK_MODELS;
  const { liveListModels } = await import('./compute');
  return liveListModels();
}

export async function chat(
  messages: ChatMsg[],
  opts?: ChatOpts,
): Promise<{ text: string; attestation?: ProviderAttestation }> {
  if (isMock) return mockChat(messages);
  const { liveChat } = await import('./compute');
  return liveChat(messages, opts);
}

export async function judge(prompt: JudgePrompt): Promise<JudgeResult> {
  if (isMock) return mockJudge(prompt);
  const { liveJudge } = await import('./compute');
  return liveJudge(prompt);
}

export async function transcribe(audio: Blob): Promise<string> {
  if (isMock) throw new Error('mock STT unavailable — use browser SpeechRecognition');
  const { liveTranscribe } = await import('./compute');
  return liveTranscribe(audio);
}

export async function speak(text: string, voiceId?: string): Promise<Blob> {
  if (isMock) throw new Error('mock TTS unavailable — use speechSynthesis');
  const { liveSpeak } = await import('./compute');
  return liveSpeak(text, voiceId);
}

// ---------------- Storage (client-side, encrypt-to-self) ----------------

export async function savePlayer(p: PlayerProfile): Promise<{ root: string }> {
  if (isMock) return mockStorage.savePlayer(p);
  const { liveStorage } = await import('./storage');
  return liveStorage.savePlayer(p);
}
export async function getPlayer(id: string): Promise<PlayerProfile | null> {
  if (isMock) return mockStorage.getPlayer(id);
  const { liveStorage } = await import('./storage');
  return liveStorage.getPlayer(id);
}
export async function saveVocab(id: string, items: VocabItem[]): Promise<{ root: string }> {
  if (isMock) return mockStorage.saveVocab(id, items);
  const { liveStorage } = await import('./storage');
  return liveStorage.saveVocab(id, items);
}
export async function getVocab(id: string): Promise<VocabItem[]> {
  if (isMock) return mockStorage.getVocab(id);
  const { liveStorage } = await import('./storage');
  return liveStorage.getVocab(id);
}
export async function saveNPCMemory(m: NPCMemory): Promise<{ root: string }> {
  if (isMock) return mockStorage.saveNPCMemory(m);
  const { liveStorage } = await import('./storage');
  return liveStorage.saveNPCMemory(m);
}
export async function getNPCMemory(npcId: string, playerId: string): Promise<NPCMemory | null> {
  if (isMock) return mockStorage.getNPCMemory(npcId, playerId);
  const { liveStorage } = await import('./storage');
  return liveStorage.getNPCMemory(npcId, playerId);
}
export async function saveSceneTranscript(
  rec: Omit<SceneRecord, 'transcriptStorageRoot' | 'recordHash' | 'anchorTx'>,
  turns: DialogueTurn[],
): Promise<{ root: string; recordHash: string }> {
  if (isMock) return mockStorage.saveSceneTranscript(rec, turns);
  const { liveStorage } = await import('./storage');
  return liveStorage.saveSceneTranscript(rec, turns);
}
export async function getRecords(playerId: string): Promise<SceneRecord[]> {
  if (isMock) return mockStorage.getRecords(playerId);
  const { liveStorage } = await import('./storage');
  return liveStorage.getRecords(playerId);
}
export async function setAnchorTx(playerId: string, recordHash: string, txHash: string): Promise<void> {
  if (isMock) return mockStorage.setAnchor(playerId, recordHash, txHash);
  const { liveStorage } = await import('./storage');
  return liveStorage.setAnchor(playerId, recordHash, txHash);
}

// ---------------- Chain (client-side, user signs) ----------------

export async function anchor(recordHash: string): Promise<{ txHash: string }> {
  if (isMock) return mockChain.anchor(recordHash);
  const { liveChain } = await import('./chain');
  return liveChain.anchor(recordHash);
}
