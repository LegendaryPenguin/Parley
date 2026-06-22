"use client";

import { BrowserProvider, id as keccakId } from "ethers";

// LIVE 0G Chain anchoring (client-side, user signs via MetaMask).
//
// Anchor mechanism (§10, simplest form): send a 0-value self-transaction whose
// calldata is keccak256(recordHash). That permanently records the record's
// fingerprint on 0G Chain — tamper-evidence without a custom contract. Anyone
// can later recompute keccak256(recordHash) and find this tx.
//
// 0G Galileo testnet: chainId 16602 (0x40da), RPC https://evmrpc-testnet.0g.ai.
// Requires an injected wallet; not exercised in headless/mock runs.

const OG_TESTNET = {
  chainIdHex: "0x40da", // 16602
  params: {
    chainId: "0x40da",
    chainName: "0G Galileo Testnet",
    nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
    rpcUrls: ["https://evmrpc-testnet.0g.ai"],
    blockExplorerUrls: ["https://chainscan-galileo.0g.ai"],
  },
};

type Eth = {
  request: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getEthereum(): Eth {
  const eth = (globalThis as unknown as { ethereum?: Eth }).ethereum;
  if (!eth) throw new Error("No wallet found — install MetaMask to anchor on 0G Chain.");
  return eth;
}

async function ensureChain(eth: Eth) {
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: OG_TESTNET.chainIdHex }] });
  } catch (err) {
    // 4902 = chain not added to the wallet yet → add it, then it's selected.
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await eth.request({ method: "wallet_addEthereumChain", params: [OG_TESTNET.params] });
    } else {
      throw err;
    }
  }
}

export const liveChain = {
  async anchor(recordHash: string): Promise<{ txHash: string }> {
    const eth = getEthereum();
    await eth.request({ method: "eth_requestAccounts" });
    await ensureChain(eth);

    const provider = new BrowserProvider(eth as never);
    const signer = await provider.getSigner();
    const self = await signer.getAddress();

    // keccak256 of the record hash string → always valid 32-byte calldata,
    // even when the (mock) storage root isn't itself valid hex.
    const data = keccakId(recordHash);

    const tx = await signer.sendTransaction({ to: self, value: BigInt(0), data });
    // Return as soon as it's broadcast; the UI shows it as the anchor tx and
    // confirmation follows on its own (keeps the reward beat snappy).
    return { txHash: tx.hash };
  },
};
