"use client";

import { create } from "zustand";
import type {
  PlayerProfile,
  VocabItem,
  SceneRecord,
  DialogueTurn,
  JudgeResult,
  CEFR,
  NPCMemory,
} from "@/lib/types";
import {
  savePlayer,
  getPlayer,
  saveVocab,
  getVocab,
  getRecords,
  saveSceneTranscript,
  anchor,
  setAnchorTx,
  getNPCMemory,
  saveNPCMemory,
  isMock,
  isChainMock,
  isRelayer,
} from "@/lib/og";
import { logStorage, logChain } from "@/lib/dev/txlog";
import { getScene } from "@/lib/content/world";
import {
  vocabFromJudge,
  mergeVocab,
  updateSrsOnReview,
  adaptDifficulty,
} from "@/lib/engine";
import { ACTIVE_WALLET_KEY } from "./boot";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface CompleteResult {
  record: SceneRecord;
  newWords: VocabItem[];
}

interface GameState {
  hydrated: boolean;
  profile: PlayerProfile | null;
  vocab: VocabItem[];
  records: SceneRecord[];

  init: (walletId: string) => Promise<void>;
  createProfile: (p: {
    id: string;
    displayName: string;
    avatarId: string;
    targetLanguage: string;
    level: CEFR;
  }) => Promise<void>;
  setLevel: (level: CEFR) => Promise<void>;
  resetJourney: () => void;
  completeScene: (args: {
    sceneId: string;
    startedAt: number;
    turns: DialogueTurn[];
    judge: JudgeResult;
    keyLine?: string;
  }) => Promise<CompleteResult>;
  rememberNPC: (npcId: string, note: string, rapportDelta: number) => Promise<void>;
  reviewWord: (id: string, grade: 0 | 1 | 2) => Promise<void>;
}

export const useGame = create<GameState>((set, get) => ({
  hydrated: false,
  profile: null,
  vocab: [],
  records: [],

  async init(walletId) {
    const [profile, vocab, records] = await Promise.all([
      getPlayer(walletId),
      getVocab(walletId),
      getRecords(walletId),
    ]);
    set({ profile, vocab, records, hydrated: true });
  },

  async createProfile(p) {
    const now = Date.now();
    const profile: PlayerProfile = {
      id: p.id,
      displayName: p.displayName,
      avatarId: p.avatarId,
      targetLanguage: p.targetLanguage,
      level: p.level,
      xp: 0,
      streakDays: 1,
      lastActiveDay: today(),
      visitedSceneIds: [],
      createdAt: now,
      updatedAt: now,
    };
    await savePlayer(profile);
    set({ profile, hydrated: true });
  },

  async setLevel(level) {
    const profile = get().profile;
    if (!profile) return;
    const next = { ...profile, level, updatedAt: Date.now() };
    await savePlayer(next);
    set({ profile: next });
  },

  // Forget the saved traveler so the app returns to Arrival (a fresh journey).
  resetJourney() {
    const id = get().profile?.id;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACTIVE_WALLET_KEY);
      if (id) {
        window.localStorage.removeItem(`pw:player:${id}`);
        window.localStorage.removeItem(`pw:vocab:${id}`);
        window.localStorage.removeItem(`pw:records:${id}`);
      }
    }
    set({ profile: null, vocab: [], records: [], hydrated: true });
  },

  async completeScene({ sceneId, startedAt, turns, judge, keyLine }) {
    const profile = get().profile;
    if (!profile) throw new Error("No profile");
    const now = Date.now();
    const scene = getScene(sceneId);

    // 1. vocab
    const fresh = vocabFromJudge(judge, sceneId, profile.targetLanguage, now, keyLine);
    const vocab = mergeVocab(get().vocab, fresh);
    const trulyNew = fresh.filter((f) => !get().vocab.some((v) => v.id === f.id));

    // 2. transcript -> 0G Storage (mock or live). Fail-safe: if the live upload
    //    fails (wallet not ready / SDK hiccup) we keep the game moving with a
    //    local record rather than blocking the reward.
    const place = scene?.place ?? sceneId;
    const recMeta = {
      sceneId,
      playerId: profile.id,
      startedAt,
      completedAt: now,
      goalMet: judge.goalMet,
      fluencyScore: judge.fluency,
      wordsUsed: judge.newWordsUsed.map((w) => w.term),
      attestation: judge.attestation,
    };
    let root: string;
    let recordHash: string;
    let storedLive = !isMock;
    try {
      ({ root, recordHash } = await saveSceneTranscript(recMeta, turns));
    } catch {
      // live 0G Storage failed → local fallback so completion still succeeds
      const { mockStorage } = await import("@/lib/og/mock-storage");
      ({ root, recordHash } = await mockStorage.saveSceneTranscript(recMeta, turns));
      storedLive = false;
    }
    logStorage(place, root, storedLive);

    // 3. anchor on 0G Chain
    let anchorTx: string | undefined;
    try {
      const res = await anchor(recordHash);
      anchorTx = res.txHash;
      await setAnchorTx(profile.id, recordHash, anchorTx);
      logChain(place, anchorTx, !isChainMock || isRelayer);
    } catch {
      anchorTx = undefined; // anchoring is best-effort; record still saved
    }

    const record: SceneRecord = {
      sceneId,
      playerId: profile.id,
      startedAt,
      completedAt: now,
      goalMet: judge.goalMet,
      fluencyScore: judge.fluency,
      wordsUsed: judge.newWordsUsed.map((w) => w.term),
      transcriptStorageRoot: root,
      recordHash,
      attestation: judge.attestation,
      anchorTx,
    };

    // 4. profile: xp, streak, visited
    const visited = profile.visitedSceneIds.includes(sceneId)
      ? profile.visitedSceneIds
      : [...profile.visitedSceneIds, sceneId];
    const streakDays =
      profile.lastActiveDay === today() ? profile.streakDays : profile.streakDays + 1;
    // adapt CEFR level from how this exchange went (the judge's difficultyHint)
    const { level } = adaptDifficulty(profile, [judge]);
    const nextProfile: PlayerProfile = {
      ...profile,
      level,
      xp: profile.xp + Math.round(judge.fluency / 2) + trulyNew.length * 5,
      streakDays,
      lastActiveDay: today(),
      visitedSceneIds: visited,
      updatedAt: now,
    };

    await Promise.all([savePlayer(nextProfile), saveVocab(profile.id, vocab)]);

    set({
      profile: nextProfile,
      vocab,
      records: [...get().records, record],
    });

    void scene; // reserved for difficulty adaptation hook
    return { record, newWords: trulyNew };
  },

  async rememberNPC(npcId, note, rapportDelta) {
    const profile = get().profile;
    if (!profile) return;
    const existing: NPCMemory | null = await getNPCMemory(npcId, profile.id);
    const mem: NPCMemory = existing ?? {
      npcId,
      playerId: profile.id,
      notes: [],
      rapport: 5,
      lastSeenAt: Date.now(),
    };
    mem.notes = [...mem.notes, note].slice(-6);
    mem.rapport = Math.max(0, Math.min(10, mem.rapport + rapportDelta));
    mem.lastSeenAt = Date.now();
    await saveNPCMemory(mem);
  },

  async reviewWord(id, grade) {
    const profile = get().profile;
    if (!profile) return;
    const now = Date.now();
    const vocab = get().vocab.map((v) => (v.id === id ? updateSrsOnReview(v, grade, now) : v));
    await saveVocab(profile.id, vocab);
    set({ vocab });
  },
}));
