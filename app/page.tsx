"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SplitFlap } from "@/components/design/SplitFlap";
import { Stamp } from "@/components/design/Stamp";
import { NPCPortrait } from "@/components/design/RisoIllustration";
import { PrimaryButton, GhostButton, Panel } from "@/components/design/ui";
import { FloatingShapes, PixelBadge, Confetti } from "@/components/design/Playful";
import { LANGUAGES, AVATARS } from "@/lib/content/world";
import { useGame } from "@/lib/store/useGame";
import { setActiveWallet, useBoot } from "@/lib/store/boot";

type Step = "cold" | "setup" | "stamping";

// Avatars wear cheerful travel nicknames so picking one feels like meeting a buddy.
const AVATAR_NICK: Record<string, string> = {
  wren: "Wren",
  fox: "Fox",
  moth: "Moth",
  crane: "Crane",
};

export default function Arrival() {
  const router = useRouter();
  const reduce = useReducedMotion();
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

  const selectedLang = LANGUAGES.find((l) => l.code === lang);

  return (
    <main className="min-h-screen grid place-items-center px-6 py-10 relative overflow-hidden wash-joy">
      {/* faint halftone field + floating arcade shapes */}
      <div className="absolute inset-0 halftone text-indigo opacity-[0.05] pointer-events-none" aria-hidden />
      <FloatingShapes />

      <AnimatePresence mode="wait">
        {step === "cold" && (
          <motion.div
            key="cold"
            exit={{ opacity: 0, y: -20 }}
            className="text-center relative z-10"
          >
            {/* a little arrivals-board ticker over the title */}
            <motion.p
              className="label-mono text-riso-blue mb-4 inline-flex items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-coral float-bob" aria-hidden />
              Now boarding · all destinations
            </motion.p>

            <SplitFlap key={headline} text={headline} size="clamp(2.5rem,9vw,5rem)" className="justify-center" />

            <p className="font-read italic text-ink-soft mt-6 text-lg max-w-sm mx-auto">
              Learn a language by living in it. Talk your way through an illustrated world —
              with locals who remember you.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4">
              <PrimaryButton color="var(--riso-pink)" onClick={() => setStep("setup")} className="text-lg">
                Begin the journey
              </PrimaryButton>
              <span className="font-read text-ink-soft text-sm">
                No tickets, no luggage — just your voice.
              </span>
            </div>

            <p className="label-mono text-ink/50 mt-12">built on 0G · testnet demo</p>
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
            <div className="flex items-center justify-between mb-2">
              <p className="label-mono text-riso-pink">Boarding pass</p>
              <PixelBadge color="var(--marigold)" className="font-pixel text-[9px]">
                № 0001
              </PixelBadge>
            </div>
            <h1 className="font-display text-3xl mt-1 mb-1 text-indigo">Check in for your trip</h1>
            <p className="font-read text-ink-soft mb-6">
              Your passport keeps your words and your progress yours — and yours only.
              It&apos;s encrypted to you and stored on 0G.
            </p>

            <Panel className="p-5 space-y-5 overprint">
              {/* perforated boarding-pass top edge */}
              <div
                className="absolute -top-px left-0 right-0 h-1 opacity-60 pointer-events-none"
                style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--ink) 0 6px, transparent 6px 12px)" }}
                aria-hidden
              />

              <div>
                <label htmlFor="traveler-name" className="label-mono block mb-2">What should we call you?</label>
                <input
                  id="traveler-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The name the locals will remember"
                  className="w-full bg-paper-deep border-2 border-ink rounded-sm px-3 py-2.5 font-read text-ink placeholder:text-ink-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-grape/50"
                />
              </div>

              <div>
                <label className="label-mono block mb-2">Where are you headed?</label>
                <div className="flex flex-wrap gap-2.5">
                  {LANGUAGES.map((l) => {
                    const active = lang === l.code;
                    return (
                      <motion.button
                        key={l.code}
                        type="button"
                        onClick={() => setLang(l.code)}
                        aria-pressed={active}
                        whileTap={{ scale: 0.94 }}
                        whileHover={{ y: -2 }}
                        // Tiny "clicks into place" pop the moment a destination is chosen.
                        animate={active && !reduce ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className={`pill font-display font-bold text-sm px-4 py-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-grape/50 ${
                          active ? "text-paper" : "text-ink"
                        }`}
                        style={{ background: active ? "var(--riso-blue)" : "var(--paper)" }}
                      >
                        <span className="font-mono mr-1.5 opacity-80">{l.flag}</span>
                        {l.label}
                      </motion.button>
                    );
                  })}
                </div>
                {lang !== "es" ? (
                  <p className="label-mono text-ink-soft mt-2">
                    Spanish is fully voiced in this demo · {selectedLang?.label} is warming up
                  </p>
                ) : (
                  <p className="label-mono text-pine mt-2">Fully voiced · ready when you are</p>
                )}
              </div>

              <div>
                <label className="label-mono block mb-2">Pick your travel buddy</label>
                {/* Wrap to 2×2 on narrow phones so the four 120px portraits never
                    overflow the boarding pass — one-thumb friendly. */}
                <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                  {AVATARS.map((a) => {
                    const active = avatar === a;
                    return (
                      <motion.button
                        key={a}
                        type="button"
                        onClick={() => setAvatar(a)}
                        aria-pressed={active}
                        aria-label={`Travel buddy ${AVATAR_NICK[a] ?? a}`}
                        whileTap={{ scale: 0.92 }}
                        // A friendly "pick me!" wave on hover for the buddies still
                        // waiting to be chosen — dropped entirely under reduced motion.
                        whileHover={reduce || active ? undefined : { rotate: [0, -6, 6, -3, 0] }}
                        animate={active ? { y: -4 } : { y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className={`relative rounded-sm border-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-grape/50 ${
                          active ? "border-riso-pink" : "border-ink/30 hover:border-ink"
                        }`}
                      >
                        <NPCPortrait npcId={`avatar-${a}`} name={a} />
                        {active && (
                          <motion.span
                            layoutId="buddy-tag"
                            className="pixel-badge absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] px-2 py-1 text-paper rounded-full border-2 border-ink whitespace-nowrap"
                            style={{ background: "var(--riso-pink)" }}
                          >
                            {AVATAR_NICK[a] ?? a}
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <PrimaryButton onClick={getStamped} disabled={!name.trim()}>
                  Stamp my passport
                </PrimaryButton>
                <GhostButton onClick={() => setStep("cold")}>Back</GhostButton>
              </div>
            </Panel>
          </motion.div>
        )}

        {step === "stamping" && (
          <motion.div
            key="stamping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center relative z-10"
          >
            <Confetti count={28} />
            <Stamp label="Parley" sublabel="ISSUED" color="var(--marigold)" size={180} />
            <motion.p
              className="font-display text-2xl mt-6 text-indigo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              Welcome aboard, {name}
            </motion.p>
            <p className="label-mono text-ink-soft mt-2">
              Passport {wallet.slice(0, 6)}…{wallet.slice(-4)} · heading to {selectedLang?.label ?? "the world"}
            </p>
            <p className="font-read italic text-ink-soft mt-4 float-bob">Booking passage…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
