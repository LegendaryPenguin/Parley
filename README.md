# Parley

**Learn a language by living in it.** Parley is an explorable, illustrated risograph world where the only way forward is to *talk your way through it* — in the language you're learning — with AI characters who remember you. Built for the **0G Zero Cup**.

> Arrive at a place → read the goal → converse with the local (in your target language, live AI) → the AI judges it → earn the stamp, collect the words you used, unlock the next place.

**Three playable languages: Spanish, French, and Hindi** (Devanagari + romanization).

## How 0G does real work (not a bolt-on)

- **0G Compute — the engine.** Every NPC turn is a live inference call on 0G testnet (`qwen/qwen2.5-omni-7b`, TEE-attested). A separate *judge* call grades each exchange — goal met? corrections? which words were actually used? There are no scripted dialogue trees. Each response carries `x_0g_trace` (the compute provider address + request id) which becomes the record's attestation. **This is wired and verified live.**
- **0G Storage — memory & ownership.** Scene transcripts (the substance the verifiable record points to) are uploaded to 0G Storage via the `@0gfoundation/0g-ts-sdk`, **true encrypt-to-self** (an XChaCha20-Poly1305 key derived from a one-time wallet signature — the network only sees ciphertext), returning a real content root. Hot state (profile / phrasebook / NPC memory) stays in fast local storage so saves don't cost gas on every edit. *(Live upload is opt-in via `NEXT_PUBLIC_OG_STORAGE_MODE=live` and requires MetaMask; mock/local is the default for the no-wallet demo.)*
- **0G Chain — the verifiable record.** On scene completion, `keccak256(recordHash)` is anchored as a transaction on 0G Galileo testnet (chainId 16602), making the learning record tamper-evident. *(Opt-in; requires MetaMask.)*

Strip 0G out and you have an empty map with nothing to say, nothing remembered, and nothing provable.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

**Default (`OG_MODE=mock`):** the whole golden path — Arrival → Atlas → Scene → reward → Passport — works with no network or wallet (canned NPC replies + local storage).

**Live 0G inference:** copy `.env.example` → `.env.local`, set `OG_COMPUTE_MODE=live` and a Router API key (`pc.testnet.0g.ai`, funded via `faucet.0g.ai`). Every NPC turn + grade then runs on real 0G Compute (~0.00003 0G/call on testnet). Storage and on-chain anchoring have their own independent flags (`NEXT_PUBLIC_OG_STORAGE_MODE`, `NEXT_PUBLIC_OG_CHAIN_MODE`).

## Architecture

- `lib/og/` — the ONLY place that touches 0G. Mock + live impls behind one typed interface; Compute / Storage / Chain toggle independently.
  - `compute.ts` — live Router calls (chat + judge), model discovery, `x_0g_trace` attestation.
  - `chain.ts` — live anchor (ethers v6, MetaMask, 0G testnet).
  - `mock-*.ts` — canned inference + local persistence for the offline demo.
- `lib/engine/` — tutor/game logic (prompts, SRS, difficulty). No 0G, no UI.
- `lib/content/` — the seed world: 5 scenes + personas, with per-language content scripts (`scripts/{es,fr,hi}.ts`) for **Spanish, French, and Hindi** (Hindi in Devanagari with romanization). Live mode speaks/judges any of them natively; mock plays them all offline.
- `app/api/{chat,judge}` — server routes that hold the Router key.
- `components/design/` — the risograph design system (SplitFlap, Stamp, Postcard, Icons…). See `/styleguide`.
- `lib/audio/` — synthesized SFX + ambient (off by default, autoplay-safe).

Built with Next.js 16 (App Router) + React 19 + Tailwind v4 + Framer Motion + ethers v6.

## Design

A **risograph travelogue fused with playful retro-arcade energy** — manila paper, riso blue + fluoro pink overprint, marigold reward ink, plus pastel washes, a pixel display face, pill buttons, and floating arcade shapes. Two signature motion beats (the split-flap departure board and the rubber stamp) carry the feel; everything else stays quiet. Mobile one-thumb, AA contrast, and `prefers-reduced-motion` are honored throughout.
