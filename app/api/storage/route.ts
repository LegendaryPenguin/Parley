import { NextResponse } from "next/server";
import { relayerConfigured, relayerUploadTranscript } from "@/lib/og/relayer";
import type { DialogueTurn, SceneRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Relayer storage upload — the server signs the 0G Storage upload with the host's
// funded testnet key, so visitors get a real encrypted transcript root with no wallet.
export async function POST(request: Request) {
  try {
    if (!relayerConfigured()) {
      return NextResponse.json({ error: "relayer not configured" }, { status: 503 });
    }
    const body = (await request.json()) as {
      rec: Omit<SceneRecord, "transcriptStorageRoot" | "recordHash" | "anchorTx">;
      turns: DialogueTurn[];
    };
    const out = await relayerUploadTranscript(body.rec, body.turns);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "storage upload failed" },
      { status: 500 },
    );
  }
}
