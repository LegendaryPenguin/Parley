"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store/useGame";
import { useBoot } from "@/lib/store/boot";
import { scheduleReview } from "@/lib/engine";
import { SCENES } from "@/lib/content/world";
import { SplitFlap } from "@/components/design/SplitFlap";
import { GhostButton, PrimaryButton } from "@/components/design/ui";
import type { Mastery, VocabItem } from "@/lib/types";

const MASTERY_COLOR: Record<Mastery, string> = {
  new: "var(--riso-pink)",
  learning: "var(--marigold)",
  known: "var(--riso-blue)",
  mastered: "var(--pine)",
};

export default function Phrasebook() {
  const router = useRouter();
  const { hydrated, profile } = useBoot();
  const vocab = useGame((s) => s.vocab);
  const reviewWord = useGame((s) => s.reviewWord);
  const [filter, setFilter] = useState<string>("all");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  const due = useMemo(() => scheduleReview(vocab, Date.now()), [vocab]);
  const places = useMemo(
    () => Array.from(new Set(vocab.map((v) => v.learnedSceneId))),
    [vocab],
  );
  const shown = filter === "all" ? vocab : vocab.filter((v) => v.learnedSceneId === filter);

  if (!hydrated || !profile) {
    return <main className="min-h-screen grid place-items-center"><SplitFlap text="PHRASEBOOK" size="1.5rem" /></main>;
  }

  if (reviewing) {
    return <ReviewSession due={due} onGrade={reviewWord} onDone={() => setReviewing(false)} />;
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-5 py-6">
      <header className="flex items-center justify-between mb-5">
        <div>
          <Link href="/atlas" className="label-mono">← Atlas</Link>
          <h1 className="font-display text-3xl mt-1">Phrasebook · {vocab.length} words</h1>
        </div>
        {due.length > 0 && (
          <PrimaryButton color="var(--riso-pink)" onClick={() => setReviewing(true)}>
            Revisit ({due.length})
          </PrimaryButton>
        )}
      </header>

      {vocab.length === 0 ? (
        <div className="border-2 border-dashed border-ink/40 rounded-sm p-8 text-center">
          <p className="font-read italic text-ink-soft">
            Your phrasebook is empty. The market is the place to collect your first words.
          </p>
          <div className="mt-4">
            <GhostButton onClick={() => router.push("/atlas")}>Go to the Atlas</GhostButton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
            {places.map((p) => (
              <FilterChip key={p} label={SCENES[p]?.place ?? p} active={filter === p} onClick={() => setFilter(p)} />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shown.map((v) => (
              <VocabCard key={v.id} item={v} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`label-mono px-3 py-1 rounded-sm border-2 border-ink ${active ? "bg-ink text-paper" : "bg-paper"}`}
    >
      {label}
    </button>
  );
}

function VocabCard({ item }: { item: VocabItem }) {
  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(item.term);
    u.lang = "es-ES";
    window.speechSynthesis.speak(u);
  }
  return (
    <motion.button
      onClick={speak}
      whileHover={{ y: -3 }}
      className="text-left border-2 border-ink rounded-sm p-3 bg-paper relative overflow-hidden"
      style={{ boxShadow: "3px 3px 0 var(--paper-deep)" }}
      title="Tap to hear it"
    >
      <p className="target-lang text-riso-blue text-xl leading-tight">{item.term}</p>
      <p className="font-read text-ink-soft">{item.meaning}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="label-mono text-ink/50">◇ {SCENES[item.learnedSceneId]?.place ?? item.learnedSceneId}</span>
        <span className="label-mono" style={{ color: MASTERY_COLOR[item.mastery] }}>
          {item.mastery}
        </span>
      </div>
    </motion.button>
  );
}

function ReviewSession({
  due,
  onGrade,
  onDone,
}: {
  due: VocabItem[];
  onGrade: (id: string, grade: 0 | 1 | 2) => void;
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = due[idx];

  function grade(g: 0 | 1 | 2) {
    onGrade(card.id, g);
    if (idx + 1 >= due.length) onDone();
    else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  }

  if (!card) {
    return (
      <main className="min-h-screen grid place-items-center text-center px-6">
        <div>
          <p className="font-display text-2xl">Nothing due — you&apos;re all caught up.</p>
          <button onClick={onDone} className="label-mono underline mt-3">Back to phrasebook</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="label-mono text-riso-pink mb-4">Revisit · {idx + 1} / {due.length}</p>
        <motion.button
          key={card.id + String(flipped)}
          onClick={() => setFlipped(true)}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className="w-full border-2 border-ink rounded-sm p-10 bg-paper"
          style={{ boxShadow: "4px 4px 0 var(--riso-blue)" }}
        >
          {!flipped ? (
            <p className="target-lang text-riso-blue text-3xl">{card.term}</p>
          ) : (
            <p className="font-read text-2xl">{card.meaning}</p>
          )}
          {!flipped && <p className="label-mono text-ink/40 mt-4">tap to flip</p>}
        </motion.button>

        {flipped && (
          <div className="flex gap-2 justify-center mt-5">
            <GhostButton onClick={() => grade(0)}>Forgot</GhostButton>
            <GhostButton onClick={() => grade(1)}>OK</GhostButton>
            <PrimaryButton color="var(--pine)" onClick={() => grade(2)}>Easy</PrimaryButton>
          </div>
        )}
        <button onClick={onDone} className="label-mono underline mt-6 block mx-auto">End review</button>
      </div>
    </main>
  );
}
