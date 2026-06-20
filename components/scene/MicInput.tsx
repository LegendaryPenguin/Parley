"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Push-to-talk + text. Speaking draws an ink waveform. STT via the browser
// SpeechRecognition API (0G STT slots in here later, Brief §6). Always typeable.

type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

// Inky waveform — taller, livelier bars that "speak" while you hold.
const BAR_HEIGHTS = ["35%", "100%", "55%", "85%", "40%", "95%", "50%"];

function InkWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-5" aria-hidden>
      {BAR_HEIGHTS.map((peak, i) => (
        <motion.span
          key={i}
          className="block w-[3px] rounded-full bg-riso-pink"
          style={{ height: peak }}
          initial={{ scaleY: 0.25 }}
          animate={active ? { scaleY: [0.25, 1, 0.4] } : { scaleY: 0.25 }}
          transition={
            active
              ? {
                  duration: 0.55 + (i % 3) * 0.12,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: i * 0.06,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

export function MicInput({
  onSend,
  disabled,
  lang = "es-ES",
  placeholder = "Say it…",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  lang?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SR | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SR;
      webkitSpeechRecognition?: new () => SR;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (Ctor) {
      setSupported(true);
      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setText(t);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
    }
  }, [lang]);

  function startListen() {
    if (!recRef.current || disabled) return;
    try {
      setText("");
      recRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }
  function stopListen() {
    recRef.current?.stop();
    setListening(false);
  }

  // Tiny "whoosh!" pop on the send button — a kid-pleasing reward for talking.
  const [justSent, setJustSent] = useState(false);

  function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    setJustSent(true);
    window.setTimeout(() => setJustSent(false), 320);
  }

  const canSend = !disabled && !!text.trim();

  return (
    <div className="flex items-end gap-2">
      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={listening ? "Listening… keep talking" : placeholder}
          className="w-full resize-none bg-paper border-2 border-ink rounded-sm px-3 py-2.5 pr-14 font-read text-ink placeholder:text-ink-soft/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 transition-shadow"
          style={listening ? { boxShadow: "3px 3px 0 var(--riso-pink)" } : undefined}
        />

        {/* Live ink waveform tucked inside the field while you speak */}
        <AnimatePresence>
          {listening && (
            <motion.div
              key="wave"
              className="absolute right-3 bottom-3 pointer-events-none"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              <InkWaveform active />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {supported && (
        <button
          type="button"
          onMouseDown={startListen}
          onMouseUp={stopListen}
          onMouseLeave={() => listening && stopListen()}
          onTouchStart={(e) => {
            e.preventDefault();
            startListen();
          }}
          onTouchEnd={stopListen}
          disabled={disabled}
          aria-label="Hold to speak"
          aria-pressed={listening}
          title="Hold to speak"
          className={`relative shrink-0 grid place-items-center w-12 h-12 rounded-sm border-2 border-ink select-none touch-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed ${
            listening ? "bg-riso-pink text-paper" : "bg-marigold text-ink hover:bg-sunny"
          }`}
          style={{ boxShadow: listening ? "none" : "3px 3px 0 var(--ink)" }}
        >
          {/* Pulsing halo invites the press; calms under reduced-motion */}
          {listening && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-sm border-2 border-riso-pink motion-reduce:hidden"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          {/* The mic itself leans into the rhythm while you talk (still under reduced-motion). */}
          <motion.span
            className="text-lg leading-none"
            aria-hidden
            animate={listening && !reduceMotion ? { rotate: [-7, 7, -7] } : { rotate: 0 }}
            transition={
              listening && !reduceMotion
                ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            🎤
          </motion.span>
        </button>
      )}

      <motion.button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="Send your message"
        className="shrink-0 font-display font-extrabold uppercase text-sm tracking-wide text-paper px-4 h-12 rounded-sm border-2 border-ink transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riso-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
        style={{
          background: "var(--riso-blue)",
          boxShadow: canSend ? "3px 3px 0 var(--ink)" : "none",
        }}
        // Pops on send; gives a gentle "I'm ready!" wiggle the moment you have something to say.
        animate={
          justSent && !reduceMotion
            ? { scale: [1, 1.14, 0.96, 1], rotate: [0, -3, 2, 0] }
            : canSend && !reduceMotion
              ? { scale: [1, 1.04, 1] }
              : { scale: 1, rotate: 0 }
        }
        transition={
          justSent && !reduceMotion
            ? { duration: 0.32, ease: "easeOut" }
            : canSend && !reduceMotion
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
        }
      >
        Say it
      </motion.button>
    </div>
  );
}
