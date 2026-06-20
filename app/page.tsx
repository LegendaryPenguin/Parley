"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { NPCPortrait } from "@/components/design/RisoIllustration";
import { PrimaryButton, GhostButton, Panel } from "@/components/design/ui";
import { LANGUAGES, AVATARS } from "@/lib/content/world";
import { useGame } from "@/lib/store/useGame";
import { setActiveWallet, useBoot } from "@/lib/store/boot";

type Step = "cold" | "setup" | "stamping";

export default function Arrival() {
  const router = useRouter();
  const { hydrated, profile } = useBoot();
  const createProfile = useGame((s) => s.createProfile);

  const [step, setStep] = useState<Step>("cold");
  const [headline, setHeadline] = useState("PARLEY");
  const [name, setName] = useState("");
  const [lang, setLang] = useState("es");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [wallet, setWallet] = useState("");

  // If a profile already exists, skip straight to the Atlas.
  useEffect(() => {
    if (hydrated && profile) router.replace("/atlas");
  }, [hydrated, profile, router]);

  // Cold-open headline flip.
  useEffect(() => {
    if (step !== "cold") return;
    const t = setTimeout(() => setHeadline("WHERE TO?"), 1800);
    return () => clearTimeout(t);
  }, [step]);

  async function connectWallet() {
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string[]> } }).ethereum;
    if (eth) {
      try {
        const accts = await eth.request({ method: "eth_requestAccounts" });
        if (accts?.[0]) return accts[0];
      } catch {
        /* fall through to demo wallet */
      }
    }
    return process.env.NEXT_PUBLIC_DEMO_WALLET ?? "0xDEMO" + Math.floor(Date.now() % 1e8).toString(16);
  }

  async function getStamped() {
    if (!name.trim()) return;
    setStep("stamping");
    const id = await connectWallet();
    setWallet(id);
    setActiveWallet(id);
    await createProfile({
      id,
      displayName: name.trim(),
      avatarId: avatar,
      targetLanguage: lang,
      level: "A1",
    });
    setTimeout(() => router.push("/atlas"), 1700);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-10 relative overflow-hidden">
      {/* faint halftone field */}
      <div className="absolute inset-0 halftone text-riso-blue opacity-[0.06] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === "cold" && (
          <motion.div
            key="cold"
            exit={{ opacity: 0, y: -20 }}
            className="text-center relative z-10"
          >
            <SplitFlap key={headline} text={headline} size="clamp(2.5rem,9vw,5rem)" className="justify-center" />
            <p className="font-read italic text-ink-soft mt-6 text-lg max-w-sm mx-auto">
              Learn a language by living in it. Talk your way through an illustrated world —
              with locals who remember you.
            </p>
            <div className="mt-8">
              <PrimaryButton color="var(--riso-pink)" onClick={() => setStep("setup")}>
                Begin the journey
              </PrimaryButton>
            </div>
            <p className="label-mono text-ink/50 mt-10">built on 0G · testnet demo</p>
          </motion.div>
        )}

        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg relative z-10"
          >
            <p className="label-mono text-riso-pink">Passport № 0001</p>
            <h1 className="font-display text-3xl mt-1 mb-1">Get your passport stamped</h1>
            <p className="font-read text-ink-soft mb-6">
              Your passport keeps your words and your progress yours — and yours only.
              It&apos;s encrypted to you and stored on 0G.
            </p>

            <Panel className="p-5 space-y-5">
              <div>
                <label className="label-mono block mb-2">Traveler name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should the locals call you?"
                  className="w-full bg-paper-deep border-2 border-ink rounded-sm px-3 py-2 font-read focus:outline-none"
                />
              </div>

              <div>
                <label className="label-mono block mb-2">Language to learn</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`px-3 py-2 rounded-sm border-2 border-ink font-display text-sm transition-colors ${
                        lang === l.code ? "bg-riso-blue text-paper" : "bg-paper hover:bg-paper-deep"
                      }`}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
                {lang !== "es" && (
                  <p className="label-mono text-ink/50 mt-2">
                    Spanish is fully voiced in this demo; others coming.
                  </p>
                )}
              </div>

              <div>
                <label className="label-mono block mb-2">Choose a traveler</label>
                <div className="flex gap-3">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`rounded-sm border-2 transition-all ${
                        avatar === a ? "border-riso-pink scale-105" : "border-ink/30"
                      }`}
                      aria-label={`Avatar ${a}`}
                    >
                      <NPCPortrait npcId={`avatar-${a}`} name={a} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <PrimaryButton onClick={getStamped} disabled={!name.trim()}>
                  Get your passport stamped
                </PrimaryButton>
                <GhostButton onClick={() => setStep("cold")}>Back</GhostButton>
              </div>
            </Panel>
          </motion.div>
        )}

        {step === "stamping" && (
          <motion.div key="stamping" className="text-center relative z-10">
            <Stamp label="Parley" sublabel="ISSUED" color="var(--marigold)" size={180} />
            <p className="font-display text-xl mt-6">Passport issued to {name}</p>
            <p className="label-mono text-ink/60 mt-2">{wallet.slice(0, 6)}…{wallet.slice(-4)}</p>
            <p className="font-read italic text-ink-soft mt-4">Booking passage…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
