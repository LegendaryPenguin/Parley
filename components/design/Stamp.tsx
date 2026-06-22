"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

// Pre-computed ink flecks that flick outward on impact (radius + size).
// Defined once at module scope so it isn't rebuilt on every render.
const FLECKS = [
  { x: -46, y: -30, s: 5 },
  { x: 44, y: -34, s: 4 },
  { x: 52, y: 18, s: 6 },
  { x: -50, y: 22, s: 4 },
  { x: 8, y: 54, s: 5 },
  { x: -16, y: -52, s: 3 },
] as const;

// The rubber-stamp reward signature. Slams down with a tiny shake, an ink bloom,
// and ragged rubber-stamp ink texture — earned and a little loud.
export function Stamp({
  label,
  sublabel,
  color = "var(--marigold)",
  size = 132,
  animate = true,
}: {
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[:]/g, "");
  const inkId = `ink-${uid}`;
  const bloomId = `bloom-${uid}`;

  // Reduced motion (or animate=false): just fade/settle into place, no slam.
  const play = animate && !reduce;

  return (
    <motion.div
      initial={animate ? { scale: play ? 2.2 : 1.05, opacity: 0, rotate: -8 } : false}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={
        play
          ? { type: "spring", stiffness: 700, damping: 13, mass: 0.7 }
          : { duration: 0.25, ease: "easeOut" }
      }
      style={{ width: size, height: size, color }}
      className="relative grid place-items-center select-none"
      aria-label={`Stamp: ${label}${sublabel ? `, ${sublabel}` : ""}`}
      role="img"
      // a tiny kid-pleasing wiggle when you poke or hover the stamp — settles back flat
      whileHover={play ? { rotate: -2, scale: 1.04 } : undefined}
      whileTap={play ? { rotate: -14, scale: 0.96 } : undefined}
    >
      {/* ink bloom — a soft ring that punches outward on impact, then fades */}
      {play && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full overprint"
          style={{ background: "currentColor" }}
          initial={{ scale: 0.45, opacity: 0.42 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.04 }}
        />
      )}

      {/* ink flecks — a few specks that flick outward as the stamp lands, like
          splattered rubber-stamp ink. Pure delight; aria-hidden + reduced-motion safe. */}
      {play && (
        <span aria-hidden className="pointer-events-none absolute inset-0 overprint">
          {FLECKS.map((f, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{ width: f.s, height: f.s, background: "currentColor" }}
              initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.4 }}
              animate={{
                x: `calc(-50% + ${f.x}px)`,
                y: `calc(-50% + ${f.y}px)`,
                opacity: [0, 0.85, 0],
                scale: [0.4, 1, 0.7],
              }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 + i * 0.012 }}
            />
          ))}
        </span>
      )}

      {/* a little shudder after the slam, so it lands with weight */}
      <motion.svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="relative overprint"
        initial={false}
        animate={play ? { rotate: [-13, -5, -8] } : { rotate: 0 }}
        transition={play ? { duration: 0.35, times: [0, 0.55, 1], ease: "easeOut" } : { duration: 0 }}
      >
        <defs>
          {/* rough rubber-ink edge: turbulence pushes the strokes around */}
          <filter id={inkId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          {/* speckled ink-bleed mask: thins the fill so it reads as printed rubber */}
          <filter id={bloomId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.14 0.18" numOctaves="3" seed="11" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.05" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>

        {/* faint printed ink-bleed wash under the whole mark */}
        <circle cx="60" cy="60" r="52" fill="currentColor" filter={`url(#${bloomId})`} opacity="0.18" />

        <g filter={`url(#${inkId})`}>
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray="2 5"
          />
          <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="2" />

          {/* tiny printer's stars flanking the label, riso-chrome flourish */}
          <text x="14" y="64" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="800">
            ✦
          </text>
          <text x="106" y="64" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="800">
            ✦
          </text>

          <text
            x="60"
            y={sublabel ? 56 : 66}
            textAnchor="middle"
            fontFamily="var(--font-bricolage), sans-serif"
            fontWeight="800"
            fontSize="20"
            fill="currentColor"
            style={{ textTransform: "uppercase", letterSpacing: "1px" }}
          >
            {label}
          </text>
          {sublabel && (
            <text
              x="60"
              y="76"
              textAnchor="middle"
              fontFamily="var(--font-space-mono), monospace"
              fontSize="9"
              fill="currentColor"
              style={{ letterSpacing: "2px", textTransform: "uppercase" }}
            >
              {sublabel}
            </text>
          )}
          <path
            d="M22 88 q38 14 76 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </motion.svg>
    </motion.div>
  );
}
