"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

// Shared riso button. Inky, printed, with an offset color "shadow" block.
export function PrimaryButton({
  children,
  color = "var(--riso-blue)",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { color?: string }) {
  return (
    <button
      {...props}
      className={`font-display font-bold uppercase tracking-wide text-paper px-6 py-3 rounded-sm transition-transform enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{ background: color, boxShadow: "4px 4px 0 var(--ink)" }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`font-display font-bold uppercase tracking-wide text-ink px-5 py-2.5 rounded-sm border-2 border-ink transition-colors enabled:hover:bg-ink enabled:hover:text-paper disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

// Section frame with a printed border + halftone corner.
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative bg-paper border-2 border-ink rounded-sm ${className}`}>{children}</div>
  );
}

// motion presets (Brief §4.5) — overprint slide entry
export const overprintSlide = {
  initial: { opacity: 0, x: 8, y: 6 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -8, y: -6 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};
