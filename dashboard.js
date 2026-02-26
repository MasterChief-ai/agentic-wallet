const blessed = require("blessed");
const { listAgents, checkBalance } = require("./agentWallet");
const { agentToAgentTransfer } = require("./transactions");
const axios = require("axios");
require("dotenv").config();

// Setup screen
const screen = blessed.screen({
  smartCSR: true,
  title: "Agentic Wallet Dashboard",
});

// Title box
const titleBox = blessed.box({
  top: 0,
  left: 0,
  width: "100%",
  height: 3,
  content: "{center}{bold} AGENTIC WALLET SYSTEM — SOLANA DEVNET{/bold}{/center}",
  tags: true,
  style: {
    fg: "cyan",
    bg: "black",
    border: { fg: "cyan" },
  },
  border: { type: "line" },
});

// Agent balances box
const agentBox = blessed.box({
  top: 3,
  left: 0,
  width: "50%",
  height: 12,
  label: " Agent Wallets ",
  tags: true,
  border: { type: "line" },
  style: {
    fg: "white",
    bg: "black",
    border: { fg: "green" },
    label: { fg: "green" },
  },
  padding: { left: 1 },
});

// Market data box
const marketBox = blessed.box({
  top: 3,
  left: "50%",
  width: "50%",
  height: 12,
  label: " Market Data ",
  tags: true,
  border: { type: "line" },
  style: {
    fg: "white",
    bg: "black",
    border: { fg: "yellow" },
    label: { fg: "yellow" },
  },
  padding: { left: 1 },
});

// Transaction log box
const logBox = blessed.box({
  top: 15,
  left: 0,
  width: "100%",
  height: "40%",
  label: " Transaction Log ",
  tags: true,
  border: { type: "line" },
  style: {
    fg: "white",
    bg: "black",
    border: { fg: "magenta" },
    label: { fg: "magenta" },
  },
  padding: { left: 1 },
  scrollable: true,
  alwaysScroll: true,
});

// Status bar
const statusBar = blessed.box({
  bottom: 0,
  left: 0,
  width: "100%",
  height: 3,
  content: "{center}Press Q to quit | R to run agent cycle{/center}",
  tags: true,
  style: {
    fg: "black",
    bg: "cyan",
  },
});

// Add all elements to screen
screen.append(titleBox);
screen.append(agentBox);
screen.append(marketBox);
screen.append(logBox);
screen.append(statusBar);

// Transaction log entries
let logEntries = [];

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  logEntries.push(`{gray-fg}[${timestamp}]{/gray-fg} ${message}`);
  if (logEntries.length > 50) logEntries.shift();
  logBox.setContent(logEntries.join("\n"));
  screen.render();
}

// Fetch SOL price
async function getSOLPrice() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { timeout: 5000 }
    );
    return response.data.solana.usd;
  } catch (err) {
    return null;
  }
}

// Update agent balances display
async function updateAgents() {
  try {
    const agents = listAgents();
    let content = "";

    for (const agent of agents) {
      const balance = await checkBalance(agent.publicKey);
      const shortKey = agent.publicKey.slice(0, 8) + "..." + agent.publicKey.slice(-8);

      let roleColor = "white";
      if (agent.name === "alpha") roleColor = "cyan";
      if (agent.name === "beta") roleColor = "yellow";
      if (agent.name === "gamma") roleColor = "green";

      content += `{${roleColor}-fg}{bold}${agent.name.toUpperCase()}{/bold}{/${roleColor}-fg}\n`;
      content += `  Address : ${shortKey}\n`;
      content += `  Balance : {bold}${balance.toFixed(6)} SOL{/bold}\n\n`;
    }

    agentBox.setContent(content);
    screen.render();
  } catch (err) {
    agentBox.setContent(`{red-fg}Error loading agents: ${err.message}{/red-fg}`);
    screen.render();
  }
}

// Update market data display
async function updateMarket() {
  const price = await getSOLPrice();
  const timestamp = new Date().toLocaleTimeString();

  let content = "";
  if (price) {
    const threshold = 50;
    const signal = price > threshold ? "{green-fg}DISTRIBUTE{/green-fg}" : "{yellow-fg}HOLD{/yellow-fg}";
    content += `{bold}SOL / USD{/bold}\n`;
    content += `  Price     : {bold}{cyan-fg}$${price.toFixed(2)}{/cyan-fg}{/bold}\n`;
    content += `  Threshold : $${threshold}.00\n`;
    content += `  Signal    : ${signal}\n\n`;
    content += `{gray-fg}Last updated: ${timestamp}{/gray-fg}`;
  } else {
    content = "{red-fg}Unable to fetch market data{/red-fg}";
  }

  marketBox.setContent(content);
  screen.render();
  return price;
}

// Run one agent cycle
async function runCycle() {
  addLog("{cyan-fg} Starting agent cycle...{/cyan-fg}");

  const agents = listAgents();
  const price = await getSOLPrice();

  if (!price) {
    addLog("{red-fg} No price data — cycle aborted{/red-fg}");
    return;
  }

  for (const agent of agents) {
    if (agent.name === "gamma") continue; // gamma is collector only

    const balance = await checkBalance(agent.publicKey);
    addLog(` ${agent.name} | Balance: ${balance.toFixed(4)} SOL | SOL: $${price.toFixed(2)}`);

    if (balance > 0.5 && price > 50) {
      const target = agent.name === "alpha" ? "beta" : "gamma";
      addLog(` ${agent.name} triggered — sending 0.05 SOL to ${target}`);

      try {
        const sig = await agentToAgentTransfer(agent.name, target, 0.05);
        const shortSig = sig.slice(0, 16) + "...";
        const explorerLink = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
        addLog(`{green-fg} Success! Sig: ${shortSig}{/green-fg}`);
        addLog(`{blue-fg} Explorer: ${explorerLink}{/blue-fg}`);
      } catch (err) {
        addLog(`{red-fg} Failed: ${err.message}{/red-fg}`);
      }
    } else {
      addLog(` ${agent.name} holding — conditions not met`);
    }
  }

  await updateAgents();
  addLog("{cyan-fg} Cycle complete{/cyan-fg}");
}

// Keyboard controls
screen.key(["q", "C-c"], () => process.exit(0));
screen.key(["r", "R"], async () => {
  addLog("{yellow-fg}Manual cycle triggered by user{/yellow-fg}");
  await runCycle();
});

// Auto refresh every 30 seconds
async function autoRefresh() {
  await updateAgents();
  await updateMarket();
  screen.render();
}

// Initial load
async function init() {
  addLog("{cyan-fg} Agentic Wallet Dashboard started{/cyan-fg}");
  addLog("Press {bold}R{/bold} to run an agent cycle manually");
  addLog("Press {bold}Q{/bold} to quit");

  await updateAgents();
  await updateMarket();

  setInterval(autoRefresh, 30000);

  screen.on("resize", () => {
    screen.render();
  });

  screen.render();
}

init().catch(console.error);