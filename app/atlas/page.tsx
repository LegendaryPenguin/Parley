"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
  const total = SCENE_ORDER.length;
  const next = states.find((s) => s.state === "current");
  // index up to which the route is "walked" — the current stop included.
  const currentMapIdx = next ? SCENE_ORDER.indexOf(next.id) : SCENE_ORDER.length - 1;

  // The bright, completed leg of the journey (border → current stop).
  const travelledPoints = SCENE_ORDER.slice(0, currentMapIdx + 1)
    .map((id) => `${SCENES[id].mapPos.x},${SCENES[id].mapPos.y * 0.62}`)
    .join(" ");

  return (
    <main className="min-h-screen px-5 py-6 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-3">
        <div>
          <p className="label-mono text-riso-pink flex items-center gap-2">
            <span aria-hidden>✦</span> The Atlas <span aria-hidden>✦</span>
          </p>
          <h1 className="font-display text-3xl leading-tight">
            Where to, {profile.displayName}?
          </h1>
          {/* journey progress, read like stamps in a logbook */}
          <div className="mt-2 flex flex-wrap items-center gap-2" aria-label={`${explored} of ${total} places explored`}>
            {SCENE_ORDER.map((id, i) => (
              <span
                key={id}
                aria-hidden
                className={`h-3 w-3 rounded-full border-2 border-ink ${
                  i < explored
                    ? "bg-marigold"
                    : i === explored
                      ? "bg-riso-pink"
                      : "bg-paper"
                }`}
              />
            ))}
            <span className="label-mono text-ink-soft ml-1">
              {explored}/{total}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <PassportTab profile={profile} wordCount={vocab.length} />
        </div>
      </header>

      {/* the board-game world map */}
      <div
        className="relative w-full rounded-sm border-2 border-ink overflow-hidden halftone text-riso-blue shadow-[6px_6px_0_var(--ink)]"
        style={{ aspectRatio: "16 / 10", background: "var(--paper-deep)" }}
      >
        {/* printed cartographer's frame */}
        <div className="pointer-events-none absolute inset-2 border border-ink/20 rounded-sm" aria-hidden />

        {/* compass rose, top-right corner */}
        <div className="pointer-events-none absolute top-3 right-3 opacity-50" aria-hidden>
          <CompassRose />
        </div>

        {/* " here be words" cartouche, bottom-left */}
        <div
          className="pointer-events-none absolute bottom-3 left-3 label-mono text-[0.55rem] text-ink/45 max-w-[40%] leading-snug"
          aria-hidden
        >
          ✺ here be words — speak to pass ✺
        </div>

        {/* travel route: faint full path + bright walked leg */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62" preserveAspectRatio="none">
          {/* the whole intended itinerary, faint */}
          <polyline
            points={SCENE_ORDER.map((id) => `${SCENES[id].mapPos.x},${SCENES[id].mapPos.y * 0.62}`).join(" ")}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.2"
            opacity="0.35"
          />
          {/* the leg you've actually walked, in marigold, gently marching */}
          <motion.polyline
            points={travelledPoints}
            fill="none"
            stroke="var(--marigold)"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 1.6"
            animate={{ strokeDashoffset: [0, -3.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0.3px 0 var(--ink))" }}
          />
        </svg>

        {states.map(({ id, state, scene }, i) => (
          <PlacePin
            key={id}
            id={id}
            index={i}
            state={state}
            title={scene.title}
            place={scene.place}
            pos={scene.mapPos}
          />
        ))}
      </div>

      {/* legend + companion's note */}
      <div className="mt-4 flex items-center gap-4 flex-wrap label-mono text-[0.6rem] text-ink-soft">
        <LegendKey swatch="bg-marigold" label="stamped" />
        <LegendKey swatch="bg-riso-pink" label="you're here" pulse />
        <LegendKey swatch="bg-grape" label="still sealed" />
      </div>

      <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
        <p className="font-read italic text-ink-soft">
          {explored === 0
            ? "Your journey begins at the border. Step up to the booth."
            : next
              ? `${explored} place${explored > 1 ? "s" : ""} explored. ${next.scene.place} is expecting you.`
              : `${explored} places explored. You've talked your way across the whole map.`}
        </p>
        <div className="flex gap-3">
          <Link
            href="/phrasebook"
            className="label-mono underline decoration-riso-pink decoration-2 underline-offset-4 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-riso-pink"
          >
            Phrasebook ▤
          </Link>
          <Link
            href="/passport"
            className="label-mono underline decoration-marigold decoration-2 underline-offset-4 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
          >
            Passport ◆
          </Link>
        </div>
      </div>
    </main>
  );
}

function LegendKey({ swatch, label, pulse }: { swatch: string; label: string; pulse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-3 w-3 rounded-full border-2 border-ink ${swatch} ${pulse ? "motion-safe:animate-pulse" : ""}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

function CompassRose() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="20" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="13" stroke="var(--ink)" strokeWidth="0.7" opacity="0.5" />
      {/* N/S/E/W spokes */}
      <path d="M22 4 L25 22 L22 40 L19 22 Z" fill="var(--riso-pink)" stroke="var(--ink)" strokeWidth="0.8" />
      <path d="M4 22 L22 19 L40 22 L22 25 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
      <text x="22" y="9.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--ink)" fontFamily="monospace">
        N
      </text>
    </svg>
  );
}

function PlacePin({
  id,
  index,
  state,
  title,
  place,
  pos,
}: {
  id: string;
  index: number;
  state: "visited" | "current" | "locked";
  title: string;
  place: string;
  pos: { x: number; y: number };
}) {
  const reduceMotion = useReducedMotion();
  const style = { left: `${pos.x}%`, top: `${pos.y * 0.62 * (100 / 62)}%` } as const;

  const marker =
    state === "current" ? (
      <div className="relative grid place-items-center">
        {/* radiating beacon — pure motion, hidden to reduced-motion via motion-safe parent */}
        <motion.span
          aria-hidden
          className="absolute h-7 w-7 rounded-full bg-riso-pink/40 motion-reduce:hidden"
          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          animate={{ scale: [1, 1.16, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 h-7 w-7 rounded-full bg-riso-pink border-2 border-ink grid place-items-center text-paper font-display text-sm shadow-[2px_2px_0_var(--ink)]"
        >
          ★
        </motion.div>
      </div>
    ) : state === "visited" ? (
      // a satisfying inked travel stamp, slightly cocked like a real one —
      // it "thunks" down on load (staggered like stamps in a logbook) and
      // gives a little wobble on hover/focus for a kid-pleasing tactile beat.
      <motion.div
        initial={reduceMotion ? false : { scale: 1.6, rotate: 14, opacity: 0 }}
        animate={{ scale: 1, rotate: -6, opacity: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 520,
                damping: 16,
                delay: Math.min(index * 0.08, 0.6),
              }
        }
        whileHover={reduceMotion ? undefined : { rotate: 6, scale: 1.08 }}
        className="h-7 w-7 rounded-md bg-marigold border-2 border-ink grid place-items-center text-ink font-display text-sm shadow-[2px_2px_0_var(--ink)]"
      >
        ✓
      </motion.div>
    ) : (
      // a sealed "mystery" stop — not fogged-out and forgotten, but enticing:
      // a grape/sunny halftone wax-seal that brightens on hover/focus, with a
      // tiny lock glyph. Still non-navigable.
      <div className="relative grid place-items-center">
        {/* soft sunny glow that wakes up on hover/focus to invite curiosity */}
        <span
          aria-hidden
          className="absolute h-7 w-7 rounded-full bg-sunny/30 blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        />
        <div
          className="relative z-10 h-7 w-7 rounded-full border-2 border-ink grid place-items-center text-paper text-[0.6rem] shadow-[2px_2px_0_var(--ink)] halftone transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 group-focus-visible:-rotate-6 group-focus-visible:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none motion-reduce:group-focus-visible:transform-none"
          style={{ background: "linear-gradient(135deg, var(--grape), var(--sunny))" }}
        >
          <span aria-hidden>🔒</span>
        </div>
      </div>
    );

  const inner = (
    <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
      {/* tiny stop number, like a board-game space */}
      <span
        aria-hidden
        className={`label-mono text-[0.5rem] leading-none mb-0.5 ${
          state === "locked" ? "text-grape/60" : "text-ink/60"
        }`}
      >
        {index + 1}
      </span>
      {marker}
      {state === "current" ? (
        <span className="pill label-mono mt-1.5 bg-riso-pink text-paper text-[0.55rem] px-2 py-0.5 whitespace-nowrap">
          you’re here
        </span>
      ) : state === "locked" ? (
        // a teasing "?????" by default that peeks the real place name on
        // hover/focus — keeps the mystery while rewarding a peek.
        <span className="relative mt-1 grid label-mono whitespace-nowrap">
          <span
            aria-hidden
            className="col-start-1 row-start-1 px-1 text-grape transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0"
          >
            ？？？
          </span>
          <span
            aria-hidden
            className="col-start-1 row-start-1 px-1 rounded-sm bg-paper/85 text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {place}
          </span>
        </span>
      ) : (
        <span className="label-mono mt-1 px-1 rounded-sm text-ink bg-paper/85">
          {place}
        </span>
      )}
    </div>
  );

  if (state === "locked") {
    return (
      <div
        className="absolute group rounded-sm cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grape"
        style={style}
        tabIndex={0}
        role="img"
        aria-label={`${title} — locked. Keep walking the path to reach here.`}
        title="Locked — keep walking the path to reach here"
      >
        {inner}
      </div>
    );
  }
  return (
    <Link
      href={`/scene/${id}`}
      className="absolute group rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      style={style}
      aria-label={`${title} (${state})`}
    >
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
        className="transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
      >
        {inner}
      </motion.div>
    </Link>
  );
}
