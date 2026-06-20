"use client";

import { useState } from "react";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { Ticket } from "@/components/design/Ticket";
import { Postcard } from "@/components/design/Postcard";
import { SceneBackground, NPCPortrait } from "@/components/design/RisoIllustration";
import { PrimaryButton, GhostButton, Panel } from "@/components/design/ui";

export default function StyleGuide() {
  const [stampKey, setStampKey] = useState(0);
  const swatches: [string, string][] = [
    ["paper", "var(--paper)"],
    ["ink", "var(--ink)"],
    ["riso-blue", "var(--riso-blue)"],
    ["riso-pink", "var(--riso-pink)"],
    ["marigold", "var(--marigold)"],
    ["pine", "var(--pine)"],
  ];
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-14">
      <header>
        <p className="label-mono text-riso-pink">Parley · design system</p>
        <SplitFlap text="STYLEGUIDE" size="2.2rem" className="mt-2" />
      </header>

      <section>
        <h2 className="font-display text-2xl mb-4">Palette</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {swatches.map(([name, val]) => (
            <div key={name} className="border-2 border-ink">
              <div className="h-16" style={{ background: val }} />
              <p className="label-mono p-1">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Typography</h2>
        <p className="font-display text-4xl">Bricolage display — the world&apos;s voice</p>
        <p className="font-read text-lg">
          Newsreader for reading — dialogue and journal copy, warm and a little inky.
        </p>
        <p className="target-lang text-riso-blue text-xl">¿Qué le pongo, joven? — target language as signage</p>
        <p className="label-mono">SPACE MONO · TICKET № 04 · 0x9F3A…C2</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Primitives</h2>
        <Ticket number="04" place="MERCADO">
          Buy a kilo of oranges and ask how much.
        </Ticket>
        <div className="flex gap-3 flex-wrap">
          <PrimaryButton>Set off</PrimaryButton>
          <PrimaryButton color="var(--riso-pink)">Say it</PrimaryButton>
          <GhostButton>Revisit</GhostButton>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <button onClick={() => setStampKey((k) => k + 1)} className="text-left">
            <Stamp key={stampKey} label="Mercado" sublabel="JUN 21" />
            <span className="label-mono block mt-2">↑ click to re-stamp</span>
          </button>
          <NPCPortrait npcId="vendor-market" name="Rosa" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Scenes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["border", "market", "cafe", "harbor", "platform"].map((id) => (
            <Panel key={id} className="relative h-32 overflow-hidden">
              <SceneBackground id={id} alt={id} />
              <span className="absolute bottom-1 left-2 label-mono text-ink bg-paper/80 px-1">{id}</span>
            </Panel>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Postcard (shareable)</h2>
        <Postcard
          sceneId="market"
          place="MERCADO"
          keyLine="Quiero un kilo de naranjas, por favor."
          lineMeaning="I'd like a kilo of oranges, please."
          fluency={84}
        />
      </section>
    </main>
  );
}
