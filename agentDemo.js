const { agentToAgentTransfer } = require("./transactions");
const { checkBalance, listAgents } = require("./agentWallet");

async function main() {
  console.log("\n AGENTIC WALLET DEMO\n");
  console.log("======================");

  // Show starting balances
  console.log("\n Starting balances:");
  const agents = listAgents();
  for (const agent of agents) {
    const balance = await checkBalance(agent.publicKey);
    console.log(`   ${agent.name}: ${balance} SOL`);
  }

  // Alpha sends to Beta autonomously
  await agentToAgentTransfer("alpha", "beta", 0.1);

  // Beta sends to Gamma autonomously
  await agentToAgentTransfer("beta", "gamma", 0.1);

  // Show ending balances
  console.log("\n Final balances:");
  for (const agent of agents) {
    const balance = await checkBalance(agent.publicKey);
    console.log(`   ${agent.name}: ${balance} SOL`);
  }

  console.log("\n Demo complete!");
}

main().catch(console.error);