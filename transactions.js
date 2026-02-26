const solanaWeb3 = require("@solana/web3.js");
const { loadAgentWallet, checkBalance } = require("./agentWallet");
require("dotenv").config();

const connection = new solanaWeb3.Connection(
  process.env.RPC_URL,
  "confirmed"
);

// Send SOL from one agent to another
async function sendSOL(fromAgentName, toPublicKey, amountInSOL) {
  console.log(`\n Agent "${fromAgentName}" initiating transfer...`);
  console.log(`   Amount: ${amountInSOL} SOL`);
  console.log(`   To: ${toPublicKey}`);

  // Load the sending agent's keypair
  const fromKeypair = loadAgentWallet(fromAgentName);

  // Check balance before sending
  const balance = await checkBalance(fromKeypair.publicKey.toBase58());
  console.log(`   Current balance: ${balance} SOL`);

  if (balance < amountInSOL) {
    throw new Error(
      `Insufficient funds. ${fromAgentName} has ${balance} SOL but tried to send ${amountInSOL} SOL`
    );
  }

  // Build the transaction
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: new solanaWeb3.PublicKey(toPublicKey),
      lamports: amountInSOL * solanaWeb3.LAMPORTS_PER_SOL,
    })
  );

  // Get latest blockhash
  const latestBlockhash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.feePayer = fromKeypair.publicKey;

  // Agent signs the transaction automatically -- no human input
  transaction.sign(fromKeypair);

  // Send to network
  const signature = await connection.sendRawTransaction(
    transaction.serialize()
  );

  // Wait for confirmation
  await connection.confirmTransaction({
    signature,
    ...latestBlockhash,
  });

  console.log(` Transfer successful!`);
  console.log(`   Signature: ${signature}`);
  console.log(
    `   View on explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
  );

  return signature;
}

// Agent sends SOL to another agent by name
async function agentToAgentTransfer(fromAgentName, toAgentName, amountInSOL) {
  const { listAgents } = require("./agentWallet");
  const agents = listAgents();
  const toAgent = agents.find((a) => a.name === toAgentName);

  if (!toAgent) {
    throw new Error(`Agent "${toAgentName}" not found`);
  }

  return await sendSOL(fromAgentName, toAgent.publicKey, amountInSOL);
}

module.exports = { sendSOL, agentToAgentTransfer };