"use client";

import { BrowserProvider, Contract } from "ethers";

// Mint a Parley stage credential (soulbound INFT) on 0G Galileo testnet, bound
// to the scene's 0G Storage transcript + grading attestation. Client-side, the
// user signs. Gated by NEXT_PUBLIC_OG_INFT_ADDRESS (set after deploying
// contracts/ParleyStageCredential.sol via contracts/deploy.mjs).

const CHAIN_ID_HEX = "0x40da"; // 16602

const ABI = [
  "function mintCredential(address to, string storageRoot, bytes32 recordHash, string skill, string language, uint16 fluency, string model) returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "event StageCredentialMinted(address indexed learner, uint256 indexed tokenId, string skill, string storageRoot, bytes32 recordHash)",
];

export const INFT_ADDRESS = process.env.NEXT_PUBLIC_OG_INFT_ADDRESS ?? "";
export function inftEnabled(): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(INFT_ADDRESS);
}

type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };
function getEthereum(): Eth {
  const eth = (globalThis as unknown as { ethereum?: Eth }).ethereum;
  if (!eth) throw new Error("No wallet found — install MetaMask to mint your credential.");
  return eth;
}

export interface MintArgs {
  to: string;
  storageRoot: string;
  recordHash: string; // 0x + 64 hex
  skill: string;
  language: string;
  fluency: number;
}

export async function mintStageCredential(args: MintArgs): Promise<{ txHash: string; tokenId?: string }> {
  if (!inftEnabled()) throw new Error("INFT contract not configured (NEXT_PUBLIC_OG_INFT_ADDRESS).");
  const eth = getEthereum();
  await eth.request({ method: "eth_requestAccounts" });
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_ID_HEX }] });
  } catch {
    /* user may already be on Galileo; chain add handled in chain.ts */
  }
  const provider = new BrowserProvider(eth as never);
  const signer = await provider.getSigner();
  const contract = new Contract(INFT_ADDRESS, ABI, signer);
  const tx = await contract.mintCredential(
    args.to,
    args.storageRoot,
    args.recordHash,
    args.skill,
    args.language,
    Math.max(0, Math.min(100, Math.round(args.fluency))),
    "qwen/qwen2.5-omni-7b",
  );
  const receipt = await tx.wait(1);
  // pull the tokenId out of the Minted event if present
  let tokenId: string | undefined;
  try {
    for (const log of receipt?.logs ?? []) {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "StageCredentialMinted") {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    }
  } catch {
    /* best-effort */
  }
  return { txHash: tx.hash, tokenId };
}
