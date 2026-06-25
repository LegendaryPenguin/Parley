# Deploying Parley to Vercel

Parley is a standard Next.js 16 app — it deploys to Vercel with no special config.

## The funding model (important)

Parley has two kinds of 0G cost, and they're funded differently:

- **Compute (inference)** runs **server-side** with your **0G Router API key**. On a deployed
  site, *every visitor's* conversation is paid from **your** Router credit automatically — no
  tester needs anything. ✅ This is the "funded by me, works for everyone" part.
- **Storage + Chain** are **signed client-side by each visitor's own MetaMask** (their gas). So
  if you turn those `live` on the public deploy, each tester would need their own Galileo
  testnet gas — which is *not* funded by you and adds friction.

**Recommended public config:** Compute **live** (you fund it) + Storage/Chain **mock**. Visitors
connect a wallet (identity/passport), play the full game on real 0G inference, and the on-chain
record shows as a demo. Nothing for testers to fund; nothing can break.

> Want real on-chain Storage/Chain for *every* visitor, funded by you? That needs a server-side
> relayer signing with your testnet key (a key in Vercel env + moving those calls server-side).
> See "Option B" below.

## Deploy (recommended path — dashboard, ~5 min)

1. Go to **vercel.com → Add New → Project → Import** `LegendaryPenguin/Parley`.
2. Framework preset: **Next.js** (auto-detected). Build/output: defaults.
3. **Environment Variables** — add these (Production):

   | Key | Value | Notes |
   |---|---|---|
   | `OG_COMPUTE_MODE` | `live` | turns on real inference |
   | `OG_ROUTER_BASE_URL` | `https://router-api-testnet.integratenetwork.work/v1` | |
   | `OG_ROUTER_API_KEY` | `sk-…` (your chat key) | **secret, server-only** — never exposed to the browser |
   | `OG_CHAT_MODEL` | `qwen/qwen2.5-omni-7b` | |
   | `NEXT_PUBLIC_OG_MODE` | `mock` | storage/chain stay mock → no tester gas |

4. **Deploy.** Visitors can now connect a wallet and play, with inference on your account.

> Heads-up: a public Router key means anyone can use (and drain) your compute credit. For a demo
> that's usually fine; add a simple per-IP/wallet rate limit on `/api/chat` + `/api/judge` if you
> expose it widely.

## Deploy (CLI alternative)

```bash
npx vercel login          # your account
npx vercel link           # link to the repo
# add the env vars (repeat per key; choose Production):
npx vercel env add OG_COMPUTE_MODE
npx vercel env add OG_ROUTER_BASE_URL
npx vercel env add OG_ROUTER_API_KEY
npx vercel env add OG_CHAT_MODEL
npx vercel env add NEXT_PUBLIC_OG_MODE
npx vercel --prod
```

## Option B — real on-chain for every visitor, funded by you (advanced)

Move Storage + Chain signing server-side behind a relayer that holds a **funded Galileo testnet
private key** (set as a Vercel secret, e.g. `OG_RELAYER_PRIVATE_KEY`). Then `/api/anchor` and a
server storage upload sign with your key, so visitors get real roots/txs without their own gas.
Tradeoffs: your testnet key lives in Vercel env, and you'd want rate limiting so the gas isn't
drained. Ask and this can be wired.
