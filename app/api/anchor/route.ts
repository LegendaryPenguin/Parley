import { NextResponse } from "next/server";
import { relayerConfigured, relayerAnchor } from "@/lib/og/relayer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Relayer anchor — the server signs the on-chain keccak256(recordHash) tx with the
// host's funded testnet key, so visitors get a real Galileo anchor tx with no wallet.
export async function POST(request: Request) {
  try {
    if (!relayerConfigured()) {
      return NextResponse.json({ error: "relayer not configured" }, { status: 503 });
    }
    const { recordHash } = (await request.json()) as { recordHash: string };
    if (!recordHash) return NextResponse.json({ error: "no recordHash" }, { status: 400 });
    const out = await relayerAnchor(recordHash);
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "anchor failed" },
      { status: 500 },
    );
  }
}
