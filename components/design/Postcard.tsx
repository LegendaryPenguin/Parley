"use client";

import { forwardRef } from "react";
import { SceneBackground } from "./RisoIllustration";
import { Stamp } from "./Stamp";

// The shareable artifact. A riso postcard you bring home from a place: the
// illustration up top, the one line you nailed in the local tongue, a postmark
// that proves you were there, and the parley maker's mark. Exported as a flat
// image by Passport — so every flourish here is static and print-safe.
export const Postcard = forwardRef<
  HTMLDivElement,
  { sceneId: string; place: string; keyLine: string; lineMeaning?: string; fluency: number }
>(function Postcard({ sceneId, place, keyLine, lineMeaning, fluency }, ref) {
  return (
    <div
      ref={ref}
      aria-label={`Postcard from the ${place}: you said ${keyLine}${lineMeaning ? `, meaning ${lineMeaning}` : ""}`}
      className="group relative w-full max-w-md mx-auto bg-paper text-ink border-2 border-ink overflow-hidden grain select-none transition-transform duration-300 ease-out [transform:translateZ(0)] hover:-translate-y-1 hover:-rotate-[0.6deg] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0"
      style={{ aspectRatio: "3 / 2", boxShadow: "6px 6px 0 var(--ink)" }}
    >
      {/* deckle frame — a hand-printed border just inside the edge */}
      <div className="pointer-events-none absolute inset-[6px] border border-ink/35 z-20" />

      {/* the illustration fills the card; halftone + a warm wash sit on top so
          text below always reads, no matter which scene lands here */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-95">
          <SceneBackground id={sceneId} alt={`A risograph view of the ${place}`} />
        </div>
        <div className="absolute inset-0 halftone opacity-20 overprint" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, var(--paper) 14%, rgba(236,230,218,0.82) 42%, transparent 100%)",
          }}
        />
      </div>

      {/* postmark — a smudged, off-kilter cancellation stamp, top-right.
          it gives a little stamped wiggle when the card is touched/hovered */}
      <div className="absolute top-3 right-3 z-30 -rotate-[7deg] origin-center transition-transform duration-200 ease-out group-hover:-rotate-[2deg] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:rotate-[-7deg] motion-reduce:group-hover:scale-100">
        <div className="rounded-full border-2 border-ink/55 px-3 py-1.5 text-center bg-paper/70 backdrop-blur-[1px] overprint">
          <p className="label-mono text-ink/80 text-[10px] leading-none">{place}</p>
          <div className="my-1 h-px w-full bg-ink/30" aria-hidden />
          <p className="font-pixel text-riso-pink text-[8px] leading-none">FL·{fluency}</p>
        </div>
      </div>

      {/* the line you nailed — the whole reason this postcard exists */}
      <figure className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 pt-3">
        <p className="label-mono text-ink/55 text-[10px] mb-1">you said</p>
        <blockquote className="target-lang text-riso-blue text-2xl leading-[1.1] font-display drop-shadow-[1px_1px_0_var(--paper)]">
          <span className="text-riso-pink/80">&ldquo;</span>
          {keyLine}
          <span className="text-riso-pink/80">&rdquo;</span>
        </blockquote>
        {lineMeaning && (
          <figcaption className="font-read italic text-ink-soft text-sm mt-0.5 leading-snug">
            {lineMeaning}
          </figcaption>
        )}

        {/* maker's mark + the proof-of-print stamp share the baseline */}
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <div className="leading-tight">
            <p className="label-mono text-ink/70 text-[10px]">made in</p>
            <p className="font-display font-extrabold text-indigo text-lg tracking-tight leading-none">
              parley
            </p>
          </div>
          <div className="-mb-1 -mr-1 shrink-0 origin-bottom-right transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Stamp label="seen" sublabel={place} color="var(--marigold)" size={72} animate={false} />
          </div>
        </div>
      </figure>
    </div>
  );
});
