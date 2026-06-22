"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { Ticket } from "@/components/design/Ticket";
import { Postcard } from "@/components/design/Postcard";
import { SceneBackground, NPCPortrait } from "@/components/design/RisoIllustration";
import { PrimaryButton, GhostButton, Panel } from "@/components/design/ui";
import { FloatingShapes, PixelBadge, Confetti } from "@/components/design/Playful";

// Local-only helper: a section frame with a printed label tab. Keeps the gallery
// rhythmic without touching shared components.
function Gallery({
  no,
  title,
  blurb,
  children,
}: {
  no: string;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="pixel-badge text-[0.5rem] px-2 py-1.5">{no}</span>
        <h2 className="font-display text-2xl sm:text-3xl text-indigo">{title}</h2>
      </div>
      <p className="font-read text-ink-soft mt-1 mb-5 max-w-prose">{blurb}</p>
      {children}
    </section>
  );
}

export default function StyleGuide() {
  const reduce = useReducedMotion();
  const [stampKey, setStampKey] = useState(0);
  const [partyKey, setPartyKey] = useState(0);

  const swatches: [string, string][] = [
    ["paper", "var(--paper)"],
    ["ink", "var(--ink)"],
    ["riso-blue", "var(--riso-blue)"],
    ["riso-pink", "var(--riso-pink)"],
    ["marigold", "var(--marigold)"],
    ["pine", "var(--pine)"],
    ["indigo", "var(--indigo)"],
    ["grape", "var(--grape)"],
    ["coral", "var(--coral)"],
    ["mint", "var(--mint)"],
    ["bubble", "var(--bubble)"],
    ["sky", "var(--sky)"],
    ["sunny", "var(--sunny)"],
  ];

  // Count of times the traveler has slapped the stamp down — a tiny score that
  // rewards repeat presses (kids will mash it). Starts at one for the printed one.
  const stampCount = stampKey + 1;

  return (
    <main className="relative min-h-screen wash-joy grain">
      <FloatingShapes />

      <div className="relative max-w-4xl mx-auto px-6 py-14 space-y-16">
        {/* ── Marquee header ─────────────────────────────────── */}
        <header className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono text-riso-pink">Parley</span>
            <span className="label-mono text-ink-soft">·</span>
            <span className="label-mono text-ink-soft">the printed parts box</span>
          </div>
          <SplitFlap text="STYLEGUIDE" size="2.6rem" className="mt-3" />
          <p className="font-read text-lg text-ink mt-4 max-w-prose">
            Every primitive in the travelogue, laid out like a printer&apos;s sample
            sheet — pull a part, see how it behaves, then go build a place.
          </p>
          <div className="flex gap-2 flex-wrap mt-5">
            <PixelBadge color="var(--riso-blue)">RISO</PixelBadge>
            <PixelBadge color="var(--coral)">ARCADE</PixelBadge>
            <PixelBadge color="var(--pine)">TRAVELOGUE</PixelBadge>
          </div>
        </header>

        {/* ── Palette ────────────────────────────────────────── */}
        <Gallery
          no="01"
          title="The ink drawer"
          blurb="Thirteen colors, mixed for paper. Body text always stays ink on light."
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {swatches.map(([name, val]) => (
              <motion.div
                key={name}
                className="group border-2 border-ink rounded-sm overflow-hidden bg-paper"
                style={{ boxShadow: "0 3px 0 var(--ink)" }}
                // Pick-a-chip delight: a little tilt-and-lift on hover, a satisfying
                // squish on tap. Dropped entirely under reduced motion.
                whileHover={reduce ? undefined : { y: -3, rotate: -1.5 }}
                whileTap={reduce ? undefined : { scale: 0.95, rotate: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <div className="h-16 overprint halftone" style={{ background: val }} />
                {/* Label flips to the raw token on hover/focus — a secret name to find. */}
                <p className="label-mono p-1.5 text-ink truncate" title={val}>
                  <span className="group-hover:hidden group-focus-within:hidden">
                    {name}
                  </span>
                  <span className="hidden group-hover:inline group-focus-within:inline text-riso-blue">
                    {val.replace(/^var\(|\)$/g, "")}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>
        </Gallery>

        {/* ── Typography ─────────────────────────────────────── */}
        <Gallery
          no="02"
          title="Voices on the page"
          blurb="Four typefaces, each with a job: the world shouts, the journal whispers, signage speaks the target tongue, the machine logs the trip."
        >
          <Panel className="p-6 space-y-4 overprint">
            <p className="font-display text-4xl text-indigo leading-tight">
              Bricolage display — the world&apos;s voice
            </p>
            <p className="font-read text-lg text-ink">
              Newsreader for reading — dialogue and journal copy, warm and a
              little inky, the way a good travel letter ought to feel.
            </p>
            <p className="target-lang text-riso-blue text-xl">
              ¿Qué le pongo, joven? — target language as hand-lettered signage
            </p>
            <p className="label-mono text-ink-soft">
              SPACE MONO · TICKET № 04 · 0x9F3A…C2
            </p>
            <p className="font-pixel text-[0.6rem] text-pine">PRESS START · +12 XP</p>
          </Panel>
        </Gallery>

        {/* ── Buttons & badges ───────────────────────────────── */}
        <Gallery
          no="03"
          title="Things you press"
          blurb="Inky pills with an offset color shadow. Pixel badges carry the arcade scoreboard energy."
        >
          <Panel className="p-6 space-y-5 overprint">
            <div className="flex gap-3 flex-wrap">
              <PrimaryButton>Set off</PrimaryButton>
              <PrimaryButton color="var(--riso-pink)">Say it</PrimaryButton>
              <PrimaryButton color="var(--pine)">Nailed it</PrimaryButton>
              <GhostButton>Revisit</GhostButton>
              <PrimaryButton disabled>Locked</PrimaryButton>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <PixelBadge>32 PLACES</PixelBadge>
              <PixelBadge color="var(--coral)">LVL 4</PixelBadge>
              <PixelBadge color="var(--marigold)">🔥 7</PixelBadge>
              <PixelBadge color="var(--riso-blue)">B1</PixelBadge>
            </div>
          </Panel>
        </Gallery>

        {/* ── Tickets, stamps, locals ────────────────────────── */}
        <Gallery
          no="04"
          title="Your travel papers"
          blurb="A quest is a ticket. An arrival is a stamp. The people you meet float, watching, remembering."
        >
          <div className="space-y-5">
            <Ticket number="04" place="MERCADO">
              Buy a kilo of oranges and ask how much.
            </Ticket>
            <Ticket number="09" place="CAFÉ" color="var(--riso-pink)">
              Order a coffee the way a local would.
            </Ticket>

            <Panel className="p-6 flex items-center gap-8 flex-wrap overprint">
              <button
                onClick={() => setStampKey((k) => k + 1)}
                className="group/stamp text-left rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-riso-blue"
              >
                <motion.div
                  // Each press lands the stamp with a thwack — a quick over-scale
                  // that settles. Reduced motion gets a clean instant re-stamp.
                  key={stampKey}
                  initial={reduce ? false : { scale: 1.35, rotate: -6, opacity: 0.4 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 700, damping: 18 }}
                >
                  <Stamp label="Mercado" sublabel="JUN 21" />
                </motion.div>
                <span className="label-mono mt-2 flex items-center gap-2 text-ink-soft">
                  <span className="transition-colors group-hover/stamp:text-riso-blue">
                    ↑ press to re-stamp
                  </span>
                  <PixelBadge color="var(--pine)" className="text-[0.5rem] px-2 py-1">
                    ×{stampCount}
                  </PixelBadge>
                </span>
              </button>
              <div className="flex items-center gap-6 flex-wrap">
                <NPCPortrait npcId="vendor-market" name="Rosa" />
                <NPCPortrait npcId="default" name="A local" />
              </div>
            </Panel>
          </div>
        </Gallery>

        {/* ── Scenes ─────────────────────────────────────────── */}
        <Gallery
          no="05"
          title="Places to land"
          blurb="Risograph scene plates. Drop one behind a conversation and you&apos;re somewhere."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {["border", "market", "cafe", "harbor", "platform"].map((id) => (
              <motion.div
                key={id}
                // Lean in to peek at a place — the plate tips toward you and its
                // signpost label hops up. Static under reduced motion.
                whileHover={reduce ? undefined : { y: -4, rotate: 0.6 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                <Panel className="group relative h-36 overflow-hidden">
                  <SceneBackground id={id} alt={id} />
                  <span className="absolute bottom-2 left-2 label-mono text-ink bg-sunny px-1.5 py-0.5 border-2 border-ink rounded-sm transition-transform group-hover:-translate-y-0.5">
                    {id}
                  </span>
                </Panel>
              </motion.div>
            ))}
          </div>
        </Gallery>

        {/* ── Postcard + confetti reward beat ────────────────── */}
        <Gallery
          no="06"
          title="The souvenir"
          blurb="When you say the line right, you earn a postcard worth keeping. Throw the confetti and see the reward beat."
        >
          <Panel className="relative p-6 overflow-hidden overprint">
            {partyKey > 0 && <Confetti key={partyKey} />}
            <div className="relative">
              <Postcard
                sceneId="market"
                place="MERCADO"
                keyLine="Quiero un kilo de naranjas, por favor."
                lineMeaning="I'd like a kilo of oranges, please."
                fluency={84}
              />
              <div className="flex items-center gap-3 flex-wrap mt-5">
                <PrimaryButton
                  color="var(--grape)"
                  onClick={() => setPartyKey((k) => k + 1)}
                >
                  Throw confetti
                </PrimaryButton>
                <span className="label-mono text-ink-soft">
                  the reward beat, on demand
                </span>
              </div>
            </div>
          </Panel>
        </Gallery>

        <footer className="pt-4">
          <p className="label-mono text-ink-soft">
            END OF SAMPLE SHEET · PARLEY · BUILT ON 0G
          </p>
        </footer>
      </div>
    </main>
  );
}
