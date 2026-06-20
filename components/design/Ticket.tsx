"use client";

import type { ReactNode } from "react";

// A halftoned riso ticket stub — Space Mono, letterspaced. Used for goal tickets.
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
  return (
    <div
      className="relative px-4 py-3 text-paper"
      style={{
        background: color,
        clipPath:
          "polygon(0 0, 100% 0, 100% 38%, calc(100% - 7px) 50%, 100% 62%, 100% 100%, 0 100%, 0 62%, 7px 50%, 0 38%)",
      }}
    >
      <div
        className="absolute inset-0 halftone opacity-15 pointer-events-none"
        style={{ color: "#000" }}
      />
      <div className="relative flex items-baseline gap-2">
        {number && <span className="label-mono opacity-90">Ticket № {number}</span>}
        {place && <span className="label-mono opacity-90">· {place}</span>}
      </div>
      <div className="relative font-read mt-1 leading-snug">{children}</div>
    </div>
  );
}
