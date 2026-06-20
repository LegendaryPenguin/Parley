"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { PlayerProfile } from "@/lib/types";
import { LANGUAGES } from "@/lib/content/world";
import { PixelBadge } from "@/components/design/Playful";

// Tactile passport tab shown in the Atlas corner — level, streak, words, flag.
// A little ink-outlined booklet you can press; the level rides a pixel-badge,
// the streak flickers, the flag thunks into the corner like a fresh stamp.
export function PassportTab({ profile, wordCount }: { profile: PlayerProfile; wordCount: number }) {
  const flag = LANGUAGES.find((l) => l.code === profile.targetLanguage)?.flag ?? "··";
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="inline-block"
      initial={false}
      animate={{ rotate: reduce ? 0 : -1 }}
      whileHover={reduce ? undefined : { rotate: 0, y: -3 }}
      whileTap={reduce ? undefined : { y: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Link
        href="/passport"
        aria-label={`Open passport — level ${profile.level}, ${profile.streakDays} day streak, ${wordCount} words`}
        className="group relative flex items-center gap-2.5 bg-paper-deep border-[3px] border-ink rounded-md pl-2 pr-3 py-1.5 min-h-[44px] outline-none focus-visible:ring-4 focus-visible:ring-grape/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        style={{ boxShadow: "3px 3px 0 var(--ink)" }}
      >
        {/* page-corner peel — a little dog-eared bookmark that lifts on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-[3px] -right-[3px] h-3 w-3 rounded-bl-md border-l-2 border-b-2 border-ink bg-marigold overprint transition-all duration-200 group-hover:h-4 group-hover:w-4"
          style={{ borderTopRightRadius: "0.25rem" }}
        />

        {/* level on its own pixel badge — the proudest stat, gives a little pop on hover */}
        <motion.span
          className="inline-block"
          whileHover={reduce ? undefined : { scale: 1.08, rotate: -3 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          <PixelBadge color="var(--indigo)" className="!px-2 !py-1 text-[9px] leading-none">
            {profile.level}
          </PixelBadge>
        </motion.span>

        {/* streak — flame that flickers, words right under it */}
        <span className="flex flex-col items-start leading-none">
          <span className="flex items-center gap-0.5 text-pine">
            <motion.span
              aria-hidden
              animate={reduce ? undefined : { rotate: [-4, 5, -4], scale: [1, 1.12, 1] }}
              transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-sm origin-bottom"
            >
              🔥
            </motion.span>
            <span className="font-display font-bold text-ink text-sm tabular-nums">{profile.streakDays}</span>
          </span>
          <span className="label-mono text-[8px] text-ink-soft mt-0.5">
            {wordCount} <span className="text-riso-blue">words</span>
          </span>
        </span>

        {/* flag — thunks into the corner like a fresh stamp when you reach for it */}
        <motion.span
          className="relative ml-0.5 grid place-items-center w-8 h-8 rounded-full border-2 border-ink bg-bubble overprint"
          initial={false}
          animate={{ rotate: reduce ? 0 : 6 }}
          whileHover={
            reduce
              ? undefined
              : { rotate: [6, -8, 0], scale: [1, 1.18, 1.1], transition: { duration: 0.45, ease: "easeOut" } }
          }
        >
          {/* faint stamp ring that blooms outward on hover — the "ka-chunk" */}
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-ink"
              initial={{ opacity: 0, scale: 1 }}
              whileHover={{ opacity: [0.5, 0], scale: [1, 1.6], transition: { duration: 0.5, ease: "easeOut" } }}
            />
          )}
          <span className="target-lang text-base" aria-hidden>{flag}</span>
        </motion.span>
      </Link>
    </motion.div>
  );
}
