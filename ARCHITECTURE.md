# Parley — Architecture

*A language-learning game for the 0G Zero Cup, where live decentralized AI **is** the game: every NPC reply is a 0G Compute inference, transcripts live encrypted on 0G Storage, and each completed stage is anchored on 0G Chain.*

This document is for someone reading the repo cold. It maps the layers, the single 0G seam, the privacy boundary, the key files, and the request flow. Everything below cites real paths and symbols.

---

## 1. Layer stack

The browser runs a Next.js / React app (the illustrated world, scenes, Phrasebook, Passport). The browser never talks to 0G Compute directly — it calls server **API routes** (`app/api/chat/route.ts`, `app/api/judge/route.ts`) which hold the 0G Router API key (`OG_ROUTER_API_KEY`) and forward inference through the **`lib/og` seam**. That seam is the *only* code in the repo that imports a 0G SDK; it fans out to the three 0G services: **Compute** (chat/judge inference via the OpenAI-compatible Router), **Storage** (encrypted transcript upload), and **Chain** (on-chain anchor). Storage and Chain run *client-side* with the user's own wallet, so the user owns their data and keys; Compute runs *server-side* so the Router key is never shipped to the browser. Sitting beside the seam is **`lib/engine`** — pure tutor logic (prompt construction, the turn-then-judge flow, difficulty adaptation, SM-2 spaced repetition) with **no 0G and no UI imports**. The API routes compose `lib/engine` prompt builders with `lib/og` calls; the engine itself never touches the network.

```
Browser (Next.js app, scenes/UI)
   │  fetch /api/chat, /api/judge        client-side: savePlayer/saveSceneTranscript/anchor (user wallet)
   ▼                                                   │
Server API routes  (hold OG_ROUTER_API_KEY) ──────────┤
   │                                                   │
   ▼                                                   ▼
lib/og  ── the ONLY 0G seam (nothing else imports a 0G SDK) ──┐
   │                  │                    │
   ▼                  ▼                    ▼
0G Compute        0G Storage           0G Chain
(Router LLM)   (encrypt-to-self)    (keccak anchor tx)

lib/engine  — pure tutor logic, imported by the API routes; no 0G, no UI.
```

---

## 2. The seam (`lib/og`)

`lib/og/index.ts` exports typed functions that the rest of the app calls. **Nothing outside `lib/og` imports a 0G SDK.** Each service has an independent **mock ⇄ live** toggle, read from env at module load, so you can (e.g.) run live inference with mock persistence for a no-wallet demo:

| Service | Env var (with fallbacks) | `index.ts` flag | Mock impl | Live impl |
|---|---|---|---|---|
| Compute | `OG_COMPUTE_MODE` → `OG_MODE` | `isComputeMock` | `mock-compute.ts` (`mockChat`, `mockJudge`, `MOCK_MODELS`) | `compute.ts` (`liveChat`, `liveJudge`, `liveListModels`, `liveTranscribe`, `liveSpeak`) |
| Storage | `NEXT_PUBLIC_OG_STORAGE_MODE` → `NEXT_PUBLIC_OG_MODE` → `OG_MODE` | `isMock` | `mock-storage.ts` (`mockStorage`) | `storage.ts` (`liveStorage`) |
| Chain | `NEXT_PUBLIC_OG_CHAIN_MODE` → `NEXT_PUBLIC_OG_MODE` → `OG_MODE` | `isChainMock` | `mock-storage.ts` (`mockChain`) | `chain.ts` (`liveChain`) |

Exported seam functions (all in `lib/og/index.ts`), each `if (mock) … else dynamic-import the live impl`:

- **Compute (server-side):** `listModels`, `chat`, `judge`, `transcribe`, `speak`
- **Storage (client-side):** `savePlayer`, `getPlayer`, `saveVocab`, `getVocab`, `saveNPCMemory`, `getNPCMemory`, `saveSceneTranscript`, `getRecords`, `setAnchorTx`
- **Chain (client-side):** `anchor`

The live implementations are loaded lazily via dynamic `import()` so mock runs never pull in the SDKs. `OG_MODE` is exported as the Storage mode and drives the UI's "demo passage" badge. Compute selects its model at runtime by querying `GET /v1/models` (`compute.ts → pickModel` / `liveListModels`) rather than hard-coding an id; `OG_CHAT_MODEL` is an optional override.

---

## 3. On-chain vs off-chain (the privacy boundary)

The design keeps raw data off-chain and puts only a fingerprint + attestation on-chain. The transcript is **encrypted client-side** (XChaCha20-Poly1305, key derived from a one-time wallet signature in `storage.ts → getKey`) so 0G Storage only ever sees ciphertext; the model's reasoning stays sealed in the TEE.

| Stays off-chain (TEE / encrypted Storage / local) | Goes on-chain (0G Chain tx) |
|---|---|
| Full scene transcript (`DialogueTurn[]`) — encrypted, uploaded to 0G Storage, returns a content `root` | `keccak256(recordHash)` as tx calldata (`chain.ts → liveChain.anchor`, via `keccakId(recordHash)`) |
| The grading model's reasoning / corrections — produced inside the 0G Compute TEE | The tx is a 0-value self-send (`to: self, value: 0`), so the anchor is the calldata only — no payload, no PII |
| Encryption key — derived in-browser from a wallet signature, **never leaves the browser**, cached per session | (nothing else) |
| Hot state — `PlayerProfile`, `VocabItem[]`, `NPCMemory` — kept in fast local storage even in live mode (`liveStorage` delegates these to `mockStorage` to avoid a gas tx per keystroke) | |
| `ProviderAttestation` (`provider`, `model`, `signature`/request id) — derived from the Router's `x_0g_trace`; stored on the `SceneRecord` | The anchor tx hash is later written back onto the record off-chain via `setAnchorTx` |

Net: the on-chain footprint is just `keccak256(recordHash)`. Anyone can recompute it and find the tx — that's the tamper-evidence — but the transcript and the model's reasoning never leave the encrypted/TEE side. The verified record proves *integrity of the record and that a real, attested model graded it* — not that the work was unaided.

---

## 4. Key files

| Path | Responsibility |
|---|---|
| `lib/og/index.ts` | The seam. Mode toggles + typed exports (`chat`, `judge`, `saveSceneTranscript`, `anchor`, …); dynamic-imports live impls. |
| `lib/og/compute.ts` | LIVE 0G Compute: Router calls (`liveChat`/`liveJudge`), runtime model discovery (`pickModel`/`liveListModels`), `x_0g_trace` → `ProviderAttestation`. Server-side, holds the key. |
| `lib/og/storage.ts` | LIVE 0G Storage: encrypt-to-self (`encryptJson`), upload via `@0gfoundation/0g-ts-sdk` (`uploadBytes`), `saveSceneTranscript`. Client-side, user's wallet. |
| `lib/og/chain.ts` | LIVE 0G Chain: `liveChain.anchor` — keccak anchor self-tx on Galileo testnet (chainId 16602), MetaMask. |
| `lib/og/mock-compute.ts` | Canned `mockChat`, `mockJudge`, `MOCK_MODELS` — offline play. |
| `lib/og/mock-storage.ts` | `mockStorage` + `mockChain` — local persistence + fake anchor. |
| `lib/engine/index.ts` | Pure tutor brain: `buildNPCSystemPrompt`, `buildJudgePrompt`, `judgeInstruction`, `applyJudge`, `adaptDifficulty`, SM-2 SRS (`updateSrsOnReview`, `scheduleReview`), `vocabFromJudge`. No 0G/UI. |
| `lib/content/scripts/index.ts` | Per-language content registry (`SCRIPTS` for es/fr/hi/de/it/ja/zh), `getSceneScript`, accent-insensitive matching (`normalize`, `matchesAll`). |
| `lib/content/world` | Scene/persona lookup (`getScene`, `getPersona`) consumed by the API routes. |
| `lib/types.ts` | Shared contracts every module codes against (see §6). |
| `app/api/chat/route.ts` | Server route: builds NPC system prompt + history, calls `chat()`, returns `{ text, attestation }`. |
| `app/api/judge/route.ts` | Server route: builds judge prompt, calls `judge()`, returns a `JudgeResult`. |
| `app/api/translate/route.ts` | Server route: on-demand tap-to-translate via Compute. |

---

## 5. Request flow (turn → judge → reward)

A scene is a loop of conversational turns, then a single grading pass, then the on-chain reward. The 0G calls happen at exactly these points:

1. **Turn** — player speaks/types. Browser POSTs to `app/api/chat/route.ts`, which calls `buildNPCSystemPrompt` (`lib/engine`) with the persona/scene/profile/NPC memory, assembles `[system, …history, user]`, and calls **`chat()`** (`lib/og/index.ts` → `liveChat` in `compute.ts`). The Router reply carries `x_0g_trace`, mapped into a `ProviderAttestation`. Response: `{ text, attestation }`. **(0G Compute call #1)** Repeat per turn; the engine's NPC prompt instructs in-language corrective recasts.
2. **Judge** — when the player tries to close the goal, the browser POSTs to `app/api/judge/route.ts`, which calls `buildJudgePrompt` (`lib/engine`) and **`judge()`** (`lib/og/index.ts` → `liveJudge` in `compute.ts`, `temperature: 0`). `liveJudge` runs `judgeInstruction()` as a system prompt, parses JSON, and returns a `JudgeResult` (`goalMet`, `fluency`, `corrections`, `newWordsUsed`, `difficultyHint`, `attestation`). **(0G Compute call #2 — home of the verifiable attestation.)**
3. **Fold results** — client applies `applyJudge` (attach correction to the last player turn, set `goalMet`/`fluency`), turns `newWordsUsed` into Phrasebook entries via `vocabFromJudge` + `mergeVocab`, and runs `adaptDifficulty` for next time. (Pure `lib/engine`, no network.)
4. **Complete scene** — on goal met, the client calls **`saveSceneTranscript(rec, turns)`** (`lib/og/index.ts` → `liveStorage.saveSceneTranscript` in `storage.ts`): it computes `recordHash = keccak256(payload)`, encrypts the payload (`encryptJson`), uploads ciphertext to 0G Storage (`uploadBytes`), and returns `{ root, recordHash }`. **(0G Storage call.)** The record (with `transcriptStorageRoot`, `recordHash`, `attestation`) is appended to the player's records.
5. **Reward / anchor** — the client calls **`anchor(recordHash)`** (`lib/og/index.ts` → `liveChain.anchor` in `chain.ts`): a user-signed 0-value self-tx whose calldata is `keccak256(recordHash)` on 0G Galileo testnet. Returns `{ txHash }`. **(0G Chain call.)** The hash is written back onto the record via `setAnchorTx`; the Passport stamp + postcard print, and the next stage unlocks.

Mock mode follows the identical sequence through the same seam functions — only the implementations behind `chat`/`judge`/`saveSceneTranscript`/`anchor` differ, so the UI is unchanged.

---

## 6. Data contracts

All shared shapes live in `lib/types.ts` — every module codes against these and nothing reaches across boundaries:

- **`PlayerProfile`** — identity (`id` = wallet address or mock id), `targetLanguage`, CEFR `level`, `xp`, streaks, visited scenes.
- **`VocabItem`** — a Phrasebook entry: `term`/`reading`/`meaning`, `mastery`, and `srs` (`SrsState`, SM-2 fields) for spaced repetition.
- **`SceneRecord`** — the verifiable record: `goalMet`, `fluencyScore`, `wordsUsed`, `transcriptStorageRoot` (0G Storage root), `recordHash` (anchored), `attestation`, `anchorTx` (0G Chain tx hash).
- **`JudgeResult`** — the grading output (`goalMet`, `fluency`, `corrections`, `newWordsUsed`, `difficultyHint`, `attestation`).
- **`ProviderAttestation`** — TEE proof from Compute (`provider`, `model`, `signature`/request id, raw `x_0g_trace`).

---

Built on **0G** — Compute for the conversation, Storage for the memory, Chain for the proof.
