"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTxLog, type TxEntry } from "@/lib/dev/txlog";
import { ChainIcon, StorageIcon, CpuIcon } from "./Icons";

// Unobtrusive 0G activity panel — a small chip bottom-right that opens a live log
// of compute calls, storage uploads, and on-chain anchors, with explorer links
// you can open. Handy for demos ("watch the transactions land").

const KIND_META = {
  chain: { Icon: ChainIcon, color: "var(--gold-s, #f08c00)", label: "chain" },
  storage: { Icon: StorageIcon, color: "var(--pine)", label: "storage" },
  compute: { Icon: CpuIcon, color: "var(--riso-blue)", label: "compute" },
} as const;

function short(v: string) {
  return v.length > 18 ? `${v.slice(0, 10)}…${v.slice(-6)}` : v;
}

function Row({ e }: { e: TxEntry }) {
  const { Icon, color } = KIND_META[e.kind];
  const [copied, setCopied] = useState(false);
  const body = (
    <span className="flex items-center gap-2 min-w-0">
      <span style={{ color }} className="shrink-0">
        <Icon size={14} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[0.72rem] text-ink leading-tight truncate">{e.title}</span>
        <span className="block font-mono text-[0.62rem] text-ink/55 leading-tight truncate">
          {short(e.value)} {!e.live && <span className="text-marigold">· demo</span>}
        </span>
      </span>
    </span>
  );
  return (
    <li className="flex items-center justify-between gap-2 border-b border-ink/10 py-1.5">
      {e.href ? (
        <a href={e.href} target="_blank" rel="noreferrer" className="min-w-0 hover:underline decoration-riso-blue">
          {body}
        </a>
      ) : (
        body
      )}
      <button
        onClick={() => {
          navigator.clipboard?.writeText(e.value);
          setCopied(true);
          setTimeout(() => setCopied(false), 900);
        }}
        className="shrink-0 label-mono text-[0.55rem] text-ink/50 hover:text-ink rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink px-1"
        aria-label="Copy"
        title="Copy"
      >
        {copied ? "✓" : "copy"}
      </button>
    </li>
  );
}

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const entries = useTxLog((s) => s.entries);
  const clear = useTxLog((s) => s.clear);

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="mb-2 w-[300px] max-h-[60vh] overflow-y-auto rounded-sm border-2 border-ink bg-paper/95 backdrop-blur-sm p-3 shadow-[3px_3px_0_var(--ink)]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="label-mono text-[0.62rem] text-ink">0G activity ⛓</span>
              <button onClick={clear} className="label-mono text-[0.55rem] text-ink/50 hover:text-coral">
                clear
              </button>
            </div>
            {entries.length === 0 ? (
              <p className="font-read italic text-ink-soft text-xs py-2">
                Nothing yet — complete a scene to see storage roots + on-chain anchors land here.
              </p>
            ) : (
              <ul>
                {entries.map((e) => (
                  <Row key={e.id} e={e} />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="0G dev panel"
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-paper/80 text-ink/70 backdrop-blur-sm hover:bg-paper hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        style={{ boxShadow: "2px 2px 0 var(--ink)" }}
        title="0G activity (dev)"
      >
        <ChainIcon size={16} />
        {entries.length > 0 && (
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-pine px-1 text-[0.55rem] text-paper border border-ink">
            {entries.length}
          </span>
        )}
      </button>
    </div>
  );
}
