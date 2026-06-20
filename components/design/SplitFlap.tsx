"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ¿?¡!ÁÉÍÓÚÑ".split("");

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function Flap({
  target,
  delay,
  reduced,
  onSettle,
}: {
  target: string;
  delay: number;
  reduced: boolean;
  onSettle?: () => void;
}) {
  const [glyph, setGlyph] = useState(reduced ? target.toUpperCase() : GLYPHS[0]);
  const [settled, setSettled] = useState(reduced);
  // `flip` toggles every tick so the top half re-folds on each card — the
  // little nod that sells the mechanical clatter.
  const [flip, setFlip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // keep the latest onSettle without re-triggering the clatter effect
  const settleRef = useRef(onSettle);
  settleRef.current = onSettle;

  useEffect(() => {
    if (reduced) {
      setGlyph(target.toUpperCase());
      setSettled(true);
      settleRef.current?.();
      return;
    }
    setSettled(false);
    let frame = 0;
    // More cards for letters further down the row, so the board resolves
    // left-to-right like a real arrival sweep.
    const total = 9 + Math.floor(delay * 1.4);
    const start = delay * 65;
    let kickoff: ReturnType<typeof setTimeout>;

    const tick = () => {
      frame += 1;
      setFlip((f) => !f);
      if (frame >= total) {
        setGlyph(target.toUpperCase());
        // settle one frame later so the final card snaps shut crisply
        timer.current = setTimeout(() => {
          setSettled(true);
          settleRef.current?.();
        }, 26);
        return;
      }
      // ramp from fast clatter to a slower, deliberate last few flaps
      const remaining = total - frame;
      const step = remaining <= 3 ? 78 : 34 + (frame % 2) * 6;
      setGlyph(GLYPHS[(frame * 7 + delay * 3) % GLYPHS.length]);
      timer.current = setTimeout(tick, step);
    };

    kickoff = setTimeout(tick, start);
    return () => {
      clearTimeout(kickoff);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [target, delay, reduced]);

  const isSpace = target === " ";

  return (
    <span
      className="font-mono relative inline-flex items-center justify-center select-none"
      style={{
        minWidth: isSpace ? "0.34em" : "0.74em",
        height: "1.32em",
        background: isSpace
          ? "transparent"
          : "linear-gradient(180deg, #2a2521 0%, var(--ink) 48%, #1a1613 52%, #2a2521 100%)",
        color: settled ? "var(--paper)" : "var(--marigold)",
        borderRadius: "3px",
        padding: "0 0.05em",
        margin: "0 0.045em",
        // printed depth: hairline highlight on top, deep drop below
        boxShadow: isSpace
          ? "none"
          : settled
            ? "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 0 rgba(0,0,0,0.45), 0 2px 0 rgba(0,0,0,0.28)"
            : "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -3px 0 rgba(0,0,0,0.5), 0 3px 1px rgba(0,0,0,0.3)",
        transform: settled
          ? "translateY(0) rotateX(0deg)"
          : `translateY(-0.5px) rotateX(${flip ? -16 : -2}deg)`,
        transformOrigin: "center",
        transition: settled
          ? "transform 90ms cubic-bezier(.2,1.6,.4,1), color 60ms, box-shadow 120ms"
          : "transform 38ms ease-out, color 50ms",
        transformStyle: "preserve-3d",
        lineHeight: 1,
        willChange: "transform",
      }}
    >
      {/* center seam — the hinge line of the split flap */}
      {!isSpace && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: "1px",
            transform: "translateY(-0.5px)",
            background: "rgba(0,0,0,0.55)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
      )}
      <span aria-hidden style={{ position: "relative", zIndex: 1 }}>
        {isSpace ? " " : glyph}
      </span>
    </span>
  );
}

export function SplitFlap({
  text,
  className = "",
  size = "1.4rem",
}: {
  text: string;
  className?: string;
  size?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const chars = text.split("");
  // Count down the non-space cells; when the last one snaps shut we light up
  // the whole sign with a quick marigold "arrival" pulse — the payoff.
  const pending = useRef(chars.filter((c) => c !== " ").length);
  const [arrived, setArrived] = useState(false);

  // Re-arm the counter whenever the sign's text changes in place (no remount),
  // so the arrival pulse fires once per fresh word and never goes negative.
  useEffect(() => {
    pending.current = chars.filter((c) => c !== " ").length;
    setArrived(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const handleSettle = () => {
    pending.current -= 1;
    if (pending.current <= 0 && !reduced) {
      // flash on, then let it fade out
      setArrived(true);
      window.setTimeout(() => setArrived(false), 620);
    }
  };

  return (
    <span
      className={`relative inline-flex flex-wrap items-center ${className}`}
      style={{ fontSize: size, perspective: "420px" }}
      aria-label={text}
      role="img"
    >
      {/* arrival glow — a warm halo behind the row the instant the word lands */}
      {!reduced && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "-0.35em -0.5em",
            borderRadius: "0.4em",
            background:
              "radial-gradient(120% 120% at 50% 50%, var(--marigold) 0%, transparent 70%)",
            opacity: arrived ? 0.45 : 0,
            transform: arrived ? "scale(1)" : "scale(0.96)",
            transition: "opacity 540ms ease-out, transform 540ms ease-out",
            mixBlendMode: "multiply",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
      {chars.map((c, i) => (
        <Flap
          key={`${i}-${c}`}
          target={c}
          delay={i}
          reduced={reduced}
          onSettle={handleSettle}
        />
      ))}
    </span>
  );
}
