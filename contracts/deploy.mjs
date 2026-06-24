#!/usr/bin/env node
// Deploy ParleyStageCredential to 0G Galileo testnet.
//
//   DEPLOYER_PRIVATE_KEY=0x...  node contracts/deploy.mjs
//
// Requires: `npm i -D solc` (already in devDependencies) and a funded Galileo
// testnet wallet. Prints the deployed address — put it in .env.local as
// NEXT_PUBLIC_OG_INFT_ADDRESS to enable in-app minting.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";
import { Wallet, JsonRpcProvider, ContractFactory } from "ethers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RPC = process.env.OG_RPC ?? "https://evmrpc-testnet.0g.ai";
const PK = process.env.DEPLOYER_PRIVATE_KEY;
if (!PK) {
  console.error("Set DEPLOYER_PRIVATE_KEY (a funded Galileo testnet key). Aborting.");
  process.exit(1);
}

const source = fs.readFileSync(path.join(__dirname, "ParleyStageCredential.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: { "ParleyStageCredential.sol": { content: source } },
  settings: { viaIR: true, optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
(out.errors ?? []).forEach((e) => e.severity === "error" && console.error(e.formattedMessage));
if ((out.errors ?? []).some((e) => e.severity === "error")) process.exit(1);

const c = out.contracts["ParleyStageCredential.sol"].ParleyStageCredential;
const abi = c.abi;
const bytecode = c.evm.bytecode.object;

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(PK, provider);
console.log("Deployer:", wallet.address);
console.log("Network :", (await provider.getNetwork()).chainId.toString());

const factory = new ContractFactory(abi, bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();
const address = await contract.getAddress();

console.log("\n✅ ParleyStageCredential deployed at:", address);
console.log("   Explorer: https://chainscan-galileo.0g.ai/address/" + address);
console.log("\nAdd to .env.local:");
console.log("   NEXT_PUBLIC_OG_INFT_ADDRESS=" + address);

// stash the ABI for reference (client uses a hardcoded minimal ABI)
fs.writeFileSync(path.join(__dirname, "ParleyStageCredential.abi.json"), JSON.stringify(abi, null, 2));
