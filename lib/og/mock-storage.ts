import type { PlayerProfile, VocabItem, NPCMemory, SceneRecord, DialogueTurn } from '@/lib/types';

// Mock 0G Storage + Chain. Client-side: localStorage. Server/SSR: in-memory.
// Roots/hashes are deterministic-ish fakes so the Passport shows plausible refs.

const memStore = new Map<string, string>();

function read(key: string): string | null {
  if (typeof window !== 'undefined') return window.localStorage.getItem(key);
  return memStore.get(key) ?? null;
}
function write(key: string, val: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, val);
  else memStore.set(key, val);
}

// Cheap deterministic 0x hash (FNV-1a-ish) — stands in for a content root.
function fakeRoot(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return '0x' + hex + seed.length.toString(16).padStart(4, '0') + 'mock';
}

const K = {
  player: (id: string) => `pw:player:${id}`,
  vocab: (id: string) => `pw:vocab:${id}`,
  npcMem: (npc: string, pid: string) => `pw:npcmem:${npc}:${pid}`,
  records: (id: string) => `pw:records:${id}`,
};

export const mockStorage = {
  async savePlayer(p: PlayerProfile) {
    write(K.player(p.id), JSON.stringify(p));
    return { root: fakeRoot('player' + p.id + p.updatedAt) };
  },
  async getPlayer(id: string): Promise<PlayerProfile | null> {
    const raw = read(K.player(id));
    return raw ? (JSON.parse(raw) as PlayerProfile) : null;
  },
  async saveVocab(id: string, items: VocabItem[]) {
    write(K.vocab(id), JSON.stringify(items));
    return { root: fakeRoot('vocab' + id + items.length) };
  },
  async getVocab(id: string): Promise<VocabItem[]> {
    const raw = read(K.vocab(id));
    return raw ? (JSON.parse(raw) as VocabItem[]) : [];
  },
  async saveNPCMemory(m: NPCMemory) {
    write(K.npcMem(m.npcId, m.playerId), JSON.stringify(m));
    return { root: fakeRoot('npc' + m.npcId + m.playerId) };
  },
  async getNPCMemory(npcId: string, playerId: string): Promise<NPCMemory | null> {
    const raw = read(K.npcMem(npcId, playerId));
    return raw ? (JSON.parse(raw) as NPCMemory) : null;
  },
  async saveSceneTranscript(
    rec: Omit<SceneRecord, 'transcriptStorageRoot' | 'recordHash' | 'anchorTx'>,
    turns: DialogueTurn[],
  ) {
    const root = fakeRoot('tx' + rec.sceneId + rec.completedAt + turns.length);
    const recordHash = fakeRoot('hash' + root + rec.fluencyScore);
    // append to player's record list
    const listRaw = read(K.records(rec.playerId));
    const list: SceneRecord[] = listRaw ? JSON.parse(listRaw) : [];
    const full: SceneRecord = { ...rec, transcriptStorageRoot: root, recordHash };
    list.push(full);
    write(K.records(rec.playerId), JSON.stringify(list));
    return { root, recordHash };
  },
  async getRecords(playerId: string): Promise<SceneRecord[]> {
    const raw = read(K.records(playerId));
    return raw ? (JSON.parse(raw) as SceneRecord[]) : [];
  },
  // Append a fully-formed record (used by live storage, which supplies a real
  // 0G Storage root + keccak hash instead of the mock fakes).
  async appendRecord(rec: SceneRecord) {
    const raw = read(K.records(rec.playerId));
    const list: SceneRecord[] = raw ? JSON.parse(raw) : [];
    list.push(rec);
    write(K.records(rec.playerId), JSON.stringify(list));
  },
  async setAnchor(playerId: string, recordHash: string, txHash: string) {
    const raw = read(K.records(playerId));
    if (!raw) return;
    const list: SceneRecord[] = JSON.parse(raw);
    const rec = list.find((r) => r.recordHash === recordHash);
    if (rec) rec.anchorTx = txHash;
    write(K.records(playerId), JSON.stringify(list));
  },
};

export const mockChain = {
  async anchor(recordHash: string) {
    // Fake but plausible 0G Chain tx hash.
    return { txHash: fakeRoot('anchor' + recordHash).replace('mock', 'e4a1') };
  },
};
