import { NextResponse } from "next/server";
import { chat } from "@/lib/og";
import { langName } from "@/lib/engine";

export const dynamic = "force-dynamic";

// Translate an arbitrary target-language line to English via 0G Compute. Used as
// the tap-to-translate fallback for live lines not in a canned script map.
export async function POST(request: Request) {
  try {
    const { text, lang } = (await request.json()) as { text: string; lang: string };
    if (!text) return NextResponse.json({ error: "no text" }, { status: 400 });
    const { text: out } = await chat(
      [
        {
          role: "system",
          content: `You are a translator. Translate the ${langName(lang)} text to natural English. Return ONLY the translation, no quotes, no notes.`,
        },
        { role: "user", content: text },
      ],
      { temperature: 0 },
    );
    return NextResponse.json({ translation: out.trim() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "translate failed" },
      { status: 500 },
    );
  }
}
