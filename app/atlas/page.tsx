"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { SCENES, SCENE_ORDER } from "@/lib/content/world";
import { useGame } from "@/lib/store/useGame";
import { useBoot } from "@/lib/store/boot";
import { PassportTab } from "@/components/design/PassportTab";
import { SplitFlap } from "@/components/design/SplitFlap";

export default function Atlas() {
  const router = useRouter();
  const { hydrated, profile } = useBoot();
  const vocab = useGame((s) => s.vocab);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  const states = useMemo(() => {
    const visited = new Set(profile?.visitedSceneIds ?? []);
    const currentIdx = SCENE_ORDER.findIndex((id) => !visited.has(id));
    return SCENE_ORDER.map((id, i) => {
      let state: "visited" | "current" | "locked";
      if (visited.has(id)) state = "visited";
      else if (i === currentIdx || currentIdx === -1) state = "current";
      else state = "locked";
      return { id, state, scene: SCENES[id] };
    });
  }, [profile]);

  if (!hydrated || !profile) {
    return (
      <main className="min-h-screen grid place-items-center">
        <SplitFlap text="BOOKING PASSAGE" size="1.6rem" />
      </main>
    );
  }

  const explored = profile.visitedSceneIds.length;
  const next = states.find((s) => s.state === "current");

  return (
    <main className="min-h-screen px-5 py-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="label-mono text-riso-pink">The Atlas</p>
          <h1 className="font-display text-3xl">Where to, {profile.displayName}?</h1>
        </div>
        <PassportTab profile={profile} wordCount={vocab.length} />
      </header>

      {/* map */}
      <div
        className="relative w-full rounded-sm border-2 border-ink overflow-hidden halftone text-riso-blue"
        style={{ aspectRatio: "16 / 10", background: "var(--paper-deep)" }}
      >
        {/* dashed travel route connecting places in order */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62" preserveAspectRatio="none">
          <polyline
            points={SCENE_ORDER.map((id) => `${SCENES[id].mapPos.x},${SCENES[id].mapPos.y * 0.62}`).join(" ")}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.2"
            opacity="0.45"
          />
        </svg>

        {states.map(({ id, state, scene }) => (
          <PlacePin key={id} id={id} state={state} title={scene.title} place={scene.place} pos={scene.mapPos} />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
        <p className="font-read italic text-ink-soft">
          {explored === 0
            ? "Your journey begins at the border. Step up to the booth."
            : next
              ? `${explored} place${explored > 1 ? "s" : ""} explored. ${next.scene.place} is expecting you.`
              : `${explored} places explored. You've talked your way across the whole map.`}
        </p>
        <div className="flex gap-3">
          <Link href="/phrasebook" className="label-mono underline decoration-riso-pink decoration-2 underline-offset-4">
            Phrasebook ▤
          </Link>
          <Link href="/passport" className="label-mono underline decoration-marigold decoration-2 underline-offset-4">
            Passport ◆
          </Link>
        </div>
      </div>
    </main>
  );
}

function PlacePin({
  id,
  state,
  title,
  place,
  pos,
}: {
  id: string;
  state: "visited" | "current" | "locked";
  title: string;
  place: string;
  pos: { x: number; y: number };
}) {
  const style = { left: `${pos.x}%`, top: `${pos.y * 0.62 * (100 / 62)}%` } as const;
  const inner = (
    <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
      {state === "current" ? (
        <motion.div
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-7 h-7 rounded-full bg-riso-pink border-2 border-ink"
        />
      ) : state === "visited" ? (
        <div className="w-7 h-7 rounded-full bg-marigold border-2 border-ink grid place-items-center text-ink font-display text-sm">◆</div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-fog border-2 border-ink/40 grid place-items-center text-ink/40">✦</div>
      )}
      <span
        className={`label-mono mt-1 px-1 ${state === "locked" ? "text-ink/40" : "text-ink bg-paper/80"}`}
      >
        {place}
      </span>
    </div>
  );

  if (state === "locked") {
    return (
      <div className="absolute" style={style} aria-label={`${title} (locked)`} title="Locked — explore the path to reach here">
        {inner}
      </div>
    );
  }
  return (
    <Link href={`/scene/${id}`} className="absolute group" style={style} aria-label={`${title} (${state})`}>
      <div className="group-hover:-translate-y-1 transition-transform">{inner}</div>
    </Link>
  );
}
