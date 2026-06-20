"use client";

import { motion } from "framer-motion";

// The rubber-stamp reward signature. Slams down with a tiny shake + ink bloom.
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
  return (
    <motion.div
      initial={animate ? { scale: 1.8, opacity: 0, rotate: -18 } : false}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 600, damping: 14, mass: 0.6 }}
      style={{ width: size, height: size, color }}
      className="relative grid place-items-center"
      aria-label={`Stamp: ${label}`}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} className="overprint">
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
            style={{ letterSpacing: "2px" }}
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
      </svg>
    </motion.div>
  );
}
