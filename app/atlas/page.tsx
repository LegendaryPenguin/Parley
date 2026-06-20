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

      {/* the board-game world map — taller on phones so pins + labels breathe,
          relaxing to a wide travelogue spread on larger screens */}
      <div
        className="relative w-full rounded-sm border-2 border-ink overflow-hidden halftone text-riso-blue shadow-[6px_6px_0_var(--ink)] aspect-[4/5] sm:aspect-[16/10]"
        style={{ background: "var(--paper-deep)" }}
      >
        {/* printed cartographer's frame */}
        <div className="pointer-events-none absolute inset-2 border border-ink/20 rounded-sm" aria-hidden />

        {/* the illustrated land: a soft coastline/landmass the route travels across,
            tucked behind everything and kept clear of the pin coordinates */}
        <Landmass />

        {/* tiny travelogue motifs — placed in the empty quarters so they never
            sit under a pin or its label */}
        <MapMotifs />

        {/* compass rose, top-right corner */}
        <div className="pointer-events-none absolute top-3 right-3 opacity-50" aria-hidden>
          <CompassRose />
        </div>

        {/* "here be words" cartouche, bottom-left */}
        <div
          className="pointer-events-none absolute bottom-3 left-3 label-mono text-[0.5rem] sm:text-[0.55rem] text-ink/45 max-w-[44%] leading-snug"
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

// A soft, printed coastline + landmass under the whole journey. It hugs the
// route (which runs lower-left → upper-middle) without crowding any pin, and
// reads as a riso "overprint" of land on sea. Stretches with the board so the
// drawing stays put relative to the pins on every screen.
function Landmass() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* the sea: a couple of overprinted swell lines in riso-blue */}
      <path
        d="M2 88 Q14 84 26 88 T50 88 T74 88 T98 88"
        fill="none"
        stroke="var(--riso-blue)"
        strokeWidth="0.5"
        opacity="0.25"
      />
      <path
        d="M2 93 Q14 89 26 93 T50 93 T74 93 T98 93"
        fill="none"
        stroke="var(--riso-blue)"
        strokeWidth="0.5"
        opacity="0.2"
      />
      {/* the landmass: a friendly continent the path crosses, filled pine with a
          marigold overprint edge so it prints like a two-pass riso plate */}
      <path
        d="M6 84 C10 64 26 58 30 46 C34 36 30 28 42 22 C56 15 66 22 72 18
           C82 12 92 18 96 30 C100 44 90 54 84 60 C76 68 80 78 70 86
           C58 94 40 92 28 92 C18 92 8 92 6 84 Z"
        fill="var(--pine)"
        opacity="0.1"
      />
      <path
        d="M6 84 C10 64 26 58 30 46 C34 36 30 28 42 22 C56 15 66 22 72 18
           C82 12 92 18 96 30 C100 44 90 54 84 60 C76 68 80 78 70 86
           C58 94 40 92 28 92 C18 92 8 92 6 84 Z"
        fill="none"
        stroke="var(--pine)"
        strokeWidth="0.6"
        strokeDasharray="0.8 0.9"
        opacity="0.4"
      />
    </svg>
  );
}

// Decorative riso travelogue motifs. Each is parked in a corner/empty quarter
// far from the five pin coordinates (which sit roughly along the diagonal
// 18,70 → 38,52 → 60,60 → 78,38 → 52,24), so nothing overlaps a marker or label.
function MapMotifs() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* sun, upper-left empty corner — the one small looping signature beat */}
      <motion.svg
        className="absolute"
        style={{ left: "11%", top: "10%", width: 30, height: 30 }}
        viewBox="0 0 30 30"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={reduceMotion ? undefined : { duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="15" cy="15" r="5" fill="var(--sunny)" stroke="var(--ink)" strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const x1 = 15 + Math.cos(a) * 7.5;
          const y1 = 15 + Math.sin(a) * 7.5;
          const x2 = 15 + Math.cos(a) * 11;
          const y2 = 15 + Math.sin(a) * 11;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--marigold)" strokeWidth="1.3" strokeLinecap="round" />
          );
        })}
      </motion.svg>

      {/* mountains, upper-right beneath the compass */}
      <svg className="absolute" style={{ right: "8%", top: "30%", width: 52, height: 26 }} viewBox="0 0 52 26">
        <path d="M2 24 L14 6 L24 18 L34 4 L50 24 Z" fill="var(--grape)" opacity="0.35" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round" />
        <path d="M11 11 L14 6 L17 11 Z" fill="var(--paper)" opacity="0.8" />
        <path d="M31 9 L34 4 L37 9 Z" fill="var(--paper)" opacity="0.8" />
      </svg>

      {/* a little boat bobbing in the open water, lower-right */}
      <motion.svg
        className="absolute"
        style={{ right: "9%", bottom: "10%", width: 40, height: 30 }}
        viewBox="0 0 40 30"
        animate={reduceMotion ? undefined : { y: [0, -2.5, 0], rotate: [-2, 2, -2] }}
        transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* mast + sail */}
        <line x1="20" y1="4" x2="20" y2="20" stroke="var(--ink)" strokeWidth="1.2" />
        <path d="M20 5 L31 18 L20 18 Z" fill="var(--coral)" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round" />
        <path d="M20 5 L11 17 L20 17 Z" fill="var(--paper)" opacity="0.85" stroke="var(--ink)" strokeWidth="0.8" />
        {/* hull */}
        <path d="M7 20 L33 20 L29 27 L11 27 Z" fill="var(--riso-blue)" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round" />
      </motion.svg>

      {/* a wheeling gull or two near the boat */}
      <svg className="absolute" style={{ right: "26%", bottom: "26%", width: 26, height: 12 }} viewBox="0 0 26 12">
        <path d="M2 8 Q6 2 10 8 Q14 2 18 8" fill="none" stroke="var(--ink)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
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

  // Keep labels inside the board: anchor the column toward whichever edge the
  // pin hugs, so wide place names never clip the left/right frame on a narrow
  // phone. Pins on the far left grow rightward, far right grow leftward.
  const labelAlign =
    pos.x <= 24 ? "items-start text-left" : pos.x >= 74 ? "items-end text-right" : "items-center text-center";

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
    <div className={`flex flex-col -translate-x-1/2 -translate-y-1/2 ${labelAlign}`}>
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
      {/* labels live BELOW the marker on a paper chip so they never collide with
          the pin or the route line; small type keeps them tidy on phones */}
      {state === "current" ? (
        <span className="pill label-mono mt-1.5 bg-riso-pink text-paper text-[0.5rem] sm:text-[0.55rem] px-1.5 py-0.5 whitespace-nowrap shadow-[1px_1px_0_var(--ink)]">
          you’re here
        </span>
      ) : state === "locked" ? (
        // a teasing "?????" by default that peeks the real place name on
        // hover/focus — keeps the mystery while rewarding a peek.
        <span className="relative mt-1 grid label-mono text-[0.5rem] sm:text-[0.55rem] whitespace-nowrap">
          <span
            aria-hidden
            className="col-start-1 row-start-1 px-1 text-grape transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0"
          >
            ？？？
          </span>
          <span
            aria-hidden
            className="col-start-1 row-start-1 px-1 rounded-sm bg-paper/90 text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {place}
          </span>
        </span>
      ) : (
        <span className="label-mono text-[0.5rem] sm:text-[0.55rem] mt-1 px-1 rounded-sm text-ink bg-paper/90 whitespace-nowrap shadow-[1px_1px_0_var(--ink)]">
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
