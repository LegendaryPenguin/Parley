"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/lib/store/useGame";
import { useBoot } from "@/lib/store/boot";
import { SCENES, SCENE_ORDER, LANGUAGES } from "@/lib/content/world";
import { isMock } from "@/lib/og";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { Postcard } from "@/components/design/Postcard";
import type { SceneRecord } from "@/lib/types";

export default function Passport() {
  const router = useRouter();
  const { hydrated, profile } = useBoot();
  const records = useGame((s) => s.records);
  const vocab = useGame((s) => s.vocab);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) {
    return <main className="min-h-screen grid place-items-center"><SplitFlap text="PASSPORT" size="1.5rem" /></main>;
  }

  const flag = LANGUAGES.find((l) => l.code === profile.targetLanguage)?.flag ?? "··";

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-5 py-6">
      <Link href="/atlas" className="label-mono">← Atlas</Link>

      {/* booklet header */}
      <div className="mt-2 border-2 border-ink rounded-sm bg-ink text-paper p-5 relative overflow-hidden" style={{ boxShadow: "5px 5px 0 var(--riso-blue)" }}>
        <div className="absolute inset-0 halftone text-marigold opacity-10" />
        <p className="label-mono text-marigold relative">Passport</p>
        <h1 className="font-display text-4xl relative">{profile.displayName}</h1>
        <div className="flex gap-4 mt-2 relative">
          <span className="label-mono">{profile.level}</span>
          <span className="label-mono text-riso-pink">🔥 {profile.streakDays} day streak</span>
          <span className="label-mono text-marigold">{profile.xp} XP</span>
          <span className="label-mono">{vocab.length} words</span>
          <span className="label-mono">{flag}</span>
        </div>
        {isMock && <span className="absolute top-3 right-3 label-mono bg-marigold text-ink px-2 py-0.5 rounded-sm rotate-3">demo passage</span>}
      </div>

      {/* stamp pages */}
      <section className="mt-6">
        <h2 className="font-display text-xl mb-3">Stamps</h2>
        <div className="flex flex-wrap gap-4">
          {SCENE_ORDER.map((id) => {
            const visited = profile.visitedSceneIds.includes(id);
            return (
              <div key={id} className={visited ? "" : "opacity-25"}>
                {visited ? (
                  <Stamp label={SCENES[id].place} sublabel="VISITED" color="var(--marigold)" size={96} animate={false} />
                ) : (
                  <div className="w-24 h-24 grid place-items-center border-2 border-dashed border-ink/40 rounded-full label-mono text-ink/40">
                    {SCENES[id].place}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* verified records */}
      <section className="mt-8">
        <h2 className="font-display text-xl mb-1">Verified record</h2>
        <p className="font-read italic text-ink-soft text-sm mb-4">
          Each completed scene is written to 0G Storage and its fingerprint anchored on 0G Chain.
          The record can&apos;t be edited after the fact, and the grade came from a verified model.
        </p>
        {records.length === 0 ? (
          <p className="font-read text-ink-soft">No completed scenes yet. Talk your way through a place to earn your first verified record.</p>
        ) : (
          <div className="space-y-3">
            {records.map((r, i) => (
              <RecordRow key={i} record={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function RecordRow({ record }: { record: SceneRecord }) {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const scene = SCENES[record.sceneId];
  const date = new Date(record.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="border-2 border-ink rounded-sm bg-paper">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span>
          <span className="font-display">{scene?.place ?? record.sceneId}</span>
          <span className="label-mono text-ink/60 ml-2">{date} · fluency {record.fluencyScore} · {record.wordsUsed.length} words</span>
        </span>
        <span className="label-mono text-pine">✓ verified {open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1 border-t-2 border-ink/10 pt-3">
          <Field label="storage" value={record.transcriptStorageRoot} />
          <Field label="record hash" value={record.recordHash} />
          <Field label="model" value={record.attestation?.model ? `${record.attestation.model} · TEE-signed ✓` : "—"} />
          <Field label="anchor" value={record.anchorTx ? `${record.anchorTx} (0G Chain)` : "pending"} />
          <p className="font-read italic text-ink-soft text-sm pt-2">
            This record&apos;s fingerprint is anchored on-chain; it can&apos;t be altered after the fact.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShareOpen(true)}
              className="label-mono underline decoration-riso-pink decoration-2 underline-offset-4"
            >
              Share postcard ↗
            </button>
          </div>
        </div>
      )}
      {shareOpen && <ShareModal record={record} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="label-mono text-ink/70 break-all">
      <span className="text-ink/40">{label}</span> &nbsp;{value}
    </p>
  );
}

function ShareModal({ record, onClose }: { record: SceneRecord; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scene = SCENES[record.sceneId];
  const keyLine = record.wordsUsed.length ? record.wordsUsed.join(", ") : scene?.place ?? "";

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
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 px-6" onClick={onClose}>
      <div className="bg-paper border-2 border-ink rounded-sm p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div ref={ref}>
          <Postcard
            sceneId={scene?.art.background ?? "market"}
            place={scene?.place ?? ""}
            keyLine={keyLine}
            fluency={record.fluencyScore}
          />
        </div>
        <div className="flex gap-3 justify-center mt-4">
          <button onClick={download} className="font-display font-bold uppercase text-sm text-paper px-4 py-2 rounded-sm" style={{ background: "var(--riso-pink)", boxShadow: "3px 3px 0 var(--ink)" }}>
            Download
          </button>
          <button onClick={onClose} className="label-mono underline">Close</button>
        </div>
      </div>
    </div>
  );
}
