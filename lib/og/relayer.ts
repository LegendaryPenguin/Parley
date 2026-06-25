// SERVER-SIDE 0G relayer (Option B). When OG_RELAYER_PRIVATE_KEY is set, the
// server signs 0G Storage uploads + 0G Chain anchors with a funded testnet key,
// so ANY visitor gets real on-chain records funded by the host — no wallet/gas
// needed on their side. Server-only: never imported by client code.
import { Wallet, JsonRpcProvider, id as keccakId, hexlify } from "ethers";
import type { DialogueTurn, SceneRecord } from "@/lib/types";

const RPC = process.env.OG_RPC ?? "https://evmrpc-testnet.0g.ai";
const INDEXER = process.env.NEXT_PUBLIC_OG_INDEXER ?? "https://indexer-storage-testnet-turbo.0g.ai";
const PK = process.env.OG_RELAYER_PRIVATE_KEY ?? "";

export function relayerConfigured(): boolean {
  return /^0x?[0-9a-fA-F]{64}$/.test(PK.trim());
}

function wallet(): Wallet {
  if (!relayerConfigured()) throw new Error("OG_RELAYER_PRIVATE_KEY not set");
  const pk = PK.startsWith("0x") ? PK : `0x${PK}`;
  return new Wallet(pk, new JsonRpcProvider(RPC));
}

// Deterministic server symmetric key (so the host can decrypt its own records).
async function serverKey(): Promise<Uint8Array> {
  const { keccak_256 } = await import("@noble/hashes/sha3");
  return keccak_256(new TextEncoder().encode("parley-relayer-storage-v1:" + PK));
}

async function encryptJson(value: unknown): Promise<Uint8Array> {
  const key = await serverKey();
  const { xchacha20poly1305 } = await import("@noble/ciphers/chacha");
  const { randomBytes } = await import("@noble/hashes/utils");
  const nonce = randomBytes(24);
  const pt = new TextEncoder().encode(JSON.stringify(value));
  const ct = xchacha20poly1305(key, nonce).encrypt(pt);
  const out = new Uint8Array(nonce.length + ct.length);
  out.set(nonce, 0);
  out.set(ct, nonce.length);
  return out;
}

async function keccakHashOf(value: unknown): Promise<string> {
  const { keccak_256 } = await import("@noble/hashes/sha3");
  return hexlify(keccak_256(new TextEncoder().encode(JSON.stringify(value))));
}

// Upload an encrypted transcript to 0G Storage, signed by the relayer.
export async function relayerUploadTranscript(
  rec: Omit<SceneRecord, "transcriptStorageRoot" | "recordHash" | "anchorTx">,
  turns: DialogueTurn[],
): Promise<{ root: string; recordHash: string }> {
  const payload = { record: rec, turns };
  const recordHash = await keccakHashOf(payload);
  const bytes = await encryptJson(payload);
  const sdk = await import("@0gfoundation/0g-ts-sdk");
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const file = new sdk.Blob(new File([ab], `parley-${rec.sceneId}-${rec.completedAt}.bin`));
  const indexer = new sdk.Indexer(INDEXER);
  const [res, err] = await indexer.upload(file, RPC, wallet());
  if (err) throw err;
  if (!res) throw new Error("0G Storage upload returned no result");
  const root = "rootHash" in res ? res.rootHash : res.rootHashes[0];
  return { root, recordHash };
}

// Anchor keccak256(recordHash) as a relayer-signed tx on 0G Chain.
export async function relayerAnchor(recordHash: string): Promise<{ txHash: string }> {
  const w = wallet();
  const tx = await w.sendTransaction({ to: w.address, value: BigInt(0), data: keccakId(recordHash) });
  return { txHash: tx.hash };
}
