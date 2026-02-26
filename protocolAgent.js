const axios = require("axios");
const { loadAgentWallet, checkBalance, listAgents } = require("./agentWallet");
const { sendSOL } = require("./transactions");
require("dotenv").config();


// Token mint addresses on devnet
const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
};

// Fetch current SOL price in USDC from Jupiter
async function getSOLPrice() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { timeout: 5000 }
    );
    const price = response.data.solana.usd;
    return price;
  } catch (err) {
    console.log("⚠️  Could not fetch live price, using fallback...");
    console.log(`   Error: ${err.message}`);
    return null;
  }
}

// Agent decision: should I send SOL based on current price?
function makeDecision(agentName, balance, solPrice) {
  console.log(`\n ${agentName} analyzing market conditions...`);
  console.log(`   Current SOL price: $${solPrice ? solPrice.toFixed(2) : "unknown"} USD`);
  console.log(`   Current balance: ${balance} SOL`);

  // Strategy: if price data is available and balance is healthy, distribute
  if (!solPrice) {
    console.log(`   Decision: HOLD — no price data available`);
    return { action: "hold", reason: "no price data" };
  }

  if (balance < 0.5) {
    console.log(`   Decision: HOLD — balance too low to act`);
    return { action: "hold", reason: "insufficient balance" };
  }

  if (solPrice > 50) {
    // SOL is valuable, distribute some
    console.log(`   Decision: DISTRIBUTE — SOL price is strong`);
    return { action: "distribute", amount: 0.05, reason: "strong price signal" };
  } else {
    console.log(`   Decision: HOLD — waiting for better conditions`);
    return { action: "hold", reason: "price below threshold" };
  }
}

// Run one agent through a full protocol interaction cycle
async function runProtocolAgent(agentName, targetAgentName) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(` Protocol Agent: ${agentName}`);
  console.log(`${"=".repeat(50)}`);

  // Step 1: Load agent wallet
  const keypair = loadAgentWallet(agentName);
  const publicKey = keypair.publicKey.toBase58();
  console.log(`\n Wallet loaded: ${publicKey}`);

  // Step 2: Check balance
  const balance = await checkBalance(publicKey);
  console.log(` Balance: ${balance} SOL`);

  // Step 3: Fetch market data from Coingecko (as a stand-in for Jupiter API)
  console.log(`\n Querying Coingecko price API...`);
  const solPrice = await getSOLPrice();

  if (solPrice) {
    console.log(` SOL Price fetched: $${solPrice.toFixed(2)} USD`);
  }

  // Step 4: Agent makes autonomous decision based on data
  const decision = makeDecision(agentName, balance, solPrice);

  // Step 5: Execute decision
  if (decision.action === "distribute") {
    const agents = listAgents();
    const target = agents.find((a) => a.name === targetAgentName);

    if (!target) {
      console.log(` Target agent ${targetAgentName} not found`);
      return;
    }

    console.log(`\n Executing decision: sending ${decision.amount} SOL to ${targetAgentName}`);
    console.log(`   Reason: ${decision.reason}`);

    try {
      const signature = await sendSOL(agentName, target.publicKey, decision.amount);
      console.log(`\n Protocol interaction complete!`);
      console.log(`   Agent: ${agentName}`);
      console.log(`   Action: Distributed ${decision.amount} SOL based on market signal`);
      console.log(`   Signature: ${signature}`);
      console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (err) {
      console.log(` Execution failed: ${err.message}`);
    }
  } else {
    console.log(`\n Agent ${agentName} decided to hold. No transaction executed.`);
    console.log(`   Reason: ${decision.reason}`);
  }
}

// Run all agents through protocol interaction
async function main() {
  console.log(" PROTOCOL AGENT SYSTEM");
  console.log("========================\n");
  console.log("Agents will query Coingecko price API and make");
  console.log("autonomous decisions based on market conditions.\n");

  const timestamp = new Date().toLocaleString();
  console.log(` Run started: ${timestamp}`);

  // Run agents sequentially
  await runProtocolAgent("alpha", "gamma");
  await runProtocolAgent("beta", "gamma");

  console.log(`\n${"=".repeat(50)}`);
  console.log(" All protocol agents completed their cycles");
  console.log(`${"=".repeat(50)}`);
}

main().catch(console.error);
