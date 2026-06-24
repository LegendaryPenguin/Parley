# Parley contracts — `ParleyStageCredential`

A **soulbound** (non-transferable) ERC-721 credential, minted to a learner when they
clear a stage. Each token is bound to that scene's **encrypted transcript on 0G Storage**
(`storageRoot`) plus the grading model's attestation — the token's data lives on 0G, in the
spirit of 0G's intelligent NFTs (INFTs). It's soulbound because a language credential
belongs to the human who earned it.

`tokenURI` returns on-chain JSON whose `external_url` points at the 0G-stored transcript.

## Deploy (one command)

You need a **funded 0G Galileo testnet** wallet key. The repo never stores it.

```bash
npm install                       # solc + ethers are already devDeps/deps
DEPLOYER_PRIVATE_KEY=0xYOURKEY node contracts/deploy.mjs
```

It compiles `ParleyStageCredential.sol` (solc, `viaIR`) and deploys to
`https://evmrpc-testnet.0g.ai` (override with `OG_RPC`). On success it prints the address and
the explorer link, and writes `ParleyStageCredential.abi.json`.

## Enable in-app minting

Put the printed address in `.env.local`:

```bash
NEXT_PUBLIC_OG_INFT_ADDRESS=0x...
```

Now the **Passport** shows a **"Mint credential ⬡"** button on each verified record (for records
with a real on-chain grade hash). Minting is a user-signed tx via MetaMask on Galileo; the mint
tx is logged in the dev panel and the record links to `chainscan-galileo.0g.ai`.

## What it shows for 0G

- **0G Chain** beyond anchoring: an owned, on-chain, queryable credential collection.
- **0G Storage binding:** each token references the encrypted transcript root, so the NFT's
  substance lives on 0G — not in centralized metadata.
