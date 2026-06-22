"use client";

import { useEffect, useState } from "react";
import { initMutedFromStorage, setMuted } from "@/lib/audio/engine";
import { SpeakerIcon } from "./Icons";

// Global mute toggle. Sound is OFF by default (autoplay-safe). Fixed top-right.
export function SoundToggle() {
  const [muted, setMutedState] = useState(true);

  useEffect(() => {
    setMutedState(initMutedFromStorage());
  }, []);

  function toggle() {
    const next = setMuted(!muted);
    setMutedState(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      title={muted ? "Sound off" : "Sound on"}
      className="fixed top-3 right-3 z-30 grid place-items-center w-10 h-10 rounded-full border-2 border-ink bg-paper/90 backdrop-blur-sm text-ink hover:bg-sunny transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      style={{ boxShadow: "2px 2px 0 var(--ink)" }}
    >
      <span className="relative">
        <SpeakerIcon size={18} />
        {muted && (
          <svg width={18} height={18} viewBox="0 0 24 24" className="absolute inset-0" aria-hidden>
            <line x1="3" y1="21" x2="21" y2="3" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
