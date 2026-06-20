import { NextResponse } from "next/server";
import { chat } from "@/lib/og";
import { buildNPCSystemPrompt } from "@/lib/engine";
import { getScene, getPersona } from "@/lib/content/world";
import type { ChatMsg, DialogueTurn, NPCMemory, PlayerProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ChatBody {
  sceneId: string;
  profile: PlayerProfile;
  memory: NPCMemory | null;
  turns: DialogueTurn[];
  playerInput: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatBody;
    const scene = getScene(body.sceneId);
    const persona = scene ? getPersona(scene.npcId) : undefined;
    if (!scene || !persona) {
      return NextResponse.json({ error: "Unknown scene" }, { status: 400 });
    }

    const system = buildNPCSystemPrompt(persona, scene, body.profile, body.memory);
    const history: ChatMsg[] = body.turns
      .filter((t) => t.role === "npc" || t.role === "player")
      .map((t) => ({
        role: t.role === "npc" ? ("assistant" as const) : ("user" as const),
        content: t.textTarget ?? t.textNative ?? "",
      }));

    const messages: ChatMsg[] = [
      { role: "system", content: system },
      ...history,
      { role: "user", content: body.playerInput },
    ];

    const { text, attestation } = await chat(messages, { temperature: 0.7 });
    return NextResponse.json({ text, attestation });
  } catch (err) {
    // In-world error (Brief §4.7) is rendered client-side; keep API honest.
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "chat failed" },
      { status: 500 },
    );
  }
}
