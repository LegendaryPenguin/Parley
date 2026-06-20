"use client";

import Link from "next/link";
import type { PlayerProfile } from "@/lib/types";
import { LANGUAGES } from "@/lib/content/world";

// Tactile passport tab shown in the Atlas corner — level, streak, words, flag.
export function PassportTab({ profile, wordCount }: { profile: PlayerProfile; wordCount: number }) {
  const flag = LANGUAGES.find((l) => l.code === profile.targetLanguage)?.flag ?? "··";
  return (
    <Link
      href="/passport"
      className="group inline-flex items-center gap-3 bg-ink text-paper px-3 py-2 rounded-sm hover:-translate-y-0.5 transition-transform"
      style={{ boxShadow: "3px 3px 0 var(--riso-blue)" }}
    >
      <span className="label-mono text-marigold">{profile.level}</span>
      <span className="label-mono">🔥{profile.streakDays}</span>
      <span className="label-mono">{wordCount} words</span>
      <span className="label-mono text-riso-pink">{flag}</span>
    </Link>
  );
}
