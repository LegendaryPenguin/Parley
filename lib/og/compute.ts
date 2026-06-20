import type { ChatMsg, ChatOpts, JudgePrompt, JudgeResult, ModelInfo, ProviderAttestation } from '@/lib/types';
import { judgeInstruction } from '@/lib/engine';

// LIVE 0G Compute via the OpenAI-compatible Router (server-side only — holds the key).
// Default to testnet. Models are discovered at runtime (do NOT hardcode an id that
// may not be on testnet). See Build Brief §6.4 / §10.
//
// Env:
//   OG_ROUTER_BASE_URL  e.g. https://router-api-testnet.integratenetwork.work/v1
//   OG_ROUTER_API_KEY   from pc.testnet.0g.ai (funded via faucet.0g.ai)
//   OG_CHAT_MODEL       optional override; otherwise first available chat model

const BASE = process.env.OG_ROUTER_BASE_URL ?? 'https://router-api-testnet.integratenetwork.work/v1';
const KEY = process.env.OG_ROUTER_API_KEY ?? '';

function headers() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` };
}

let cachedModel: string | null = null;

interface RawModel {
  id: string;
  type?: string;
  architecture?: { modality?: string; output_modalities?: string[] };
}

async function fetchRawModels(): Promise<RawModel[]> {
  const res = await fetch(`${BASE}/models`, { headers: headers() });
  if (!res.ok) throw new Error(`0G models list failed: ${res.status}`);
  const data = await res.json();
  return (data.data ?? data.models ?? []) as RawModel[];
}

export async function liveListModels(): Promise<ModelInfo[]> {
  const raw = await fetchRawModels();
  return raw.map((m) => ({ id: m.id }));
}

function isChatModel(m: RawModel): boolean {
  if (m.type === 'chatbot') return true;
  const mod = m.architecture?.modality ?? '';
  const out = m.architecture?.output_modalities ?? [];
  return mod.includes('text->text') || (out.length === 1 && out[0] === 'text');
}

async function pickModel(): Promise<string> {
  if (process.env.OG_CHAT_MODEL) return process.env.OG_CHAT_MODEL;
  if (cachedModel) return cachedModel;
  const raw = await fetchRawModels();
  if (!raw.length) throw new Error('No 0G Compute models available on the Router');
  // Pick a real chat model — never an image/editing model.
  const chat = raw.find(isChatModel) ?? raw[0];
  cachedModel = chat.id;
  return cachedModel;
}

async function completion(messages: ChatMsg[], opts?: ChatOpts) {
  const model = opts?.model ?? (await pickModel());
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 256,
    }),
  });
  if (!res.ok) throw new Error(`0G chat failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';
  // 0G testnet Router returns verifiability info in `x_0g_trace`: the TEE-attested
  // compute provider address + a request_id. That's our on-record proof a real,
  // verified model served this turn (§10).
  const trace = data.x_0g_trace ?? {};
  const attestation: ProviderAttestation = {
    provider: trace.provider ? `0G Compute · ${trace.provider}` : '0G Compute (TEE)',
    model: data.model ?? model,
    signature: trace.request_id,
    raw: trace,
  };
  return { text, attestation };
}

export async function liveChat(messages: ChatMsg[], opts?: ChatOpts) {
  return completion(messages, opts);
}

export async function liveJudge(prompt: JudgePrompt): Promise<JudgeResult> {
  const transcriptText = prompt.transcript
    .map((t) => `${t.role}: ${t.textTarget ?? t.textNative ?? ''}`)
    .join('\n');
  const messages: ChatMsg[] = [
    { role: 'system', content: judgeInstruction(prompt) },
    { role: 'user', content: transcriptText },
  ];
  const { text, attestation } = await completion(messages, { temperature: 0 });
  const jsonStr = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  let parsed: Partial<JudgeResult> = {};
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Fall back to a conservative result if the model didn't return clean JSON.
    parsed = { goalMet: false, fluency: 50, corrections: [], newWordsUsed: [], difficultyHint: 0 };
  }
  return {
    goalMet: !!parsed.goalMet,
    fluency: parsed.fluency ?? 50,
    corrections: parsed.corrections ?? [],
    newWordsUsed: parsed.newWordsUsed ?? [],
    difficultyHint: parsed.difficultyHint ?? 0,
    attestation,
  };
}

export async function liveTranscribe(_audio: Blob): Promise<string> {
  // Check whether STT is live on testnet (§10). If not, callers fall back to
  // the browser SpeechRecognition API.
  throw new Error('0G STT not wired yet — using browser SpeechRecognition fallback');
}

export async function liveSpeak(_text: string, _voiceId?: string): Promise<Blob> {
  throw new Error('0G TTS not wired yet — using speechSynthesis fallback');
}
