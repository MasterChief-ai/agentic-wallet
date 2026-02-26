# SKILLS.md — Agentic Wallet Capability Manifest

This file describes the capabilities of this agentic wallet system for AI agents and automated systems that need to interact with or understand this project.

## Core Capabilities

### 1. Wallet Management
- **createAgentWallet(agentName)** — Generates a new Solana keypair, encrypts the secret key with AES-256, and saves it to disk
- **loadAgentWallet(agentName)** — Decrypts and loads an existing agent's keypair into memory for signing
- **listAgents()** — Returns all registered agents with their names and public keys
- **checkBalance(publicKey)** — Returns the current SOL balance of any Solana address

### 2. Transaction Execution
- **sendSOL(fromAgentName, toPublicKey, amountInSOL)** — Autonomously signs and sends a SOL transfer
- **agentToAgentTransfer(fromAgentName, toAgentName, amountInSOL)** — Transfers SOL between named agents

### 3. Market Data
- **getSOLPrice()** — Fetches live SOL/USD price from CoinGecko API
- Returns null gracefully if the API is unavailable

### 4. Decision Making
- **makeDecision(agentName, balance, solPrice)** — Evaluates market conditions and returns an action (distribute or hold)
- Considers both balance thresholds and price signals before acting

### 5. Autonomous Loop
- **startAgentLoop(intervalSeconds, maxCycles)** — Runs all agents on a timed cycle
- Each agent independently evaluates conditions and acts
- Agents run in parallel using Promise.all
 

## Agent Roles

| Role | Behavior |
|------|----------|
| distributor | Sends SOL when balance and price conditions are met |
| collector | Accumulates received SOL, never initiates transfers |


## Security Model

- Secret keys are never stored or transmitted in plain text
- AES-256 encryption with a master password protects all key files
- Master password is stored in environment variables, never in code
- Each agent has a fully isolated wallet with no shared state


## Network

- **Network:** Solana Devnet
- **RPC:** Configurable via RPC_URL environment variable
- **Explorer:** https://explorer.solana.com/?cluster=devnet


## File Structure

| File | Purpose |
|------|---------|
| agentWallet.js | Wallet creation, loading, encryption |
| transactions.js | Transaction building and signing |
| agentLoop.js | Autonomous timed decision loop |
| protocolAgent.js | Market data integration and decisions |
| dashboard.js | Real-time CLI visualization |


## Extending This System

To add a new agent:
1. Call `createAgentWallet("agentName")` 
2. Fund the wallet at https://faucet.solana.com
3. Add a strategy entry in `AGENT_STRATEGIES` inside `agentLoop.js`
4. The agent will automatically participate in the next loop cycle

To change decision logic:
- Edit the `makeDecision` function in `protocolAgent.js`
- Adjust `triggerIfBalanceAbove` thresholds in `agentLoop.js`