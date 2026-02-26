#  Agentic Wallet — Autonomous AI Agent Wallets on Solana

A fully working prototype of autonomous AI agent wallets on Solana devnet. Each agent independently manages its own wallet, monitors market conditions, makes decisions, and executes transactions — all without human intervention.

Built for the Solana AI Agent Wallet Bounty.

##  Demo

> Agents autonomously monitor SOL price via CoinGecko, make distribution decisions, and execute real on-chain transactions on Solana devnet.

[Dashboard Preview](jikolll.PNG)

##  Architecture
```
agentic-wallet/
├── agentWallet.js      # Core wallet module — create, load, encrypt keys
├── transactions.js     # Transaction signing and execution
├── agentLoop.js        # Autonomous decision-making loop
├── protocolAgent.js    # Live market data integration + agent decisions
├── dashboard.js        # Real-time CLI dashboard
├── fundAgents.js       # Utility to fund agent wallets via airdrop
├── checkBalances.js    # Utility to check all agent balances
├── agents/             # Encrypted agent wallet files (gitignored)
├── .env                # Environment variables (gitignored)
└── SKILLS.md           # Agent-readable capability manifest
```

##  Features

- **Programmatic wallet creation** — agents generate and own their own keypairs
- **Encrypted key storage** — secret keys encrypted with AES-256 before saving to disk
- **Autonomous transaction signing** — no human approval required
- **Multi-agent system** — multiple agents running independently in parallel
- **Market-aware decisions** — agents query live SOL price from CoinGecko and act accordingly
- **Real devnet transactions** — every action produces a verifiable on-chain signature
- **CLI dashboard** — real-time visualization of agent activity, balances, and market data


##  Security Design

- Secret keys are never stored in plain text
- AES-256 encryption via `crypto-js` with a master password
- Master password stored in `.env` which is gitignored
- Wallet files stored in `agents/` directory which is gitignored
- Each agent has an isolated wallet — no shared keys


##  Getting Started

### Prerequisites

- Node.js v18 or higher
- Solana CLI
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/MasterChief-ai/agentic-wallet.git
cd agentic-wallet

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and set your ENCRYPTION_PASSWORD and RPC_URL
```

### Environment Variables

Create a `.env` file in the root directory:
```
ENCRYPTION_PASSWORD=your_strong_master_password
RPC_URL=https://api.devnet.solana.com
```

### Create Agent Wallets
```bash
node test.js
```

### Fund Agents

Visit https://faucet.solana.com and fund each agent's public key with devnet SOL.

### Check Balances
```bash
node checkBalances.js
```

### Run Autonomous Agent Loop
```bash
node agentLoop.js
```

### Run Protocol Agent (market-aware)
```bash
node protocolAgent.js
```

### Launch Dashboard
```bash
node dashboard.js
```

Press **R** to trigger a manual agent cycle. Press **Q** to quit.


##  Agent Roles

| Agent | Role | Strategy |
|-------|------|----------|
| Alpha | Distributor | Sends SOL to Beta when balance > threshold |
| Beta | Distributor | Sends SOL to Gamma when balance > threshold |
| Gamma | Collector | Accumulates SOL, never sends |


## 🔗 Verified Devnet Transactions

All transactions are verifiable on Solana Explorer:

- [View on Solana Explorer](https://explorer.solana.com/tx/?cluster=devnet)


##  Dependencies

| Package | Purpose |
|---------|---------|
| @solana/web3.js | Solana blockchain interaction |
| crypto-js | AES-256 key encryption |
| dotenv | Environment variable management |
| axios | HTTP requests for market data |
| blessed | Terminal UI dashboard |


##  How It Works

1. Each agent generates a unique keypair on creation
2. The secret key is AES-256 encrypted and saved to disk
3. On each cycle, the agent loads its keypair by decrypting the saved key
4. The agent queries CoinGecko for the current SOL price
5. Based on price and balance conditions, the agent decides to distribute or hold
6. If distributing, the agent autonomously signs and broadcasts a transaction
7. The transaction is confirmed on Solana devnet and logged with a signature


##  License

MIT
```

Save that. Then create `.env.example`:
```
ENCRYPTION_PASSWORD=your_strong_master_password_here
RPC_URL=https://api.devnet.solana.com