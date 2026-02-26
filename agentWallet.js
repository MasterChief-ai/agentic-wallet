const solanaWeb3 = require("@solana/web3.js");
const CryptoJS = require("crypto-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL;
const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD;
const AGENTS_DIR = path.join(__dirname, "agents");

// Create agents folder if it doesn't exist
if (!fs.existsSync(AGENTS_DIR)) {
  fs.mkdirSync(AGENTS_DIR);
}

// Create a new agent wallet
function createAgentWallet(agentName) {
  const keypair = solanaWeb3.Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = Buffer.from(keypair.secretKey).toString("hex");

  // Encrypt the secret key before saving
  const encryptedSecret = CryptoJS.AES.encrypt(
    secretKey,
    ENCRYPTION_PASSWORD
  ).toString();

  const walletData = {
    agentName,
    publicKey,
    encryptedSecret,
    createdAt: new Date().toISOString(),
  };

  // Save to a JSON file named after the agent
  const filePath = path.join(AGENTS_DIR, `${agentName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));

  console.log(`\n Agent wallet created: ${agentName}`);
  console.log(`   Public Key: ${publicKey}`);
  console.log(`   Saved to: ${filePath}`);

  return publicKey;
}

// Load an agent wallet and return the keypair
function loadAgentWallet(agentName) {
  const filePath = path.join(AGENTS_DIR, `${agentName}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`No wallet found for agent: ${agentName}`);
  }

  const walletData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Decrypt the secret key
  const decryptedSecret = CryptoJS.AES.decrypt(
    walletData.encryptedSecret,
    ENCRYPTION_PASSWORD
  ).toString(CryptoJS.enc.Utf8);

  const secretKeyBuffer = Buffer.from(decryptedSecret, "hex");
  const keypair = solanaWeb3.Keypair.fromSecretKey(secretKeyBuffer);

  return keypair;
}

// Check balance of any public key
async function checkBalance(publicKey) {
  const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");
  const pubKey = new solanaWeb3.PublicKey(publicKey);
  const balance = await connection.getBalance(pubKey);
  const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
  return solBalance;
}

// List all existing agents
function listAgents() {
  const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("No agents found.");
    return [];
  }
  const agents = files.map((f) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(AGENTS_DIR, f), "utf8")
    );
    return { name: data.agentName, publicKey: data.publicKey };
  });
  return agents;
}

module.exports = { createAgentWallet, loadAgentWallet, checkBalance, listAgents };