"use client";

import { create } from "zustand";

// A tiny in-memory log of 0G activity (compute calls, storage uploads, chain
// anchors) surfaced by the dev panel so you can watch — and open — on-chain
// transactions as they happen during a demo.

export type TxKind = "compute" | "storage" | "chain";

export interface TxEntry {
  id: string;
  kind: TxKind;
  title: string; // human label, e.g. "Anchor · Market"
  value: string; // tx hash / content root / request id
  href?: string; // explorer link if available
  live: boolean; // false = mock/demo value
  ts: number;
}

const CHAIN_EXPLORER =
  process.env.NEXT_PUBLIC_OG_CHAIN_EXPLORER ?? "https://chainscan-galileo.0g.ai";
const STORAGE_EXPLORER =
  process.env.NEXT_PUBLIC_OG_STORAGE_EXPLORER ?? "https://storagescan-galileo.0g.ai";

export function chainTxUrl(hash: string): string {
  return `${CHAIN_EXPLORER}/tx/${hash}`;
}
export function storageUrl(root: string): string {
  return `${STORAGE_EXPLORER}/file?root=${root}`;
}

interface TxLogState {
  entries: TxEntry[];
  log: (e: Omit<TxEntry, "id" | "ts">) => void;
  clear: () => void;
}

let counter = 0;

export const useTxLog = create<TxLogState>((set) => ({
  entries: [],
  log: (e) =>
    set((s) => ({
      entries: [{ ...e, id: `tx_${++counter}`, ts: Date.now() }, ...s.entries].slice(0, 60),
    })),
  clear: () => set({ entries: [] }),
}));

// convenience helpers used by the store / client api
export function logCompute(label: string, requestId: string | undefined, model: string | undefined, live: boolean) {
  if (!requestId) return;
  useTxLog.getState().log({
    kind: "compute",
    title: `${label}${model ? ` · ${model}` : ""}`,
    value: requestId,
    live,
  });
}
export function logStorage(label: string, root: string, live: boolean) {
  useTxLog.getState().log({
    kind: "storage",
    title: `Storage · ${label}`,
    value: root,
    href: live ? storageUrl(root) : undefined,
    live,
  });
}
export function logChain(label: string, txHash: string, live: boolean) {
  useTxLog.getState().log({
    kind: "chain",
    title: `Anchor · ${label}`,
    value: txHash,
    href: live ? chainTxUrl(txHash) : undefined,
    live,
  });
}
