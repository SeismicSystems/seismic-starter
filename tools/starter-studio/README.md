# 🔒 Seismic Starter Studio & Shielded dApp Suite

An interactive development studio, **Shielded Blind Auction dApp**, and smart contract testing suite for the **Seismic Privacy EVM** (Chain ID: `5124`).

---

## 🌟 Key Features

- 🔐 **Shielded Blind Auction**: MEV-resistant auction using `suint256` encrypted bids with on-chain reveal in TEE enclaves.
- 📜 **sSolc Contract Boilerplates**: Ready-to-deploy Solidity templates for confidential vaults and MEV-protected DeFi.
- 🌐 **Interactive Web Studio**: Real-time encrypted bidding terminal, mempool watcher, and TEE evaluator on `http://localhost:3412`.
- ⌨️ **Universal CLI (`seismic-starter-cli`)**: Terminal utility for contracts inspection, bidding, and winner evaluation.

---

## 🚀 Quickstart

```bash
# Launch Starter Studio
npm start
# Open http://localhost:3412

# Or run via CLI
node bin/starter-cli.js contracts
node bin/starter-cli.js bid 5.5
node bin/starter-cli.js reveal
```
