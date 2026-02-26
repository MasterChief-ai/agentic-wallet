const solanaWeb3 = require("@solana/web3.js");

// Generate a new keypair (this is your wallet)
const keypair = solanaWeb3.Keypair.generate();

console.log("=== NEW AGENT WALLET ===");
console.log("Public Key:", keypair.publicKey.toBase58());
console.log("Secret Key:", Buffer.from(keypair.secretKey).toString("hex"));
console.log("========================");
console.log("IMPORTANT: Save your secret key somewhere safe. Never share it.");

