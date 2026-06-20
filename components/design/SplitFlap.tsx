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
}: {
  target: string;
  delay: number;
  reduced: boolean;
}) {
  const [glyph, setGlyph] = useState(reduced ? target : GLYPHS[0]);
  const [settled, setSettled] = useState(reduced);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setGlyph(target);
      setSettled(true);
      return;
    }
    let frame = 0;
    const total = 8 + Math.floor(delay * 6);
    const start = delay * 90;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      frame += 1;
      if (frame >= total) {
        setGlyph(target.toUpperCase());
        setSettled(true);
        return;
      }
      setGlyph(GLYPHS[(frame * 7) % GLYPHS.length]);
      timer = setTimeout(tick, 45);
    };
    const kickoff = setTimeout(tick, start);
    return () => {
      clearTimeout(kickoff);
      clearTimeout(timer);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, delay, reduced]);

  return (
    <span
      className="font-mono inline-flex items-center justify-center select-none"
      style={{
        minWidth: target === " " ? "0.35em" : "0.72em",
        background: "var(--ink)",
        color: settled ? "var(--paper)" : "var(--marigold)",
        borderRadius: "2px",
        padding: "0.08em 0.04em",
        margin: "0 0.03em",
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.35)",
        transform: settled ? "rotateX(0deg)" : "rotateX(-12deg)",
        transition: "color 80ms, transform 80ms",
        lineHeight: 1,
      }}
    >
      {glyph === " " ? " " : glyph}
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
  return (
    <span
      className={`inline-flex flex-wrap ${className}`}
      style={{ fontSize: size, perspective: "300px" }}
      aria-label={text}
      role="text"
    >
      {chars.map((c, i) => (
        <Flap key={`${i}-${c}`} target={c} delay={i} reduced={reduced} />
      ))}
    </span>
  );
}
