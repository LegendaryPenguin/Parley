"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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

  function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  }

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
          placeholder={placeholder}
          className="w-full resize-none bg-paper border-2 border-ink rounded-sm px-3 py-2 pr-12 font-read focus:outline-none disabled:opacity-50"
        />
        {listening && (
          <div className="absolute right-3 bottom-2.5 flex items-end gap-0.5 h-5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="w-0.5 bg-riso-pink"
                animate={{ height: ["20%", "100%", "30%"] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        )}
      </div>

      {supported && (
        <button
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
          className={`shrink-0 w-12 h-11 rounded-sm border-2 border-ink grid place-items-center transition-colors ${
            listening ? "bg-riso-pink text-paper" : "bg-paper hover:bg-paper-deep"
          }`}
          title="Hold to speak"
        >
          🎤
        </button>
      )}

      <button
        onClick={submit}
        disabled={disabled || !text.trim()}
        className="shrink-0 font-display font-bold uppercase text-sm tracking-wide text-paper px-4 h-11 rounded-sm disabled:opacity-40"
        style={{ background: "var(--riso-blue)", boxShadow: "3px 3px 0 var(--ink)" }}
      >
        Say it
      </button>
    </div>
  );
}
