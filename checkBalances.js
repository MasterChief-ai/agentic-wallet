const { listAgents, checkBalance } = require("./agentWallet");

async function main() {
  const agents = listAgents();

  if (agents.length === 0) {
    console.log("No agents found.");
    return;
  }

  console.log("\n💰 Agent Balances:\n");
  for (const agent of agents) {
    const balance = await checkBalance(agent.publicKey);
    console.log(`   ${agent.name}: ${balance} SOL`);
  }
}

main().catch(console.error);