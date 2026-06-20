"use client";

import { useEffect } from "react";
import { useGame } from "./useGame";

export const ACTIVE_WALLET_KEY = "pw:activeWallet";

// Hydrate the store from 0G Storage (mock=localStorage) for the active wallet.
export function useBoot() {
  const hydrated = useGame((s) => s.hydrated);
  const init = useGame((s) => s.init);
  const profile = useGame((s) => s.profile);

  useEffect(() => {
    if (hydrated) return;
    const id = typeof window !== "undefined" ? window.localStorage.getItem(ACTIVE_WALLET_KEY) : null;
    if (id) void init(id);
    else useGame.setState({ hydrated: true }); // nothing to load → show Arrival
  }, [hydrated, init]);

  return { hydrated, profile };
}

export function setActiveWallet(id: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(ACTIVE_WALLET_KEY, id);
}
