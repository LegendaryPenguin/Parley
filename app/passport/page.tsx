"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useGame } from "@/lib/store/useGame";
import { useBoot } from "@/lib/store/boot";
import { SCENES, SCENE_ORDER, LANGUAGES } from "@/lib/content/world";
import { isMock } from "@/lib/og";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { Postcard } from "@/components/design/Postcard";
import { PixelBadge, Confetti } from "@/components/design/Playful";
import type { SceneRecord } from "@/lib/types";

export default function Passport() {
  const router = useRouter();
  const { hydrated, profile } = useBoot();
  const records = useGame((s) => s.records);
  const vocab = useGame((s) => s.vocab);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) {
    return <main className="min-h-screen grid place-items-center"><SplitFlap text="PASSPORT" size="1.5rem" /></main>;
  }

  const flag = LANGUAGES.find((l) => l.code === profile.targetLanguage)?.flag ?? "··";
  const visitedCount = profile.visitedSceneIds.length;
  const totalScenes = SCENE_ORDER.length;

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-5 py-6">
      <Link
        href="/atlas"
        className="label-mono inline-flex items-center gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        ← Atlas
      </Link>

      {/* booklet header — the cover of a well-stamped passport */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 border-2 border-ink rounded-sm bg-ink text-paper p-5 sm:p-6 relative overflow-hidden"
        style={{ boxShadow: "6px 6px 0 var(--riso-blue)" }}
      >
        <div className="absolute inset-0 halftone text-marigold opacity-10" aria-hidden />
        {/* foil-ish corner ornament */}
        <div
          className="absolute -right-10 -bottom-12 w-44 h-44 rounded-full border-[6px] border-marigold/30 opacity-60 float-bob"
          aria-hidden
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="label-mono text-marigold">Traveler&apos;s Passport</p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mt-1">{profile.displayName}</h1>
          </div>
          <span
            className="shrink-0 grid place-items-center w-14 h-14 rounded-full border-2 border-paper/40 text-3xl bg-paper/5"
            aria-label="Language flag"
          >
            {flag}
          </span>
        </div>

        {/* the embossed detail line — what the traveler has earned */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <CoverChip color="var(--marigold)">{profile.level}</CoverChip>
          <CoverChip color="var(--riso-pink)">🔥 {profile.streakDays}d streak</CoverChip>
          <CoverChip color="var(--sunny)">{profile.xp} XP</CoverChip>
          <CoverChip color="var(--mint)">{vocab.length} words</CoverChip>
          <CoverChip color="var(--sky)">{visitedCount}/{totalScenes} places</CoverChip>
        </div>

        {isMock && (
          <span className="absolute top-3 right-3 label-mono bg-marigold text-ink px-2 py-0.5 rounded-sm rotate-3 border border-ink/30">
            demo passage
          </span>
        )}
      </motion.div>

      {/* stamp pages — the heart of the booklet */}
      <section className="mt-7">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-2xl">Your stamps</h2>
          <span className="label-mono text-ink/50">{visitedCount} collected</span>
        </div>
        <div className="relative border-2 border-ink rounded-sm bg-paper-deep/40 p-5 overprint">
          <div className="absolute inset-0 grain rounded-sm pointer-events-none" aria-hidden />
          <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 justify-items-center">
            {SCENE_ORDER.map((id, i) => {
              const visited = profile.visitedSceneIds.includes(id);
              const colors = ["var(--marigold)", "var(--riso-pink)", "var(--pine)", "var(--grape)", "var(--riso-blue)", "var(--coral)"];
              return (
                <div key={id} className="grid place-items-center text-center">
                  {visited ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 320, damping: 20, delay: (i % 3) * 0.05 }}
                      // Poke a stamp and it gives a happy little rubber-stamp wiggle.
                      whileHover={reduce ? undefined : { scale: 1.06, rotate: 2 }}
                      whileTap={reduce ? undefined : { scale: 0.92, rotate: [-4, 4, -2, 0] }}
                      className="cursor-pointer"
                      title={`${SCENES[id].place} — stamped`}
                    >
                      <Stamp
                        label={SCENES[id].place}
                        sublabel="VISITED"
                        color={colors[i % colors.length]}
                        size={96}
                        animate={false}
                      />
                    </motion.div>
                  ) : (
                    <div
                      className="w-24 h-24 grid place-items-center border-2 border-dashed border-ink/30 rounded-full label-mono text-ink/40 px-2 leading-tight float-bob"
                      style={{ animationDelay: `${(i % 4) * 0.4}s` }}
                    >
                      {SCENES[id].place}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* verified records — the honest, on-chain ledger */}
      <section className="mt-9">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-display text-2xl">Verified record</h2>
          <PixelBadge color="var(--pine)" className="text-[0.55rem]">0G</PixelBadge>
        </div>
        <p className="font-read italic text-ink-soft text-sm mb-4 max-w-prose">
          Each completed scene is written to 0G Storage and its fingerprint anchored on 0G Chain.
          The record can&apos;t be edited after the fact, and the grade came from a verified model.
        </p>
        {records.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 rounded-sm p-6 text-center bg-paper">
            <p className="font-read text-ink-soft">
              No completed scenes yet. Talk your way through a place to earn your first verified record.
            </p>
            <Link
              href="/atlas"
              className="pill inline-block mt-4 font-display font-extrabold uppercase tracking-wide text-paper px-6 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              style={{ background: "var(--coral)" }}
            >
              Find a place →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r, i) => (
              <RecordRow key={i} record={r} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CoverChip({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="label-mono text-ink rounded-full px-2.5 py-1 border border-ink/20"
      style={{ background: color }}
    >
      {children}
    </span>
  );
}

function RecordRow({ record, index }: { record: SceneRecord; index: number }) {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const reduce = useReducedMotion();
  const scene = SCENES[record.sceneId];
  const date = new Date(record.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  function toggle() {
    setOpen((o) => {
      const next = !o;
      // Opening your verified record is a tiny win — give it a confetti pop.
      if (next && !reduce) setCelebrate(true);
      return next;
    });
  }

  // Let the confetti fall, then unmount it so it can pop again on re-open.
  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(false), 2400);
    return () => clearTimeout(t);
  }, [celebrate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="border-2 border-ink rounded-sm bg-paper overflow-hidden relative"
      style={{ boxShadow: open ? "4px 4px 0 var(--pine)" : "3px 3px 0 var(--ink)" }}
    >
      {celebrate && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
          <Confetti count={16} />
        </div>
      )}
      <button
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-riso-blue"
      >
        <span className="min-w-0">
          <span className="font-display text-lg">{scene?.place ?? record.sceneId}</span>
          <span className="label-mono text-ink/55 ml-2 block sm:inline mt-0.5 sm:mt-0">
            {date} · fluency {record.fluencyScore} · {record.wordsUsed.length} words
          </span>
        </span>
        <span className="label-mono text-pine shrink-0 inline-flex items-center gap-1">
          ✓ verified <span aria-hidden className="text-ink/50">{open ? "▴" : "▾"}</span>
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t-2 border-ink/10 pt-3 bg-paper-deep/30">
          <Field label="storage" value={record.transcriptStorageRoot} />
          <Field label="record hash" value={record.recordHash} />
          <Field label="model" value={record.attestation?.model ? `${record.attestation.model} · TEE-signed ✓` : "—"} />
          <Field label="anchor" value={record.anchorTx ? `${record.anchorTx} (0G Chain)` : "pending"} />
          <p className="font-read italic text-ink-soft text-sm pt-1">
            This record&apos;s fingerprint is anchored on-chain; it can&apos;t be altered after the fact.
          </p>
          <div className="pt-1">
            <button
              onClick={() => setShareOpen(true)}
              className="pill inline-flex items-center gap-1 font-display font-extrabold uppercase tracking-wide text-paper px-5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              style={{ background: "var(--riso-pink)" }}
            >
              Send a postcard ↗
            </button>
          </div>
        </div>
      )}
      {shareOpen && <ShareModal record={record} onClose={() => setShareOpen(false)} />}
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="label-mono text-ink/75 break-all leading-relaxed">
      <span className="inline-block text-ink/40 w-[5.5rem] align-top">{label}</span>
      <span className="align-top">{value}</span>
    </p>
  );
}

function ShareModal({ record, onClose }: { record: SceneRecord; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scene = SCENES[record.sceneId];
  const keyLine = record.wordsUsed.length ? record.wordsUsed.join(", ") : scene?.place ?? "";

  // Close on Escape for one-thumb / keyboard friendliness.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function download() {
    // Render the postcard DOM node to an image via SVG foreignObject.
    const node = ref.current;
    if (!node) return;
    try {
      const { toPng } = await import("@/lib/client/snapshot");
      const url = await toPng(node);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parley-${record.sceneId}.png`;
      a.click();
    } catch {
      window.print();
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-ink/60 px-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share postcard"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className="bg-paper border-2 border-ink rounded-sm p-5 max-w-md w-full"
        style={{ boxShadow: "6px 6px 0 var(--riso-blue)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="label-mono text-ink/55 mb-3 text-center">A postcard from your travels</p>
        <div ref={ref}>
          <Postcard
            sceneId={scene?.art.background ?? "market"}
            place={scene?.place ?? ""}
            keyLine={keyLine}
            fluency={record.fluencyScore}
          />
        </div>
        <div className="flex gap-3 justify-center items-center mt-5">
          <button
            onClick={download}
            className="pill font-display font-extrabold uppercase tracking-wide text-sm text-paper px-6 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            style={{ background: "var(--riso-pink)" }}
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="label-mono underline decoration-2 underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
