"use client";

import type {
  DialogueTurn,
  JudgeResult,
  NPCMemory,
  PlayerProfile,
  ProviderAttestation,
} from "@/lib/types";
import { logCompute } from "@/lib/dev/txlog";

// Thin client wrappers over the server compute routes. The browser never holds
// the 0G Router key — these POST to /api/* which proxies lib/og.

function noteCompute(label: string, a?: ProviderAttestation) {
  if (!a) return;
  logCompute(label, a.signature, a.model, !!a.provider?.startsWith("0G Compute ·"));
}

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
  const data = await res.json();
  noteCompute("NPC turn", data.attestation);
  return data;
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
  const data = (await res.json()) as JudgeResult;
  noteCompute("Judge", data.attestation);
  return data;
}
