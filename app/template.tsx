"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Route transition template (Next.js 16 App Router).
 *
 * Next gives this component a fresh `key` on every navigation, so it
 * remounts as you move between Atlas / Scene / Phrasebook / Passport.
 * We lean on that remount to play a quick "overprint slide": two riso
 * ink layers (blue + pink) arrive slightly offset, then register onto
 * the page — like a freshly printed travelogue spread turning over.
 *
 * It's deliberately fast and subtle so it never blocks interaction, and
 * it fully collapses to a plain render under prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  // No transforms / animation when the user prefers reduced motion —
  // just hand back the children untouched.
  if (reduceMotion) {
    return <>{children}</>;
  }

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div className="relative isolate">
      {/* Riso-blue plate: arrives from one side, then registers to 0. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-riso-blue mix-blend-multiply"
        initial={{ opacity: 0.32, x: -10, y: -7 }}
        animate={{ opacity: 0, x: 0, y: 0 }}
        transition={{ duration: 0.42, ease, opacity: { duration: 0.34, ease } }}
      />
      {/* Riso-pink plate: offset the opposite way, slightly slower to register. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-riso-pink mix-blend-multiply"
        initial={{ opacity: 0.3, x: 11, y: 8 }}
        animate={{ opacity: 0, x: 0, y: 0 }}
        transition={{ duration: 0.46, ease, opacity: { duration: 0.36, ease } }}
      />
      {/* The page content itself slides in and registers. */}
      <motion.div
        initial={{ opacity: 0, x: 8, y: 6 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.4, ease }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
