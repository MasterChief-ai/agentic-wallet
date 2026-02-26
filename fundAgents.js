const { listAgents, checkBalance} = require("./agentWallet");
require("dotenv").config();

const solanaWeb3 = require("@solana/web3.js");

async function fundAgent(publicKey, agentName) {
  const connection = new solanaWeb3.Connection(
    process.env.RPC_URL,
    "confirmed"
  );

  console.log(`\n Requesting airdrop for ${agentName}...`);

  try {
    const pubKey = new solanaWeb3.PublicKey(publicKey);
    const signature = await connection.requestAirdrop(
      pubKey,
      1 * solanaWeb3.LAMPORTS_PER_SOL
    );

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });

    console.log(` ${agentName} funded with 1 SOL`);
    console.log(`   Signature: ${signature}`);
  } catch (err) {
    console.log(` Airdrop failed for ${agentName}: ${err.message}`);
    console.log(`   Fund manually at https://faucet.solana.com`);
    console.log(`   Address: ${publicKey}`);
  }
}

async function main() {
  const agents = listAgents();

  if (agents.length === 0) {
    console.log("No agents found. Run test.js first.");
    return;
  }

  for (const agent of agents) {
    await fundAgent(agent.publicKey, agent.name);
    // Small delay between airdrops to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n Done funding agents!");
}


main().catch(console.error);
