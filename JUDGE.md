# 🧑‍⚖️ Judge's Verification Guide

*A fast path to confirm that 0G does real, load-bearing work in Parley — not bolted-on decoration. Written for a human judge or an AI reading the repo.*

---

## 1. TL;DR

0G is the game, not a feature. Three 0G services each do work the app cannot fake away:

- **0G Compute** generates **every** NPC turn (a live Router inference call to `qwen/qwen2.5-omni-7b`) **and** the second *judge* call that grades each exchange into structured JSON. There is no scripted dialogue tree.
- **0G Storage** uploads each completed scene's transcript with **true encrypt-to-self** (XChaCha20-Poly1305 key derived from a one-time wallet signature) and returns a real content root.
- **0G Chain** anchors `keccak256(recordHash)` as a user-signed transaction on 0G Galileo testnet (chainId 16602), making the learning record tamper-evident.

Remove 0G and you have an empty illustrated map: nothing to say (no Compute), nothing remembered or owned (no Storage), nothing provable (no Chain). A mock mode exists **only** as an offline dev/demo fallback, behind the exact same `lib/og` function signatures.

---

## 2. 30-second check (no setup, no keys, no wallet)

```bash
npm install
npm run dev          # http://localhost:3000
```

Default mode is `OG_MODE=mock` (see `.env.example`), so the **whole golden path plays offline** with canned dialogue + local storage — no network or wallet required.

Click through the loop:

1. **Arrival** — pick a language (Spanish, French, German, Italian, Hindi, Japanese, Mandarin).
2. **Atlas → Scene** — enter a stage, read the goal in your language.
3. **Talk** — type (or push-to-talk) in the target language; the local replies, then a judge grades the exchange.
4. **Reward** — words flip into your **Phrasebook**, a stamp hits your **Passport**, a postcard prints.
5. **Passport** — review the per-stage **verified record** (storage root + attestation + anchor).

Watch the **"0G activity ⛓" dev panel** — a small chip in the **bottom-right** corner (`components/design/DevPanel.tsx`). It opens a live log of every Compute / Storage / Chain event. In mock mode entries are marked as demo (no explorer links); in live mode they carry real request ids / roots / tx hashes with explorer links.

---

## 3. Verify it's really 0G (with a Router key)

Copy `.env.example` → `.env.local` and turn Compute live:

```bash
OG_COMPUTE_MODE=live
OG_ROUTER_BASE_URL=https://router-api-testnet.integratenetwork.work/v1
OG_ROUTER_API_KEY=sk-...                 # from pc.testnet.0g.ai, funded via faucet.0g.ai
OG_CHAT_MODEL=qwen/qwen2.5-omni-7b
```

**a) Confirm the model exists on the real Router.** Hit the same endpoint the app discovers models from (`lib/og/compute.ts` → `fetchRawModels()` calls `${BASE}/models`):

```bash
curl -s "$OG_ROUTER_BASE_URL/models" \
  -H "Authorization: Bearer $OG_ROUTER_API_KEY" | grep -o 'qwen/qwen2.5-omni-7b'
```

You should see `qwen/qwen2.5-omni-7b` in the returned model list. (Models are discovered at runtime — never hard-coded; if `OG_CHAT_MODEL` is unset, `pickModel()` selects the first real chat model.)

**b) Confirm live inference in-app.** Restart `npm run dev`, enter a Scene, and say a line. After the NPC replies, the Scene shows a pine-colored chip reading **"answered live on 0G · `<model>`"** (`components/scene/SceneClient.tsx` line ~230; it flips to "demo passage" only when the attestation provider isn't a real `0G Compute ·` provider).

**c) Confirm real attestation in the dev panel.** Open the "0G activity ⛓" panel. Compute entries now carry the real `request_id` pulled from the Router's `x_0g_trace` field (`lib/og/compute.ts` → `completion()`), marked `live`.

**d) Confirm an on-chain anchor (with MetaMask + testnet gas).** Add:

```bash
NEXT_PUBLIC_OG_STORAGE_MODE=live    # encrypted transcript → real content root
NEXT_PUBLIC_OG_CHAIN_MODE=live      # keccak256(recordHash) anchored as a self-tx
```

Complete a scene. MetaMask prompts you to sign a transaction on **0G Galileo Testnet (chainId 16602 / `0x40da`)**. The dev panel's Chain entry links to the transaction on the explorer:

```
https://chainscan-galileo.0g.ai/tx/<txHash>
```

Open it and confirm a real, mined transaction whose calldata is `keccak256(recordHash)` (`lib/og/chain.ts` → `liveChain.anchor`). Storage entries link to `https://storagescan-galileo.0g.ai/file?root=<root>`.

> The three layers toggle **independently** — you can run live Compute with mock Storage/Chain for a smooth no-wallet demo, then turn on Chain to see a real anchor.

---

## 4. Claim → code map

Every 0G claim maps to a concrete symbol. The single seam is `lib/og/index.ts` — **nothing else in the app imports a 0G SDK**; each function picks mock vs. live behind one signature.

| 0G claim | File | Symbol / region | What to verify |
|---|---|---|---|
| Every NPC turn is live 0G inference | `lib/og/compute.ts` | `liveChat` → `completion()` (L58–88) | POSTs to `${BASE}/chat/completions` against the discovered model |
| Each exchange judged by a second 0G call → structured JSON | `lib/og/compute.ts` | `liveJudge` (L90–115) | `temperature: 0`, parses `{goalMet, fluency, corrections, newWordsUsed, difficultyHint}` |
| Verifiable attestation per turn | `lib/og/compute.ts` | `completion()` reads `data.x_0g_trace` → `ProviderAttestation` (L73–83) | `provider` + `request_id` become the on-record proof |
| Models discovered at runtime, not hard-coded | `lib/og/compute.ts` | `fetchRawModels` / `pickModel` / `isChatModel` (L28–56) | `GET /models`, selects a real chat model |
| NPC turn wired through the server (holds the key) | `app/api/chat/route.ts` | `POST` → `chat(messages, …)` (L40) | server-side route; Router key never reaches the browser |
| Encrypted-to-self transcript upload → real root | `lib/og/storage.ts` | `saveSceneTranscript` → `encryptJson` + `uploadBytes` (L58–116) | XChaCha20-Poly1305; `@0gfoundation/0g-ts-sdk` `Indexer.upload` returns `rootHash` |
| Encryption key from a one-time wallet signature | `lib/og/storage.ts` | `getKey()` (L49–56) | `keccak_256(signMessage(...))`, cached per session, never leaves browser |
| On-chain anchor of the record hash | `lib/og/chain.ts` | `liveChain.anchor` (L51–68) | `ethers` `BrowserProvider`; self-tx with `data = keccakId(recordHash)` |
| Galileo testnet config (chainId 16602) | `lib/og/chain.ts` | `OG_TESTNET` (L15–24) | `0x40da`, RPC `evmrpc-testnet.0g.ai`, explorer `chainscan-galileo.0g.ai` |
| Dev panel surfaces live 0G activity | `lib/dev/txlog.ts` | `useTxLog`, `logCompute/logStorage/logChain`, `chainTxUrl` (L41–77) | explorer links only when `live: true` |
| Single seam, mock/live toggle | `lib/og/index.ts` | `isComputeMock` / `isMock` / `isChainMock` (L43–45) + each exported fn | live impls dynamically imported behind identical signatures |

**Grep commands a judge can run:**

```bash
# The attestation fingerprint lives only in compute.ts
grep -rn "x_0g_trace" lib/og

# The whole app touches 0G only through the seam (live SDKs imported nowhere else)
grep -rn "@0gfoundation/0g-ts-sdk" lib        # -> only lib/og/storage.ts
grep -rn "from \"ethers\"\|from 'ethers'" lib  # -> only lib/og storage.ts / chain.ts

# Mock vs. live decision points
grep -n "isComputeMock\|isMock\|isChainMock" lib/og/index.ts

# The two-call turn-then-judge flow
grep -n "liveChat\|liveJudge\|completion" lib/og/compute.ts

# Real encryption + upload
grep -n "xchacha20poly1305\|uploadBytes\|Indexer" lib/og/storage.ts

# Real anchor
grep -n "sendTransaction\|keccakId\|0x40da" lib/og/chain.ts
```

---

## 5. "Would it run the same without 0G?"

**No.** With live mode off, the app runs on **mock implementations** (`lib/og/mock-compute.ts`, `lib/og/mock-storage.ts`) that exist purely as an offline dev/demo fallback — and they sit behind the **same `lib/og` function signatures** as the live 0G code (`chat`, `judge`, `saveSceneTranscript`, `anchor`, …). The game architecture has exactly one place that talks to 0G (`lib/og/index.ts`); turn it to `live` and real Compute, Storage, and Chain carry the experience with no screen changes. The mock is the stand-in, not the product.

---

## 6. Honesty notes

- **Mock mode is canned.** In `*=mock`, dialogue/judgement come from local canned data and Storage/Chain produce **fake** roots and tx hashes for offline play — the dev panel marks these as demo (no explorer links). This is a developer convenience, not a claim of on-chain work.
- **What the verified record actually proves.** A live record proves the **integrity of the record** (the transcript's storage root) and that a **real, TEE-attested model graded the exchange** (the `x_0g_trace` provider + request id, anchored via `keccak256`). It does **not** prove the player's work was unaided — Parley does not overclaim this.
- **Storage scope is deliberate.** Only completed-scene **transcripts** (the substance the record points to) are uploaded to 0G Storage. Hot state (profile / vocab / NPC memory) stays in fast local storage to avoid a gas-paying tx per keystroke (see the design comment in `lib/og/storage.ts`).
- **Voice STT/TTS fall back to the browser.** `liveTranscribe`/`liveSpeak` intentionally throw until 0G STT/TTS is wired on testnet; callers fall back to the browser SpeechRecognition / speechSynthesis APIs (`lib/og/compute.ts` L117–125).

---

*Built on 0G — Compute for the conversation, Storage for the memory, Chain for the proof. 🗺️*
