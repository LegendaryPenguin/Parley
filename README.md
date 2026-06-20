# Parley

**Learn a language by living in it.** Parley is an explorable, illustrated risograph world where the only way forward is to *talk your way through it* — in the language you're learning — with AI characters who remember you. Built for the **0G Zero Cup**.

## How 0G does real work (not a bolt-on)

- **0G Compute** — every NPC turn is a live inference call; a separate *judge* call grades the exchange (goal met? corrections? words used?). No scripted dialogue trees. Routed through 0G's OpenAI-compatible Router.
- **0G Storage** — the player profile, phrasebook (with spaced-repetition state), NPC memory, and scene transcripts are written client-side encrypted. The world remembers you; your phrasebook is yours.
- **0G Chain** — each completed scene is hashed and anchored on-chain, making the learning record tamper-evident.

Strip 0G out and you have an empty map with nothing to say, nothing remembered, nothing provable.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Runs in `OG_MODE=mock` by default — canned NPC replies + local storage, so the whole golden path (Arrival → Atlas → Scene → reward → Passport) works with no network. To use real 0G testnet inference, copy `.env.example` to `.env.local`, set `OG_MODE=live` and a Router API key (`pc.testnet.0g.ai`, funded via `faucet.0g.ai`).

## Architecture

- `lib/og/` — the ONLY place that touches 0G. Mock + live impls behind one typed interface.
- `lib/engine/` — tutor/game logic (prompts, SRS, difficulty). No 0G, no UI.
- `lib/content/` — the seed world (scenes + personas).
- `app/api/{chat,judge}` — server routes holding the Router key.
- `components/design/` — the risograph design system (SplitFlap, Stamp, Postcard…). See `/styleguide`.

Built with Next.js (App Router) + React + Tailwind v4 + Framer Motion.
