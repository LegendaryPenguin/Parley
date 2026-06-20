import { NextResponse } from "next/server";
import { judge } from "@/lib/og";
import { buildJudgePrompt } from "@/lib/engine";
import { getScene } from "@/lib/content/world";
import type { ConversationState, DialogueTurn, PlayerProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

interface JudgeBody {
  sceneId: string;
  profile: PlayerProfile;
  turns: DialogueTurn[];
  hintsUsed: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JudgeBody;
    const scene = getScene(body.sceneId);
    if (!scene) return NextResponse.json({ error: "Unknown scene" }, { status: 400 });

    const state: ConversationState = {
      sceneId: body.sceneId,
      turns: body.turns,
      goalMet: false,
      hintsUsed: body.hintsUsed ?? 0,
      fluencyScore: 0,
    };
    const prompt = buildJudgePrompt(state, scene, body.profile);
    const result = await judge(prompt);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "judge failed" },
      { status: 500 },
    );
  }
}
