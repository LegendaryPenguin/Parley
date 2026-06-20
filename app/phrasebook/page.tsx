"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useGame } from "@/lib/store/useGame";
import { useBoot } from "@/lib/store/boot";
import { scheduleReview } from "@/lib/engine";
import { SCENES } from "@/lib/content/world";
import { SplitFlap } from "@/components/design/SplitFlap";
import { GhostButton, PrimaryButton } from "@/components/design/ui";
import { Confetti, FloatingShapes, PixelBadge } from "@/components/design/Playful";
import { NPCPortrait } from "@/components/design/RisoIllustration";
import { SpeakerIcon, StarIcon } from "@/components/design/Icons";
import type { LanguageCode, Mastery, VocabItem } from "@/lib/types";

// Speak each word in the voice of the language being learned, not always Spanish.
// Falls back to es-ES for any language the browser/profile doesn't cover.
const SPEECH_LANG: Record<string, string> = {
  es: "es-ES",
  fr: "fr-FR",
  ja: "ja-JP",
  de: "de-DE",
};
function speechTag(lang?: LanguageCode): string {
  return (lang && SPEECH_LANG[lang]) || "es-ES";
}

const MASTERY_COLOR: Record<Mastery, string> = {
  new: "var(--riso-pink)",
  learning: "var(--marigold)",
  known: "var(--riso-blue)",
  mastered: "var(--pine)",
};

// Each mastery tier gets a collectible feel: a label the traveler earns,
// a little stamp glyph, and a position on the 4-pip mastery meter.
const MASTERY_META: Record<Mastery, { label: string; glyph: string; pips: number }> = {
  new: { label: "Just spotted", glyph: "✦", pips: 1 },
  learning: { label: "Warming up", glyph: "◐", pips: 2 },
  known: { label: "In your pocket", glyph: "◆", pips: 3 },
  mastered: { label: "Mastered", glyph: "★", pips: 4 },
};

const MASTERY_ORDER: Mastery[] = ["new", "learning", "known", "mastered"];

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

  // Collection progress — how many cards are fully mastered (the "complete the set" hook).
  const masteredCount = useMemo(() => vocab.filter((v) => v.mastery === "mastered").length, [vocab]);
  const pct = vocab.length ? Math.round((masteredCount / vocab.length) * 100) : 0;

  if (!hydrated || !profile) {
    return <main className="min-h-screen grid place-items-center"><SplitFlap text="PHRASEBOOK" size="1.5rem" /></main>;
  }

  if (reviewing) {
    return (
      <ReviewSession
        due={due}
        lang={profile.targetLanguage}
        onGrade={reviewWord}
        onDone={() => setReviewing(false)}
      />
    );
  }

  return (
    <main className="relative min-h-screen max-w-3xl mx-auto px-5 py-6">
      <FloatingShapes />

      <header className="relative z-10 mb-5">
        <Link href="/atlas" className="label-mono inline-flex items-center gap-1 hover:text-riso-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue rounded-sm">
          ← Atlas
        </Link>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl leading-none text-indigo">Your Sticker Book</h1>
            <p className="font-read italic text-ink-soft mt-1">
              {vocab.length === 0
                ? "Empty for now — go fill it with words you can taste."
                : `${vocab.length} words pocketed across the world.`}
            </p>
          </div>
          {due.length > 0 && (
            <PrimaryButton color="var(--riso-pink)" onClick={() => setReviewing(true)}>
              Revisit ({due.length})
            </PrimaryButton>
          )}
        </div>

        {vocab.length > 0 && (
          <CollectionMeter total={vocab.length} mastered={masteredCount} pct={pct} />
        )}
      </header>

      {vocab.length === 0 ? (
        <div className="relative z-10 grain overflow-hidden border-2 border-dashed border-ink/50 rounded-sm px-5 py-10 sm:p-12 text-center bg-paper/80">
          <FloatingShapes />
          <div className="relative z-10 flex flex-col items-center">
            <div className="float-bob" aria-hidden>
              <NPCPortrait npcId="vendor-market" name="Rosa" />
            </div>
            <PixelBadge color="var(--riso-pink)" className="font-pixel text-[0.6rem] mt-2 mb-3">
              YOUR SET AWAITS
            </PixelBadge>
            <h2 className="font-display text-2xl sm:text-3xl text-indigo leading-tight">
              Your sticker book is hungry for words!
            </h2>
            <p className="font-read italic text-ink-soft max-w-sm mx-auto mt-2">
              Wander into the market, strike up a chat with a stallholder, and every new word you
              taste comes home as a shiny sticker right here.
            </p>
            <div className="mt-6">
              <PrimaryButton color="var(--marigold)" onClick={() => router.push("/atlas")}>
                Go collect your first word →
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <FilterChip label="All" count={vocab.length} active={filter === "all"} onClick={() => setFilter("all")} />
            {places.map((p) => (
              <FilterChip
                key={p}
                label={SCENES[p]?.place ?? p}
                count={vocab.filter((v) => v.learnedSceneId === p).length}
                active={filter === p}
                onClick={() => setFilter(p)}
              />
            ))}
          </div>
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {shown.map((v, i) => (
                <VocabCard key={v.id} item={v} index={i} lang={profile.targetLanguage} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </main>
  );
}

// The "complete the set" meter — a fun progress bar with a roaming pin.
// When every word is mastered it becomes a celebration: confetti + a spinning medal.
function CollectionMeter({ total, mastered, pct }: { total: number; mastered: number; pct: number }) {
  const complete = mastered === total;
  const reduce = useReducedMotion();
  // Fire the confetti burst once, the moment the set is completed.
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    if (!complete) {
      setBurst(false);
      return;
    }
    setBurst(true);
    const t = window.setTimeout(() => setBurst(false), 1600);
    return () => window.clearTimeout(t);
  }, [complete]);

  return (
    <div
      className="relative mt-4 grain border-2 border-ink rounded-sm bg-paper/90 px-4 py-3 overflow-hidden"
      style={{ boxShadow: complete ? "3px 3px 0 var(--pine)" : "3px 3px 0 var(--paper-deep)" }}
    >
      <AnimatePresence>{burst && !reduce && <Confetti count={40} />}</AnimatePresence>

      <div className="relative z-10 flex flex-col gap-1.5 mb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <span className="label-mono text-[0.7rem] sm:text-xs text-indigo inline-flex items-center gap-1.5">
          {complete && (
            <motion.span
              aria-hidden
              className="text-base sm:text-lg"
              animate={reduce ? undefined : { rotate: [0, 360] }}
              transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "linear" }}
            >
              🏅
            </motion.span>
          )}
          {complete ? "Full set collected!" : "Collection mastered"}
        </span>
        <motion.span
          className="font-display font-extrabold text-sm sm:text-base text-pine inline-flex items-center gap-1"
          animate={complete && !reduce ? { rotate: [0, -4, 4, -3, 0] } : { rotate: 0 }}
          transition={complete && !reduce ? { duration: 0.7, repeat: 2, repeatDelay: 1.4 } : undefined}
        >
          {mastered}/{total}
          {complete && (
            <motion.span
              aria-hidden
              className="inline-flex"
              animate={reduce ? undefined : { scale: [1, 1.3, 1] }}
              transition={reduce ? undefined : { duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }}
            >
              <StarIcon size={16} />
            </motion.span>
          )}
        </motion.span>
      </div>
      <div className="relative z-10 h-4 rounded-full border-2 border-ink bg-paper overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 halftone"
          style={{ background: complete ? "var(--pine)" : "var(--marigold)", color: "var(--ink)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`label-mono inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue ${
        active ? "bg-ink text-paper" : "bg-paper hover:bg-sunny"
      }`}
    >
      {label}
      <span
        className={`text-[0.65rem] leading-none rounded-full px-1.5 py-0.5 ${
          active ? "bg-paper text-ink" : "bg-ink/10 text-ink"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// A collectible trading-card / sticker. Tilts a touch, tap to hear it spoken.
function VocabCard({ item, index, lang }: { item: VocabItem; index: number; lang?: LanguageCode }) {
  const meta = MASTERY_META[item.mastery];
  const accent = MASTERY_COLOR[item.mastery];
  const isMastered = item.mastery === "mastered";
  const reduce = useReducedMotion();
  const [saying, setSaying] = useState(false);

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(item.term);
    u.lang = speechTag(lang);
    // little "speaking" pulse that lasts roughly as long as the utterance
    setSaying(true);
    u.onend = () => setSaying(false);
    u.onerror = () => setSaying(false);
    window.setTimeout(() => setSaying(false), 1600);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return (
    <motion.button
      layout
      onClick={speak}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4, rotate: index % 2 ? 1 : -1 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className="group text-left border-2 border-ink rounded-sm p-3 bg-paper relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue"
      style={{ boxShadow: `3px 3px 0 ${accent}` }}
      title="Tap to hear it"
    >
      {/* printed accent stripe down the spine of the card */}
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: accent }} />
      {isMastered && <span aria-hidden className="absolute inset-0 halftone opacity-15" style={{ color: accent }} />}
      {/* a soft ring that ripples out while the word is being spoken */}
      <AnimatePresence>
        {saying && !reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-sm border-2 pointer-events-none"
            style={{ borderColor: accent }}
            initial={{ opacity: 0.6, scale: 0.96 }}
            animate={{ opacity: 0, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <div className="relative pl-1.5">
        <div className="flex items-start justify-between gap-1">
          <p className="target-lang text-riso-blue text-lg sm:text-xl leading-tight min-w-0 break-words overflow-hidden">{item.term}</p>
          <motion.span
            className="shrink-0 text-riso-blue opacity-70 group-hover:opacity-100 transition-opacity inline-flex"
            aria-hidden
            title="Hear it"
            animate={saying && !reduce ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={saying && !reduce ? { duration: 0.5, repeat: Infinity } : { duration: 0.2 }}
          >
            <SpeakerIcon size={18} />
          </motion.span>
        </div>
        {item.reading && <p className="font-mono text-[0.7rem] text-ink/50 leading-tight break-words overflow-hidden">{item.reading}</p>}
        <p className="font-read text-ink-soft leading-snug mt-0.5 break-words overflow-hidden">{item.meaning}</p>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="label-mono text-ink/45 truncate">
            ◇ {SCENES[item.learnedSceneId]?.place ?? item.learnedSceneId}
          </span>
          <MasteryPips mastery={item.mastery} accent={accent} />
        </div>
        <span className="label-mono text-[0.6rem] mt-1 inline-flex items-center gap-1" style={{ color: accent }}>
          <span aria-hidden className="inline-block transition-transform group-hover:-rotate-12 group-hover:scale-125">{meta.glyph}</span>
          {meta.label}
        </span>
      </div>
    </motion.button>
  );
}

// Four-pip mastery meter — fills as a word climbs new → mastered.
function MasteryPips({ mastery, accent }: { mastery: Mastery; accent: string }) {
  const filled = MASTERY_META[mastery].pips;
  return (
    <span className="flex items-center gap-1" role="img" aria-label={`Mastery ${filled} of 4`}>
      {MASTERY_ORDER.map((_, i) => (
        <span
          key={i}
          className="block w-2 h-2 rounded-full border border-ink"
          style={{ background: i < filled ? accent : "transparent" }}
        />
      ))}
    </span>
  );
}

function ReviewSession({
  due,
  lang,
  onGrade,
  onDone,
}: {
  due: VocabItem[];
  lang?: LanguageCode;
  onGrade: (id: string, grade: 0 | 1 | 2) => void;
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const card = due[idx];
  const total = due.length;

  function speakTerm(term: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(term);
    u.lang = speechTag(lang);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function grade(g: 0 | 1 | 2) {
    onGrade(card.id, g);
    const last = idx + 1 >= total;
    if (g === 2) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 900);
    }
    if (last) {
      window.setTimeout(onDone, g === 2 ? 700 : 0);
    } else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  }

  if (!card) {
    return (
      <main className="relative min-h-screen grid place-items-center text-center px-6">
        <FloatingShapes />
        <div className="relative z-10">
          <PixelBadge color="var(--pine)" className="font-pixel text-[0.6rem] mb-4">ALL CAUGHT UP</PixelBadge>
          <p className="font-display text-2xl text-indigo">Nothing due — your words are resting easy.</p>
          <div className="mt-4">
            <PrimaryButton color="var(--riso-blue)" onClick={onDone}>Back to the book</PrimaryButton>
          </div>
        </div>
      </main>
    );
  }

  const progress = Math.round((idx / total) * 100);

  return (
    <main className="relative min-h-screen grid place-items-center px-6">
      <FloatingShapes />
      <AnimatePresence>{celebrate && <Confetti />}</AnimatePresence>

      <div className="relative z-10 w-full max-w-sm text-center">
        <p className="label-mono text-riso-pink mb-2">Revisit · {idx + 1} / {total}</p>
        <div className="h-2 rounded-full border-2 border-ink bg-paper overflow-hidden mb-5">
          <motion.div
            className="h-full bg-riso-pink"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div style={{ perspective: 1000 }}>
          <motion.button
            key={card.id + String(flipped)}
            onClick={() => setFlipped(true)}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileTap={!flipped ? { scale: 0.98 } : undefined}
            className="w-full border-2 border-ink rounded-sm p-10 bg-paper relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue"
            style={{ boxShadow: "4px 4px 0 var(--riso-blue)" }}
          >
            <span aria-hidden className="absolute inset-0 halftone opacity-10 text-riso-blue" />
            <span className="relative">
              {!flipped ? (
                <>
                  <p className="target-lang text-riso-blue text-3xl">{card.term}</p>
                  {card.reading && <p className="font-mono text-xs text-ink/50 mt-1">{card.reading}</p>}
                  <p className="label-mono text-ink/40 mt-5">tap to flip</p>
                </>
              ) : (
                <p className="font-read text-2xl text-ink">{card.meaning}</p>
              )}
            </span>
          </motion.button>
        </div>

        {!flipped && (
          <button
            onClick={() => speakTerm(card.term)}
            className="pill mt-4 inline-flex items-center gap-1.5 px-3 py-1 label-mono bg-paper hover:bg-sunny focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue"
          >
            <SpeakerIcon size={16} /> Hear it
          </button>
        )}

        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-2 justify-center mt-5"
          >
            <GhostButton onClick={() => grade(0)}>Forgot</GhostButton>
            <GhostButton onClick={() => grade(1)}>OK</GhostButton>
            <PrimaryButton color="var(--pine)" onClick={() => grade(2)}>Easy</PrimaryButton>
          </motion.div>
        )}
        <button
          onClick={onDone}
          className="label-mono underline underline-offset-2 mt-6 block mx-auto hover:text-riso-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue rounded-sm"
        >
          End review
        </button>
      </div>
    </main>
  );
}
