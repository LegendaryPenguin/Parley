"use client";

import { motion, useReducedMotion } from "framer-motion";

// Floating riso-arcade decorations — the Zero Cup energy scattered over a scene.
// Purely decorative: aria-hidden + pointer-events-none so they never steal a tap
// or a screen-reader's attention. Drift respects prefers-reduced-motion via the
// global .float-bob keyframe (which pauses), and the spin we add below is dropped
// entirely when reduced motion is requested.
type ShapeKind = "cube" | "star" | "dots" | "burst" | "ring" | "coin" | "wedge";

const SHAPES: { kind: ShapeKind; x: string; y: string; c: string; s: number; rot: number }[] = [
  { kind: "cube", x: "6%", y: "18%", c: "var(--grape)", s: 38, rot: -8 },
  { kind: "star", x: "88%", y: "12%", c: "var(--sunny)", s: 30, rot: 6 },
  { kind: "dots", x: "82%", y: "70%", c: "var(--coral)", s: 56, rot: 0 },
  { kind: "burst", x: "12%", y: "78%", c: "var(--riso-pink)", s: 34, rot: 12 },
  { kind: "cube", x: "92%", y: "44%", c: "var(--riso-blue)", s: 28, rot: 10 },
  { kind: "dots", x: "4%", y: "48%", c: "var(--grape)", s: 44, rot: 0 },
  { kind: "ring", x: "70%", y: "26%", c: "var(--pine)", s: 30, rot: 0 },
  { kind: "coin", x: "30%", y: "10%", c: "var(--marigold)", s: 26, rot: -6 },
  { kind: "wedge", x: "58%", y: "84%", c: "var(--riso-blue)", s: 32, rot: 18 },
  { kind: "star", x: "46%", y: "32%", c: "var(--riso-pink)", s: 22, rot: -14 },
];

// Shapes that read well when slowly spinning (vs. ones that look odd rotating).
const SPINNERS: ShapeKind[] = ["coin", "ring", "burst"];

function Shape({ kind, c, s }: { kind: ShapeKind; c: string; s: number }) {
  switch (kind) {
    case "cube":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <path d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z" fill={c} stroke="var(--ink)" strokeWidth="2" />
          <path d="M20 4 L34 12 L20 20 L6 12 Z" fill="#fff" opacity="0.35" />
          <path d="M20 20 L20 36 L6 28 L6 12 Z" fill="#000" opacity="0.12" />
        </svg>
      );
    case "star":
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
    case "burst":
      // four-point sparkle / "ding!" — the little reward twinkle.
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <path
            d="M20 1 C22 13 27 18 39 20 C27 22 22 27 20 39 C18 27 13 22 1 20 C13 18 18 13 20 1 Z"
            fill={c}
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ring":
      // concentric riso target — printed dot, but bolder.
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="20" cy="20" r="18" fill={c} opacity="0.18" />
          <circle cx="20" cy="20" r="9" fill={c} stroke="var(--ink)" strokeWidth="2" />
        </svg>
      );
    case "coin":
      // arcade token, slightly oval to feel hand-printed.
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="17" fill={c} stroke="var(--ink)" strokeWidth="2" />
          <circle cx="20" cy="20" r="11" fill="none" stroke="var(--ink)" strokeWidth="1.6" opacity="0.55" />
          <path d="M16 14 L24 14 M20 12 L20 28 M16 26 L24 26" stroke="var(--ink)" strokeWidth="1.6" opacity="0.55" />
        </svg>
      );
    case "wedge":
      // overprinted triangle pennant — travel-flag energy.
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <path d="M6 6 L36 12 L10 34 Z" fill={c} stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
          <path d="M6 6 L36 12 L10 20 Z" fill="#fff" opacity="0.28" />
        </svg>
      );
    case "dots":
    default:
      // halftone cluster — the printed-dots texture.
      return <div className="halftone" style={{ width: s, height: s, color: c, opacity: 0.7 }} />;
  }
}

export function FloatingShapes() {
  const reduce = useReducedMotion();
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      {SHAPES.map((sh, i) => {
        const spins = !reduce && SPINNERS.includes(sh.kind);
        return (
          <motion.div
            key={i}
            className="absolute float-bob overprint"
            style={{ left: sh.x, top: sh.y, ["--rot" as string]: `${sh.rot}deg`, animationDelay: `${i * 0.8}s` }}
            // Playful "pop in" as the scene assembles — each scrap springs onto the
            // page a beat after the last. Skipped entirely under reduced motion so
            // the shapes simply appear in place.
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={spins ? { rotate: 360, scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={
              spins
                ? {
                    rotate: { duration: 14 + (i % 4) * 3, repeat: Infinity, ease: "linear" },
                    scale: { type: "spring", stiffness: 320, damping: 16, delay: i * 0.05 },
                    opacity: { duration: 0.3, delay: i * 0.05 },
                  }
                : { type: "spring", stiffness: 320, damping: 16, delay: i * 0.05 }
            }
          >
            <Shape kind={sh.kind} c={sh.c} s={sh.s} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Retro pixel badge — like the Zero Cup "32 TEAMS" nodes. Chunky ink outline,
// hard offset shadow, a glint of highlight across the top for printed sheen.
export function PixelBadge({
  children,
  color = "var(--grape)",
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`pixel-badge relative inline-grid place-items-center rounded-full border-[3px] border-ink text-paper px-3 py-2 overflow-hidden ${className}`}
      style={{ background: color, boxShadow: "0 4px 0 var(--ink)" }}
      // Tactile "press the coin" feel: a tiny squish + settle into the offset
      // shadow on tap, a gentle lift on hover. All disabled under reduced motion.
      whileHover={reduce ? undefined : { y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.94, y: 2 }}
      transition={{ type: "spring", stiffness: 600, damping: 20 }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.30), transparent)" }}
      />
      <span className="relative">{children}</span>
    </motion.span>
  );
}

// A confetti burst for reward beats — mixed paper scraps: rectangles, discs, and
// little stars tumbling down with drift and sway. Fully decorative; under reduced
// motion it renders a single calm fade-in instead of a falling animation.
const CONFETTI_COLORS = [
  "var(--grape)",
  "var(--coral)",
  "var(--sunny)",
  "var(--riso-pink)",
  "var(--pine)",
  "var(--riso-blue)",
  "var(--marigold)",
];

function ConfettiPiece({ shape, color }: { shape: number; color: string }) {
  // 0 = rect scrap, 1 = disc, 2 = tiny star
  if (shape === 1) {
    return <span className="block rounded-full" style={{ width: 9, height: 9, background: color }} />;
  }
  if (shape === 2) {
    return (
      <svg width={12} height={12} viewBox="0 0 40 40" aria-hidden>
        <path d="M20 2 L25 15 L39 15 L28 24 L32 38 L20 29 L8 38 L12 24 L1 15 L15 15 Z" fill={color} />
      </svg>
    );
  }
  return <span className="block rounded-[1px]" style={{ width: 7, height: 12, background: color }} />;
}

export function Confetti({ count = 24 }: { count?: number }) {
  const reduce = useReducedMotion();

  if (reduce) {
    // Calm celebration: a still scatter that gently fades in, no falling.
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {Array.from({ length: count }).map((_, i) => {
          const left = (i * 37) % 100;
          const top = (i * 53) % 100;
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          return (
            <motion.span
              key={i}
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%` }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0.85], scale: 1 }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.04 }}
            >
              <ConfettiPiece shape={i % 3} color={color} />
            </motion.span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 6) * 0.06;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const drift = ((i * 53) % 60) - 30;
        const sway = ((i * 29) % 24) - 12;
        const spin = (i % 2 === 0 ? 1 : -1) * (360 + (i % 3) * 180);
        return (
          <motion.span
            key={i}
            className="absolute top-0"
            style={{ left: `${left}%` }}
            initial={{ y: -24, opacity: 0, rotate: 0 }}
            animate={{
              y: ["-5%", "120%"],
              x: [0, sway, drift],
              opacity: [0, 1, 1, 0],
              rotate: spin,
            }}
            transition={{ duration: 1.6 + (i % 4) * 0.18, delay, ease: "easeIn" }}
          >
            <ConfettiPiece shape={i % 3} color={color} />
          </motion.span>
        );
      })}
    </div>
  );
}
