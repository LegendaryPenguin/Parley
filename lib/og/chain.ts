// LIVE 0G Chain anchoring (client-side, user signs).
//
// Simplest anchor mechanism (§10): a tx carrying the record hash in calldata,
// or a tiny Anchor contract emitting Anchored(player, hash, ts). Use ethers v6
// BrowserProvider + the user's signer on the 0G testnet RPC.
//
// TODO(§10): confirm testnet RPC + chain id. Until wired, throws — OG_MODE=mock
// routes around this.

const NOT_WIRED = '0G Chain anchoring not wired yet — set OG_MODE=mock or implement lib/og/chain.ts (§10)';

export const liveChain = {
  async anchor(_recordHash: string): Promise<{ txHash: string }> {
    throw new Error(NOT_WIRED);
  },
};
