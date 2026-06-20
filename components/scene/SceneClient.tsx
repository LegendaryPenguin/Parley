"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getScene, getPersona } from "@/lib/content/world";
import { translate, HINTS } from "@/lib/content/assist";
import { useGame } from "@/lib/store/useGame";
import { useBoot } from "@/lib/store/boot";
import { chatTurn, judgeExchange } from "@/lib/client/api";
import { applyJudge } from "@/lib/engine";
import { getNPCMemory } from "@/lib/og";
import type { DialogueTurn, JudgeResult, NPCMemory, VocabItem } from "@/lib/types";
import { SceneBackground, NPCPortrait } from "@/components/design/RisoIllustration";
import { Panel } from "@/components/design/ui";
import { Ticket } from "@/components/design/Ticket";
import { SplitFlap } from "@/components/design/SplitFlap";
import { MicInput } from "./MicInput";
import { RewardSequence } from "./RewardSequence";

export function SceneClient({ id }: { id: string }) {
  const router = useRouter();
  const { hydrated, profile } = useBoot();
  const completeScene = useGame((s) => s.completeScene);
  const rememberNPC = useGame((s) => s.rememberNPC);

  const reduce = useReducedMotion();
  const scene = getScene(id);
  const persona = scene ? getPersona(scene.npcId) : undefined;

  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [fluency, setFluency] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintShown, setHintShown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<{ judge: JudgeResult; newWords: VocabItem[]; keyLine: string } | null>(null);
  const startedAt = useRef(Date.now());
  const memoryRef = useRef<NPCMemory | null>(null);
  const openedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  const openScene = useCallback(async () => {
    if (!profile || !scene) return;
    setBusy(true);
    try {
      memoryRef.current = await getNPCMemory(scene.npcId, profile.id);
      const { text } = await chatTurn({
        sceneId: id,
        profile,
        memory: memoryRef.current,
        turns: [],
        playerInput: "*the traveler walks up*",
      });
      setTurns([{ role: "npc", textTarget: text, ts: Date.now() }]);
    } catch {
      setError("The local turned away for a moment — tap to catch their eye again.");
    } finally {
      setBusy(false);
    }
  }, [profile, scene, id]);

  useEffect(() => {
    if (hydrated && profile && scene && !openedRef.current) {
      openedRef.current = true;
      void openScene();
    }
  }, [hydrated, profile, scene, openScene]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  async function handleSend(text: string) {
    if (!profile || !scene || busy) return;
    setError(null);
    setHintShown(null);
    const playerTurn: DialogueTurn = { role: "player", textTarget: text, ts: Date.now() };
    const history = turns;
    setTurns([...history, playerTurn]);
    setBusy(true);
    try {
      const { text: npcText } = await chatTurn({
        sceneId: id,
        profile,
        memory: memoryRef.current,
        turns: history,
        playerInput: text,
      });
      const npcTurn: DialogueTurn = { role: "npc", textTarget: npcText, ts: Date.now() };
      const newTurns = [...history, playerTurn, npcTurn];

      const judge = await judgeExchange({ sceneId: id, profile, turns: newTurns, hintsUsed });
      const folded = applyJudge({ sceneId: id, turns: newTurns, goalMet: false, hintsUsed, fluencyScore: judge.fluency }, judge);
      setTurns(folded.turns);
      setFluency(judge.fluency);

      if (judge.goalMet) {
        await finishScene(judge, folded.turns, text);
      }
    } catch (e) {
      setTurns(history); // roll back the optimistic player turn
      setError(e instanceof Error ? e.message : "Your words got lost in the noise — tap to say it again, they're still listening.");
    } finally {
      setBusy(false);
    }
  }

  async function finishScene(judge: JudgeResult, finalTurns: DialogueTurn[], keyLine: string) {
    if (!profile || !scene) return;
    const adjusted = { ...judge, fluency: Math.max(20, judge.fluency - hintsUsed * 8) };
    const { newWords } = await completeScene({
      sceneId: id,
      startedAt: startedAt.current,
      turns: finalTurns,
      judge: adjusted,
      keyLine,
    });
    await rememberNPC(scene.npcId, `Completed "${scene.title}" with fluency ${adjusted.fluency}.`, 1);
    setReward({ judge: adjusted, newWords, keyLine });
  }

  function showHint() {
    const hints = HINTS[id] ?? [];
    const next = Math.min(hintsUsed, hints.length - 1);
    setHintShown(hints[next] ?? "Try a short, simple sentence.");
    setHintsUsed((n) => n + 1);
  }

  if (!hydrated || !profile) {
    return (
      <main className="min-h-screen grid place-items-center wash-joy grain">
        <div className="text-center space-y-3">
          <SplitFlap text="FINDING A LOCAL" size="1.5rem" />
          <p className="label-mono text-ink/60">someone always knows the way</p>
        </div>
      </main>
    );
  }
  if (!scene || !persona) {
    return (
      <main className="min-h-screen grid place-items-center text-center px-6 wash-joy grain">
        <Panel className="px-7 py-6 overprint">
          <p className="font-display text-2xl font-extrabold text-indigo">This place isn&apos;t on the map.</p>
          <p className="font-read text-ink-soft mt-1">Wander back and pick another door.</p>
          <button
            onClick={() => router.push("/atlas")}
            className="pill font-display font-extrabold uppercase tracking-wide text-paper bg-coral px-6 py-2.5 mt-4 hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            ← Back to the Atlas
          </button>
        </Panel>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto bg-paper border-x-2 border-ink/15">
      {/* illustrated stage — the place you've stepped into */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-[50vh] sm:h-[40vh] min-h-[200px] sm:min-h-[260px] border-b-2 border-ink overflow-hidden"
      >
        <SceneBackground id={scene.art.background} alt={`${scene.title} — illustrated scene`} />
        {/* gentle ink wash at the base so the portrait + label read cleanly */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
          style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--ink) 38%, transparent), transparent)" }}
        />

        <button
          onClick={() => router.push("/atlas")}
          className="absolute top-3 left-3 pill bg-paper text-ink px-3 py-1.5 font-display font-extrabold text-sm uppercase tracking-wide hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          ← Atlas
        </button>

        <span className="absolute top-3 right-3 pixel-badge text-[0.55rem] px-2.5 py-1.5" style={{ background: "var(--marigold)" }}>
          STOP {String(scene.order).padStart(2, "0")}
        </span>

        {/* the character, framed and named like a postcard signature */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <GreetablePortrait npcId={scene.npcId} name={persona.name} reduce={!!reduce} />
          <span className="pill bg-paper text-ink px-3 py-0.5 mt-1.5 font-display font-extrabold text-sm">
            {persona.name}
          </span>
        </div>
      </motion.div>

      {/* what you're here to do */}
      <div className="px-4 -mt-1 pt-3">
        <Ticket number={String(scene.order).padStart(2, "0")} place={scene.place}>
          {scene.goalSummaryNative}
        </Ticket>
      </div>

      {/* the conversation itself */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {turns.map((t, i) => (
          <Line key={i} turn={t} npcName={persona.name} />
        ))}

        {busy && <Typing name={persona.name} opening={turns.length === 0} reduce={!!reduce} />}

        <AnimatePresence>
          {hintShown && (
            <motion.div
              initial={{ opacity: 0, y: 8, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-[90%] sm:max-w-[85%] border-2 border-dashed border-riso-pink rounded-sm px-4 py-3 bg-bubble/50 overprint"
            >
              <p className="label-mono text-riso-pink flex items-center gap-1.5">
                <span aria-hidden>▤</span> from your phrasebook
              </p>
              <p className="font-read italic text-ink mt-0.5">{hintShown}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <button
            onClick={() => (turns.length === 0 ? openScene() : setError(null))}
            className="block text-left mx-auto max-w-[90%] sm:max-w-[85%] w-full border-2 border-coral rounded-sm px-4 py-3 bg-paper hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <p className="label-mono text-coral">tap to try again</p>
            <p className="font-read italic text-ink mt-0.5">{error}</p>
          </button>
        )}
      </div>

      {/* input dock — where you say your piece */}
      <div className="sticky bottom-0 bg-paper border-t-2 border-ink px-2 sm:px-4 py-2 sm:py-3 space-y-2.5">
        <MicInput onSend={handleSend} disabled={busy} placeholder={`Say it in ${langLabel(profile.targetLanguage)}…`} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <button
            onClick={showHint}
            disabled={busy}
            className="pill bg-paper text-ink px-3 py-1.5 font-display font-extrabold text-xs uppercase tracking-wide hover:bg-bubble disabled:opacity-40 disabled:shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            ▤ {hintsUsed > 0 ? `phrasebook · ${hintsUsed}` : "stuck? peek"}
          </button>
          <FluencyMeter fluency={fluency} reduce={!!reduce} />
        </div>
      </div>

      {reward && (
        <RewardSequence
          sceneId={scene.art.background}
          place={scene.place}
          judge={reward.judge}
          newWords={reward.newWords}
          keyLine={reward.keyLine}
        />
      )}
    </main>
  );
}

// The local, framed like a postcard signature — poke them for a friendly wave.
function GreetablePortrait({ npcId, name, reduce }: { npcId: string; name: string; reduce: boolean }) {
  const [waves, setWaves] = useState(0);
  return (
    <motion.button
      type="button"
      onClick={() => setWaves((n) => n + 1)}
      aria-label={`Say hi to ${name}`}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={
        reduce
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 1, y: 0, scale: 1, rotate: waves ? [0, -7, 6, -4, 0] : 0 }
      }
      transition={
        waves
          ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          : { delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }
      whileTap={reduce ? undefined : { scale: 0.92 }}
      className="relative drop-shadow-[3px_3px_0_var(--ink)] rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <NPCPortrait npcId={npcId} name={name} />
      <AnimatePresence>
        {waves > 0 && (
          <motion.span
            key={waves}
            aria-hidden
            initial={{ opacity: 0, y: 4, scale: 0.6 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -top-2 -right-1 text-xl select-none drop-shadow-[1px_1px_0_var(--ink)]"
          >
            👋
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Line({ turn, npcName }: { turn: DialogueTurn; npcName: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  if (turn.role === "npc") {
    const meaning = translate(turn.textTarget ?? "");
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, x: -6 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-start"
      >
        <p className="label-mono text-riso-blue mb-1 ml-1">{npcName}</p>
        {/* speech bubble from the local — printed, with a tail */}
        <div className="relative max-w-[90%] sm:max-w-[85%] bg-sky/45 border-2 border-ink rounded-2xl rounded-bl-sm px-4 py-3 shadow-[3px_3px_0_var(--ink)] overprint">
          <p className="target-lang text-indigo text-base sm:text-lg leading-snug">{turn.textTarget}</p>
        </div>
        {/* translate peel — like lifting the corner of a sticker */}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          whileTap={reduce ? undefined : { rotate: -2, x: -2 }}
          className="ml-1 mt-1.5 label-mono text-ink/55 hover:text-riso-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
        >
          {open ? "▴ hide meaning" : "▾ peel to translate"}
        </motion.button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden ml-1 mt-1"
            >
              <p className="font-read italic text-ink-soft border-l-2 border-dashed border-riso-blue pl-2">
                {meaning ?? "(translation unavailable in this demo)"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
  // player — your reply, leaning right
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, x: 6 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-end"
    >
      <p className="label-mono text-riso-pink mb-1 mr-1">You</p>
      <div className="max-w-[90%] sm:max-w-[85%] bg-bubble border-2 border-ink rounded-2xl rounded-br-sm px-4 py-3 shadow-[3px_3px_0_var(--ink)]">
        <p className="font-read text-ink text-base sm:text-lg leading-snug">{turn.textTarget}</p>
      </div>
      {turn.correction && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-[90%] sm:max-w-[85%] mt-1.5 mr-0 bg-marigold/20 border border-marigold rounded-sm px-3 py-1.5"
        >
          <p className="label-mono text-[0.6rem] text-ink/70">a gentle fix</p>
          <p className="font-read italic text-ink text-xs sm:text-sm leading-snug">
            <span aria-hidden className="text-marigold mr-1">✎</span>
            {turn.correction.note}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// "the local is gathering their words" — animated thinking row
function Typing({ name, opening, reduce }: { name: string; opening: boolean; reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start"
    >
      <p className="label-mono text-riso-blue mb-1 ml-1">{name}</p>
      <div className="bg-sky/45 border-2 border-ink rounded-2xl rounded-bl-sm px-4 py-3 shadow-[3px_3px_0_var(--ink)] flex items-center gap-2">
        <motion.span
          aria-hidden
          className="text-base select-none"
          animate={reduce ? undefined : { rotate: [0, 16, -8, 14, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: 1.4, repeat: Infinity, repeatDelay: 0.4, ease: "easeInOut" }
          }
        >
          {opening ? "👀" : "💬"}
        </motion.span>
        <span className="label-mono text-ink/60">
          {opening ? `${name} looks up at you` : `${name} is thinking`}
        </span>
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full bg-riso-blue"
              animate={reduce ? { opacity: 0.7 } : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={
                reduce
                  ? undefined
                  : { duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }
              }
            />
          ))}
        </span>
      </div>
    </motion.div>
  );
}

// Fluency as a printed progress bar of pips — fills toward the goal,
// and each freshly-earned pip gives a little celebratory pop.
function FluencyMeter({ fluency, reduce }: { fluency: number; reduce: boolean }) {
  const total = 5;
  const filled = Math.round((fluency / 100) * total);
  const prevFilled = useRef(0);
  useEffect(() => {
    prevFilled.current = filled;
  }, [filled]);
  return (
    <div className="flex items-center gap-2" aria-label={`fluency ${fluency} out of 100`} role="img">
      <span className="label-mono text-ink/55 text-[0.6rem]">fluency</span>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const on = i < filled;
          const justEarned = on && i >= prevFilled.current && !reduce;
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{ scale: justEarned ? [1, 1.55, 1] : on ? 1 : 0.82 }}
              transition={
                justEarned
                  ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                  : { type: "spring", stiffness: 320, damping: 18 }
              }
              className="w-2.5 h-2.5 rounded-full border-2 border-ink"
              style={{ background: on ? "var(--pine)" : "var(--paper-deep)" }}
            />
          );
        })}
      </div>
    </div>
  );
}

function langLabel(code: string): string {
  return { es: "Spanish", fr: "French", ja: "Japanese", de: "German" }[code] ?? code;
}
