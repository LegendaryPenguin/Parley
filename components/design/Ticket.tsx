"use client";

import type { ReactNode } from "react";

// A real perforated transit-ticket stub for goals. A vertical perforation tears
// the small "stub" rail (the № you keep) from the wide body (where you're headed).
// Halftone print wash, mono ticket-office labels, punched notches on the seam.
// Edit only this file; Ticket export + props (number, place, children, color) stay.
export function Ticket({
  number,
  place,
  children,
  color = "var(--riso-blue)",
}: {
  number?: string;
  place?: string;
  children: ReactNode;
  color?: string;
}) {
  // Notched edges top & bottom — the bite a ticket punch leaves behind.
  const notch =
    "polygon(0 0, 100% 0, 100% 38%, calc(100% - 7px) 50%, 100% 62%, 100% 100%, 0 100%, 0 62%, 7px 50%, 0 38%)";

  return (
    <div
      tabIndex={0}
      className="group/ticket relative flex isolate overflow-hidden rounded-[3px] text-paper outline-none shadow-[3px_3px_0_rgba(33,28,24,0.22)] transition-transform duration-200 ease-out hover:-rotate-[0.6deg] hover:shadow-[5px_5px_0_rgba(33,28,24,0.28)] focus-visible:-rotate-[0.6deg] focus-visible:shadow-[0_0_0_3px_var(--paper),0_0_0_6px_var(--ink)] motion-reduce:transition-none motion-reduce:hover:rotate-0 motion-reduce:focus-visible:rotate-0"
      style={{ background: color, clipPath: notch }}
      role="group"
      aria-label={`Ticket${number ? ` number ${number}` : ""}${place ? `, to ${place}` : ""}`}
    >
      {/* halftone print wash over the whole stub */}
      <div
        aria-hidden
        className="absolute inset-0 halftone opacity-[0.18] pointer-events-none"
        style={{ color: "#000" }}
      />
      {/* a soft printed sheen along the top, like ticket-stock gloss */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none overprint"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16), transparent)" }}
      />

      {/* ── STUB RAIL: the keepsake half, rotated label + big № ── */}
      <div className="relative flex shrink-0 items-center gap-1 px-2 py-3">
        <span
          className="label-mono whitespace-nowrap text-[9px] opacity-80"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Boarding Pass
        </span>
        {number && (
          <span className="font-display inline-block text-2xl font-extrabold leading-none tracking-tight tabular-nums transition-transform duration-200 ease-out group-hover/ticket:-translate-y-0.5 group-hover/ticket:scale-110 group-focus-visible/ticket:-translate-y-0.5 group-focus-visible/ticket:scale-110 motion-reduce:transition-none motion-reduce:group-hover/ticket:translate-y-0 motion-reduce:group-hover/ticket:scale-100">
            <span className="align-top text-[0.55em] font-bold opacity-70">№</span>
            {number}
          </span>
        )}
      </div>

      {/* ── PERFORATION SEAM: punched dots you'd tear along ── */}
      <div aria-hidden className="relative flex flex-col items-center justify-evenly py-2">
        <span
          className="h-full w-px opacity-55 transition-opacity duration-200 group-hover/ticket:opacity-90 group-focus-visible/ticket:opacity-90 motion-reduce:transition-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, currentColor 0 3px, transparent 3px 7px)",
          }}
        />
      </div>

      {/* ── BODY: where you're headed + the goal copy ── */}
      <div className="relative min-w-0 flex-1 px-3.5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="label-mono text-[10px] opacity-70">Admit one ·</span>
          {place ? (
            <span className="label-mono text-[10px] font-bold opacity-95">{place}</span>
          ) : (
            <span className="label-mono text-[10px] opacity-70">Anywhere you can talk your way</span>
          )}
        </div>
        <div className="font-read mt-1 leading-snug">{children}</div>

        {/* fine-print baseline — the bureaucratic charm of a real ticket */}
        <div
          aria-hidden
          className="label-mono mt-2 flex items-center gap-1.5 text-[8px] opacity-55"
        >
          <span className="inline-block transition-transform duration-500 ease-out group-hover/ticket:rotate-180 group-focus-visible/ticket:rotate-180 motion-reduce:transition-none motion-reduce:group-hover/ticket:rotate-0">
            ✦
          </span>
          <span className="truncate">Valid until you say it out loud</span>
        </div>
      </div>
    </div>
  );
}
