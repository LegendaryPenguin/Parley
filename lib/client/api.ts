"use client";

import type {
  DialogueTurn,
  JudgeResult,
  NPCMemory,
  PlayerProfile,
  ProviderAttestation,
} from "@/lib/types";

// Thin client wrappers over the server compute routes. The browser never holds
// the 0G Router key — these POST to /api/* which proxies lib/og.

export async function chatTurn(args: {
  sceneId: string;
  profile: PlayerProfile;
  memory: NPCMemory | null;
  turns: DialogueTurn[];
  playerInput: string;
}): Promise<{ text: string; attestation?: ProviderAttestation }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "chat failed" }));
    throw new Error(error);
  }
  return res.json();
}

export async function judgeExchange(args: {
  sceneId: string;
  profile: PlayerProfile;
  turns: DialogueTurn[];
  hintsUsed: number;
}): Promise<JudgeResult> {
  const res = await fetch("/api/judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "judge failed" }));
    throw new Error(error);
  }
  return res.json();
}
