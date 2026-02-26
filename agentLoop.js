const { checkBalance, listAgents, loadAgentWallet } = require("./agentWallet");
const { sendSOL } = require("./transactions");
require("dotenv").config();

// Each agent has a simple strategy
const AGENT_STRATEGIES = {
  alpha: {
    // If balance goes above 4 SOL, send 0.1 to beta
    triggerIfBalanceAbove: 4.0,
    sendAmount: 0.1,
    sendTo: "beta",
    role: "distributor",
  },
  beta: {
    // If balance goes above 4 SOL, send 0.1 to gamma
    triggerIfBalanceAbove: 4.0,
    sendAmount: 0.1,
    sendTo: "gamma",
    role: "distributor",
  },
  gamma: {
    // Gamma just holds — it's the collector
    triggerIfBalanceAbove: null,
    sendAmount: null,
    sendTo: null,
    role: "collector",
  },
};

// Single decision cycle for one agent
async function runAgentCycle(agentName) {
  const strategy = AGENT_STRATEGIES[agentName];
  if (!strategy) return;

  const agents = listAgents();
  const agent = agents.find((a) => a.name === agentName);
  if (!agent) return;

  const balance = await checkBalance(agent.publicKey);
  const timestamp = new Date().toLocaleTimeString();

  console.log(`[${timestamp}]  ${agentName} (${strategy.role}) | Balance: ${balance} SOL`);

  // Decision logic
  if (
    strategy.triggerIfBalanceAbove !== null &&
    balance > strategy.triggerIfBalanceAbove
  ) {
    console.log(
      `[${timestamp}] ⚡ ${agentName} triggered! Balance ${balance} > ${strategy.triggerIfBalanceAbove}. Sending ${strategy.sendAmount} SOL to ${strategy.sendTo}...`
    );

    try {
      await sendSOL(agentName, getPublicKey(strategy.sendTo, agents), strategy.sendAmount);
      console.log(`[${timestamp}]  ${agentName} executed transfer successfully`);
    } catch (err) {
      console.log(`[${timestamp}]  ${agentName} transfer failed: ${err.message}`);
    }
  } else {
    if (strategy.role === "collector") {
      console.log(`[${timestamp}]  ${agentName} holding. No action.`);
    } else {
      console.log(`[${timestamp}]  ${agentName} balance below threshold. Waiting...`);
    }
  }
}

function getPublicKey(agentName, agents) {
  const agent = agents.find((a) => a.name === agentName);
  if (!agent) throw new Error(`Agent ${agentName} not found`);
  return agent.publicKey;
}

// Main loop -- runs all agents on a cycle
async function startAgentLoop(intervalSeconds = 15, maxCycles = 5) {
  console.log("  Starting agent loop...");
  console.log(`   Checking every ${intervalSeconds} seconds`);
  console.log(`   Running for ${maxCycles} cycles\n`);

  let cycle = 0;

  const loop = async () => {
    if (cycle >= maxCycles) {
      console.log("\n Max cycles reached. Agent loop complete.");
      return;
    }

    cycle++;
    console.log(`\n--- Cycle ${cycle}/${maxCycles} ---`);

    // Run all agents in parallel
    const agents = listAgents();
    await Promise.all(agents.map((a) => runAgentCycle(a.name)));

    // Schedule next cycle
    setTimeout(loop, intervalSeconds * 1000);
  };

  // Start immediately
  await loop();
}

startAgentLoop(15, 5);
