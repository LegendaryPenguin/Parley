"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { Postcard } from "@/components/design/Postcard";
import { PrimaryButton, GhostButton } from "@/components/design/ui";
import { Confetti, PixelBadge } from "@/components/design/Playful";
import type { JudgeResult, VocabItem } from "@/lib/types";

// A printed sunburst that flares behind the big beats — pure retro-arcade joy.
// Keeps slowly spinning for a hypnotic, kid-pleasing shimmer (stilled under reduced motion).
function Sunburst({ color = "var(--marigold)" }: { color?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 200 200"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: 380, height: 380, color }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
      animate={
        reduce
          ? { opacity: 0.18 }
          : { opacity: 0.22, scale: 1, rotate: 360 }
      }
      transition={
        reduce
          ? { duration: 0.4 }
          : {
              opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              rotate: { duration: 22, ease: "linear", repeat: Infinity },
            }
      }
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <rect
          key={i}
          x="98"
          y="0"
          width="4"
          height="100"
          fill="currentColor"
          transform={`rotate(${i * 15} 100 100)`}
        />
      ))}
    </motion.svg>
  );
}

// Success sequence: words flip into the phrasebook → stamp slams → postcard.
export function RewardSequence({
  sceneId,
  place,
  judge,
  newWords,
  keyLine,
  keyLineMeaning,
}: {
  sceneId: string;
  place: string;
  judge: JudgeResult;
  newWords: VocabItem[];
  keyLine: string;
  keyLineMeaning?: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"words" | "stamp" | "postcard">("words");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stamp"), Math.max(1400, newWords.length * 550 + 600));
    const t2 = setTimeout(() => setPhase("postcard"), Math.max(1400, newWords.length * 550 + 600) + 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [newWords.length]);

  // The whole stage flashes white and jolts when the stamp lands — a felt
  // "THWACK" you can't ignore. Driven off the phase so it fires exactly on impact.
  const slam = phase === "stamp" && !reduce;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 grid place-items-center bg-ink/50 backdrop-blur-md px-6"
    >
      {/* Full-screen confetti curtain — the euphoria runs the whole way through. */}
      <Confetti count={40} />

      {/* Camera-flash bloom on impact: the entire screen pops bright for a frame
          as the stamp slams home. Pure light, never blocks taps; off under reduced motion. */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{ background: "var(--paper)" }}
          initial={{ opacity: 0 }}
          animate={slam ? { opacity: [0, 0.55, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5, times: [0, 0.12, 1], ease: "easeOut" }}
        />
      )}

      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.9, y: 18, opacity: 0 }}
        animate={
          reduce
            ? { opacity: 1 }
            : slam
              ? // page shake: a sharp recoil + settle the instant the stamp hits.
                { scale: 1, y: 0, opacity: 1, x: [0, -10, 11, -7, 4, 0], rotate: [0, -1.5, 1.2, -0.6, 0] }
              : { scale: 1, y: 0, opacity: 1, x: 0, rotate: 0 }
        }
        transition={
          reduce
            ? { duration: 0.25 }
            : slam
              ? { duration: 0.5, ease: "easeOut" }
              : { type: "spring", stiffness: 260, damping: 22 }
        }
        role="dialog"
        aria-modal="true"
        aria-label="Reward earned"
        className="wash-joy grain border-2 border-ink rounded-sm p-4 sm:p-6 w-[90vw] sm:max-w-md text-center relative overflow-hidden shadow-[10px_10px_0_var(--ink)]"
      >
        <div className="absolute inset-0 halftone text-marigold opacity-10 pointer-events-none" aria-hidden />

        <AnimatePresence mode="wait">
          {phase === "words" && (
            <motion.div key="words" exit={{ opacity: 0, y: -10 }} className="relative">
              <div className="flex justify-center mb-3">
                <PixelBadge color="var(--pine)" className="font-pixel text-[9px]">
                  NAILED IT · {judge.fluency}
                </PixelBadge>
              </div>
              <h2 className="font-display font-extrabold text-3xl text-indigo leading-tight mb-1">
                You earned these
              </h2>
              <p className="font-read italic text-ink-soft mb-5">tucking them into your phrasebook…</p>

              <div className="space-y-2.5">
                {newWords.length === 0 && (
                  <p className="font-read italic text-ink-soft">
                    No new words this time — but the stamp is yours.
                  </p>
                )}
                {newWords.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -90, y: -8 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, rotateX: 0, y: 0 }}
                    transition={
                      reduce
                        ? { delay: i * 0.12, duration: 0.25 }
                        : { delay: i * 0.5, type: "spring", stiffness: 240, damping: 16 }
                    }
                    style={{ transformPerspective: 600, transformOrigin: "top" }}
                    // A satisfying little spring-wobble when a kid pokes a word.
                    whileHover={reduce ? undefined : { scale: 1.03, rotate: -1 }}
                    whileTap={reduce ? undefined : { scale: 0.97, rotate: 1 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 border-2 border-ink rounded-sm px-3.5 py-2.5 bg-paper overprint shadow-[3px_3px_0_var(--ink)] cursor-default select-none"
                  >
                    <span className="target-lang text-riso-blue text-base sm:text-lg font-bold w-full min-w-0 break-words">
                      {w.term}
                    </span>
                    <span className="font-read text-ink w-full sm:w-auto text-left sm:text-right min-w-0 break-words">{w.meaning}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "stamp" && (
            <motion.div
              key="stamp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="relative py-8"
            >
              <Sunburst color="var(--marigold)" />
              {/* The biggest confetti dump in the app — this is the moment. */}
              <Confetti count={48} />
              <p className="label-mono text-coral mb-4 relative">Passport stamped!</p>
              <div className="relative grid place-items-center">
                {/* Ink-bloom shockwave: a coral ring rips outward from the strike point,
                    so the stamp reads as truly slammed. Reduced-motion safe (skipped). */}
                {!reduce && (
                  <>
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute z-0 rounded-full overprint"
                      style={{ width: 186, height: 186, background: "var(--coral)" }}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: [0.3, 2.1], opacity: [0.5, 0] }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.04 }}
                    />
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute z-0 rounded-full"
                      style={{ width: 186, height: 186, border: "3px solid var(--marigold)" }}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: [0.4, 2.6], opacity: [0.7, 0] }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                    />
                  </>
                )}
                <Stamp label={place} sublabel="VISITED" color="var(--coral)" size={186} />
              </div>
              <motion.p
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="font-display font-extrabold text-pine text-xl mt-4 relative inline-flex items-center justify-center gap-1.5 flex-wrap"
              >
                {/* A little hand that waves hello to the new place — kids adore it. */}
                <motion.span
                  aria-hidden
                  className="inline-block origin-bottom-right"
                  animate={reduce ? undefined : { rotate: [0, 18, -8, 14, 0] }}
                  transition={reduce ? undefined : { delay: 0.7, duration: 0.9, ease: "easeInOut" }}
                >
                  👋
                </motion.span>
                One more place that knows your name.
              </motion.p>
            </motion.div>
          )}

          {phase === "postcard" && (
            <motion.div
              key="postcard"
              initial={reduce ? { opacity: 0 } : { opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1 }}
              transition={reduce ? { duration: 0.25 } : { duration: 0.3 }}
              className="relative"
            >
              {/* One more celebratory pop as the share artifact arrives. */}
              <Confetti count={28} />
              <div className="flex items-center justify-center gap-2 mb-4 relative">
                <span className="label-mono text-grape">Postcard from</span>
                <SplitFlap text={place} size="1.3rem" />
              </div>
              {/* The postcard PRINTS IN: it slides up out of the press, overshoots,
                  then presses flat — a fresh sheet hitting the tray. A sheen sweeps
                  across the wet ink. Reduced motion: a calm fade, no travel. */}
              <motion.div
                className="relative"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 90, scaleY: 0.78, rotate: -2 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scaleY: 1, rotate: 0 }}
                transition={
                  reduce ? { duration: 0.3 } : { type: "spring", stiffness: 200, damping: 17, mass: 0.9 }
                }
                style={{ transformOrigin: "bottom" }}
              >
                <Postcard
                  sceneId={sceneId}
                  place={place}
                  keyLine={keyLine}
                  lineMeaning={keyLineMeaning}
                  fluency={judge.fluency}
                />
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
                  >
                    <motion.span
                      className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                      }}
                      initial={{ x: "0%" }}
                      animate={{ x: "320%" }}
                      transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
                    />
                  </motion.span>
                )}
              </motion.div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <PrimaryButton color="var(--coral)" onClick={() => router.push("/atlas")}>
                  Back to the Atlas
                </PrimaryButton>
                <GhostButton onClick={() => router.push("/passport")}>See passport</GhostButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
