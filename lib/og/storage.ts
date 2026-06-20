import type { PlayerProfile, VocabItem, NPCMemory, SceneRecord, DialogueTurn } from '@/lib/types';

// LIVE 0G Storage (client-side, user's wallet, encrypt-to-self).
//
// TODO(§10): verify the exact package name + API from the current storage
// starter kit — the ecosystem has shipped under both @0glabs/* and
// @0gfoundation/*. Maintain a per-player manifest (latest profile/vocab/record
// roots) keyed by wallet address, and read everything through it.
//
// Until wired, these throw so we never silently pretend. OG_MODE=mock is the
// default and routes around this entirely.

const NOT_WIRED = '0G Storage not wired yet — set OG_MODE=mock or implement lib/og/storage.ts (§10)';

export const liveStorage = {
  async savePlayer(_p: PlayerProfile): Promise<{ root: string }> {
    throw new Error(NOT_WIRED);
  },
  async getPlayer(_id: string): Promise<PlayerProfile | null> {
    throw new Error(NOT_WIRED);
  },
  async saveVocab(_id: string, _items: VocabItem[]): Promise<{ root: string }> {
    throw new Error(NOT_WIRED);
  },
  async getVocab(_id: string): Promise<VocabItem[]> {
    throw new Error(NOT_WIRED);
  },
  async saveNPCMemory(_m: NPCMemory): Promise<{ root: string }> {
    throw new Error(NOT_WIRED);
  },
  async getNPCMemory(_npcId: string, _playerId: string): Promise<NPCMemory | null> {
    throw new Error(NOT_WIRED);
  },
  async saveSceneTranscript(
    _rec: Omit<SceneRecord, 'transcriptStorageRoot' | 'recordHash' | 'anchorTx'>,
    _turns: DialogueTurn[],
  ): Promise<{ root: string; recordHash: string }> {
    throw new Error(NOT_WIRED);
  },
  async getRecords(_playerId: string): Promise<SceneRecord[]> {
    throw new Error(NOT_WIRED);
  },
  async setAnchor(_playerId: string, _recordHash: string, _txHash: string): Promise<void> {
    throw new Error(NOT_WIRED);
  },
};
