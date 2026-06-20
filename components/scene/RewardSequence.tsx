"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { Postcard } from "@/components/design/Postcard";
import { PrimaryButton, GhostButton } from "@/components/design/ui";
import type { JudgeResult, VocabItem } from "@/lib/types";

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
  const [phase, setPhase] = useState<"words" | "stamp" | "postcard">("words");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stamp"), Math.max(1400, newWords.length * 550 + 600));
    const t2 = setTimeout(() => setPhase("postcard"), Math.max(1400, newWords.length * 550 + 600) + 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [newWords.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 grid place-items-center bg-ink/40 backdrop-blur-sm px-6"
    >
      <div className="bg-paper border-2 border-ink rounded-sm p-6 max-w-md w-full text-center relative">
        <div className="absolute inset-0 halftone text-marigold opacity-10 pointer-events-none" />
        <AnimatePresence mode="wait">
          {phase === "words" && (
            <motion.div key="words" exit={{ opacity: 0 }} className="relative">
              <p className="label-mono text-pine">Goal met · fluency {judge.fluency}</p>
              <h2 className="font-display text-2xl mt-1 mb-4">Words collected</h2>
              <div className="space-y-2">
                {newWords.length === 0 && (
                  <p className="font-read italic text-ink-soft">No new words this time — but the stamp is yours.</p>
                )}
                {newWords.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ delay: i * 0.5, type: "spring", stiffness: 200 }}
                    className="flex items-center justify-between border-2 border-ink rounded-sm px-3 py-2 bg-paper-deep"
                  >
                    <span className="target-lang text-riso-blue text-lg">{w.term}</span>
                    <span className="font-read text-ink-soft">{w.meaning}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "stamp" && (
            <motion.div
              key="stamp"
              animate={{ x: [0, -6, 6, -3, 0] }}
              transition={{ duration: 0.4 }}
              className="relative py-6"
            >
              <p className="label-mono text-marigold mb-3">Passport stamped</p>
              <div className="grid place-items-center">
                <Stamp label={place} sublabel="VISITED" color="var(--marigold)" size={180} />
              </div>
            </motion.div>
          )}

          {phase === "postcard" && (
            <motion.div key="postcard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative">
              <SplitFlap text={place} size="1.4rem" className="justify-center mb-3" />
              <Postcard
                sceneId={sceneId}
                place={place}
                keyLine={keyLine}
                lineMeaning={keyLineMeaning}
                fluency={judge.fluency}
              />
              <div className="flex gap-3 justify-center mt-5">
                <PrimaryButton color="var(--riso-pink)" onClick={() => router.push("/atlas")}>
                  Back to the Atlas
                </PrimaryButton>
                <GhostButton onClick={() => router.push("/passport")}>See passport</GhostButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
