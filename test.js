const { createAgentWallet, checkBalance, listAgents } = require("./agentWallet");

async function main() {
  console.log("Creating agent wallets...\n");

  // Create 3 agents
  const agent1 = createAgentWallet("alpha");
  const agent2 = createAgentWallet("beta");
  const agent3 = createAgentWallet("gamma");

  console.log("\n Listing all agents:");
  const agents = listAgents();
  agents.forEach((a) => console.log(`   - ${a.name}: ${a.publicKey}`));

  console.log("\n Checking balances...");
  for (const agent of agents) {
    const balance = await checkBalance(agent.publicKey);
    console.log(`   ${agent.name}: ${balance} SOL`);
  }
}

main().catch(console.error);