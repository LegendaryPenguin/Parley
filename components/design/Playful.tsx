"use client";

import { motion } from "framer-motion";

// Floating riso-arcade decorations (cubes, stars, dots) — the Zero Cup energy.
// Purely decorative, aria-hidden, pointer-events-none. Respects reduced motion
// via the global .float-bob keyframe (paused under prefers-reduced-motion).
const SHAPES = [
  { kind: "cube", x: "6%", y: "18%", c: "var(--grape)", s: 38, rot: -8 },
  { kind: "star", x: "88%", y: "12%", c: "var(--sunny)", s: 30, rot: 6 },
  { kind: "dots", x: "82%", y: "70%", c: "var(--coral)", s: 56, rot: 0 },
  { kind: "star", x: "12%", y: "78%", c: "var(--riso-pink)", s: 24, rot: 12 },
  { kind: "cube", x: "92%", y: "44%", c: "var(--riso-blue)", s: 28, rot: 10 },
  { kind: "dots", x: "4%", y: "48%", c: "var(--grape)", s: 44, rot: 0 },
];

function Shape({ kind, c, s }: { kind: string; c: string; s: number }) {
  if (kind === "cube") {
    return (
      <svg width={s} height={s} viewBox="0 0 40 40">
        <path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z" fill={c} stroke="var(--ink)" strokeWidth="2" />
        <path d="M20 4 L34 12 L20 20 L6 12 Z" fill="#fff" opacity="0.35" />
        <path d="M20 20 L20 36 L6 28 L6 12 Z" fill="#000" opacity="0.12" />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg width={s} height={s} viewBox="0 0 40 40">
        <path
          d="M20 2 L25 15 L39 15 L28 24 L32 38 L20 29 L8 38 L12 24 L1 15 L15 15 Z"
          fill={c}
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // dots — halftone cluster
  return (
    <div className="halftone" style={{ width: s, height: s, color: c, opacity: 0.7 }} />
  );
}

export function FloatingShapes() {
  return (
    <div className="fixed inset-0 -z-0 pointer-events-none overflow-hidden" aria-hidden>
      {SHAPES.map((sh, i) => (
        <div
          key={i}
          className="absolute float-bob"
          style={{ left: sh.x, top: sh.y, ["--rot" as string]: `${sh.rot}deg`, animationDelay: `${i * 0.8}s` }}
        >
          <Shape kind={sh.kind} c={sh.c} s={sh.s} />
        </div>
      ))}
    </div>
  );
}

// Retro pixel badge — like the Zero Cup "32 TEAMS" nodes.
export function PixelBadge({
  children,
  color = "var(--grape)",
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`pixel-badge inline-grid place-items-center rounded-full border-[3px] border-ink text-paper px-3 py-2 ${className}`}
      style={{ background: color, boxShadow: "0 4px 0 var(--ink)" }}
    >
      {children}
    </span>
  );
}

// A small confetti burst for reward beats.
export function Confetti({ count = 24 }: { count?: number }) {
  const colors = ["var(--grape)", "var(--coral)", "var(--sunny)", "var(--riso-pink)", "var(--pine)"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 6) * 0.06;
        const color = colors[i % colors.length];
        const drift = ((i * 53) % 60) - 30;
        return (
          <motion.span
            key={i}
            className="absolute top-0 rounded-[1px]"
            style={{ left: `${left}%`, width: 7, height: 11, background: color }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ y: ["-5%", "120%"], x: drift, opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration: 1.6, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
