"use client";

import type { PlayerProfile, VocabItem, NPCMemory, SceneRecord, DialogueTurn } from "@/lib/types";
import { mockStorage } from "./mock-storage";

// LIVE 0G Storage (client-side, user's wallet, true encrypt-to-self).
//
// Design (honest + usable): scene TRANSCRIPTS — the substance the verifiable
// record points to — are uploaded for real to 0G Storage, returning a real
// content root + a real keccak256 record hash. Hot state (profile / vocab /
// NPC memory) stays in fast local storage, because uploading those on every
// edit would mean a gas-paying flow-contract tx per keystroke. This matches
// the §3 narrative ("scene transcripts are written to 0G Storage") without
// making the app unusable.
//
// Encryption is genuine encrypt-to-self: a 32-byte XChaCha20-Poly1305 key is
// derived from a one-time wallet signature (never leaves the browser, cached
// per session). The network only ever sees ciphertext.
//
// 0G Galileo testnet. Requires MetaMask; not exercised in headless/mock runs.

const INDEXER_URL = process.env.NEXT_PUBLIC_OG_INDEXER ?? "https://indexer-storage-testnet-turbo.0g.ai";
const RPC_URL = process.env.NEXT_PUBLIC_OG_RPC ?? "https://evmrpc-testnet.0g.ai";
const CHAIN_ID_HEX = "0x40da"; // 16602

let cachedKey: Uint8Array | null = null;

type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };
function getEthereum(): Eth {
  const eth = (globalThis as unknown as { ethereum?: Eth }).ethereum;
  if (!eth) throw new Error("No wallet found — install MetaMask to use 0G Storage.");
  return eth;
}

async function getSigner() {
  const eth = getEthereum();
  await eth.request({ method: "eth_requestAccounts" });
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_ID_HEX }] });
  } catch {
    /* chain add handled elsewhere (chain.ts) / user may already be on it */
  }
  const { BrowserProvider } = await import("ethers");
  const provider = new BrowserProvider(eth as never);
  return provider.getSigner();
}

// Derive (once per session) a symmetric key from a wallet signature.
async function getKey(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  const signer = await getSigner();
  const sig = await signer.signMessage("Parley — derive my encryption key (v1)");
  const { keccak_256 } = await import("@noble/hashes/sha3");
  cachedKey = keccak_256(new TextEncoder().encode(sig));
  return cachedKey;
}

async function encryptJson(value: unknown): Promise<Uint8Array> {
  const key = await getKey();
  const { xchacha20poly1305 } = await import("@noble/ciphers/chacha");
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const pt = new TextEncoder().encode(JSON.stringify(value));
  const ct = xchacha20poly1305(key, nonce).encrypt(pt);
  const out = new Uint8Array(nonce.length + ct.length);
  out.set(nonce, 0);
  out.set(ct, nonce.length);
  return out;
}

async function decryptJson(bytes: Uint8Array): Promise<unknown> {
  const key = await getKey();
  const { xchacha20poly1305 } = await import("@noble/ciphers/chacha");
  const nonce = bytes.slice(0, 24);
  const ct = bytes.slice(24);
  const pt = xchacha20poly1305(key, nonce).decrypt(ct);
  return JSON.parse(new TextDecoder().decode(pt));
}

// Upload bytes to 0G Storage; returns the content root hash.
async function uploadBytes(bytes: Uint8Array, name: string): Promise<string> {
  const signer = await getSigner();
  const sdk = await import("@0gfoundation/0g-ts-sdk");
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const file = new sdk.Blob(new File([ab], name));
  const indexer = new sdk.Indexer(INDEXER_URL);
  const [res, err] = await indexer.upload(file, RPC_URL, signer);
  if (err) throw err;
  if (!res) throw new Error("0G Storage upload returned no result");
  return "rootHash" in res ? res.rootHash : res.rootHashes[0];
}

async function keccakHashOf(value: unknown): Promise<string> {
  const { keccak_256 } = await import("@noble/hashes/sha3");
  const { hexlify } = await import("ethers");
  return hexlify(keccak_256(new TextEncoder().encode(JSON.stringify(value))));
}

// Round-trip: download an encrypted transcript from 0G Storage by content root
// and decrypt it to oneself. Proves the stored record is genuinely retrievable
// and owned by the user (the "portable / yours" claim).
async function downloadTranscript(root: string): Promise<{ record: unknown; turns: unknown } | null> {
  const sdk = await import("@0gfoundation/0g-ts-sdk");
  const indexer = new sdk.Indexer(INDEXER_URL);
  const [blob, err] = await indexer.downloadToBlob(root);
  if (err || !blob) return null;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return (await decryptJson(bytes)) as { record: unknown; turns: unknown };
}

export const liveStorage = {
  // ---- hot state: fast local (no gas). Same data the mock uses. ----
  savePlayer: (p: PlayerProfile) => mockStorage.savePlayer(p),
  getPlayer: (id: string) => mockStorage.getPlayer(id),
  saveVocab: (id: string, items: VocabItem[]) => mockStorage.saveVocab(id, items),
  getVocab: (id: string) => mockStorage.getVocab(id),
  saveNPCMemory: (m: NPCMemory) => mockStorage.saveNPCMemory(m),
  getNPCMemory: (npcId: string, playerId: string) => mockStorage.getNPCMemory(npcId, playerId),
  getRecords: (playerId: string) => mockStorage.getRecords(playerId),
  setAnchor: (playerId: string, recordHash: string, txHash: string) =>
    mockStorage.setAnchor(playerId, recordHash, txHash),

  // ---- the real one: transcript → encrypted → 0G Storage ----
  async saveSceneTranscript(
    rec: Omit<SceneRecord, "transcriptStorageRoot" | "recordHash" | "anchorTx">,
    turns: DialogueTurn[],
  ): Promise<{ root: string; recordHash: string }> {
    const payload = { record: rec, turns };
    const recordHash = await keccakHashOf(payload);
    const cipher = await encryptJson(payload);
    const root = await uploadBytes(cipher, `parley-${rec.sceneId}-${rec.completedAt}.bin`);
    await mockStorage.appendRecord({
      ...rec,
      transcriptStorageRoot: root,
      recordHash,
    });
    return { root, recordHash };
  },

  // Read an encrypted transcript back from 0G Storage by content root (the
  // "your record is genuinely retrievable + yours" round-trip).
  getTranscript: (root: string) => downloadTranscript(root),
};
