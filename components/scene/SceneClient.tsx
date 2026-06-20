"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getScene, getPersona } from "@/lib/content/world";
import { translate, HINTS } from "@/lib/content/assist";
import { useGame } from "@/lib/store/useGame";
import { useBoot } from "@/lib/store/boot";
import { chatTurn, judgeExchange } from "@/lib/client/api";
import { applyJudge } from "@/lib/engine";
import { getNPCMemory } from "@/lib/og";
import type { DialogueTurn, JudgeResult, NPCMemory, VocabItem } from "@/lib/types";
import { SceneBackground, NPCPortrait } from "@/components/design/RisoIllustration";
import { Ticket } from "@/components/design/Ticket";
import { SplitFlap } from "@/components/design/SplitFlap";
import { MicInput } from "./MicInput";
import { RewardSequence } from "./RewardSequence";

export function SceneClient({ id }: { id: string }) {
  const router = useRouter();
  const { hydrated, profile } = useBoot();
  const completeScene = useGame((s) => s.completeScene);
  const rememberNPC = useGame((s) => s.rememberNPC);

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
      setError("The local was looking the other way. Tap to try again.");
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
      setError(e instanceof Error ? e.message : "The line dropped before the local could answer. Try again — they'll wait.");
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
      <main className="min-h-screen grid place-items-center">
        <SplitFlap text="FINDING A LOCAL" size="1.5rem" />
      </main>
    );
  }
  if (!scene || !persona) {
    return (
      <main className="min-h-screen grid place-items-center text-center px-6">
        <div>
          <p className="font-display text-2xl">This place isn&apos;t on the map.</p>
          <button onClick={() => router.push("/atlas")} className="label-mono underline mt-3">
            Back to the Atlas
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* illustrated stage */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative h-[40vh] min-h-[260px] border-b-2 border-ink"
      >
        <SceneBackground id={scene.art.background} alt={`${scene.title} — illustrated scene`} />
        <button
          onClick={() => router.push("/atlas")}
          className="absolute top-3 left-3 label-mono bg-paper/85 border-2 border-ink px-2 py-1 rounded-sm hover:-translate-y-0.5 transition-transform"
        >
          ← Atlas
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <NPCPortrait npcId={scene.npcId} name={persona.name} />
          <p className="text-center label-mono bg-paper/85 px-2 rounded-sm mt-1">{persona.name}</p>
        </div>
      </motion.div>

      {/* goal ticket */}
      <div className="px-4 -mt-1 pt-3">
        <Ticket number={String(scene.order).padStart(2, "0")} place={scene.place}>
          {scene.goalSummaryNative}
        </Ticket>
      </div>

      {/* conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {turns.map((t, i) => (
          <Line key={i} turn={t} npcName={persona.name} />
        ))}
        {busy && (
          <p className="label-mono text-ink/50">
            {turns.length === 0 ? `${persona.name} looks up…` : `${persona.name} is thinking…`}
          </p>
        )}
        <AnimatePresence>
          {hintShown && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border-2 border-dashed border-riso-pink rounded-sm px-3 py-2 bg-paper"
            >
              <p className="label-mono text-riso-pink">Phrasebook hint</p>
              <p className="font-read italic">{hintShown}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <button onClick={() => (turns.length === 0 ? openScene() : setError(null))} className="text-left">
            <p className="font-read italic text-riso-pink">{error}</p>
          </button>
        )}
      </div>

      {/* input dock */}
      <div className="sticky bottom-0 bg-paper border-t-2 border-ink px-4 py-3 space-y-2">
        <MicInput onSend={handleSend} disabled={busy} placeholder={`Say it in ${langLabel(profile.targetLanguage)}…`} />
        <div className="flex items-center justify-between">
          <button onClick={showHint} disabled={busy} className="label-mono underline decoration-riso-pink decoration-2 underline-offset-4 disabled:opacity-40">
            phrasebook ▤ {hintsUsed > 0 ? `(${hintsUsed} used)` : "hint"}
          </button>
          <span className="label-mono text-ink/60" aria-label={`fluency ${fluency}`}>
            fluency {dots(fluency)}
          </span>
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

function Line({ turn, npcName }: { turn: DialogueTurn; npcName: string }) {
  const [open, setOpen] = useState(false);
  if (turn.role === "npc") {
    const meaning = translate(turn.textTarget ?? "");
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="label-mono text-ink/50">{npcName}</p>
        <p className="target-lang text-riso-blue text-lg leading-snug">{turn.textTarget}</p>
        <button onClick={() => setOpen((o) => !o)} className="label-mono text-ink/50 hover:text-ink">
          {open ? "▴ hide" : "▾ tap to translate"}
        </button>
        <AnimatePresence>
          {open && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="font-read italic text-ink-soft overflow-hidden"
            >
              {meaning ?? "(translation unavailable in this demo)"}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
  // player
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-right">
      <p className="label-mono text-ink/50">You</p>
      <p className="font-read text-riso-pink text-lg">{turn.textTarget}</p>
      {turn.correction && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-read italic text-ink-soft text-sm"
        >
          ✎ {turn.correction.note}
        </motion.p>
      )}
    </motion.div>
  );
}

function dots(fluency: number): string {
  const filled = Math.round((fluency / 100) * 5);
  return "●".repeat(filled) + "○".repeat(5 - filled);
}

function langLabel(code: string): string {
  return { es: "Spanish", fr: "French", ja: "Japanese", de: "German" }[code] ?? code;
}
