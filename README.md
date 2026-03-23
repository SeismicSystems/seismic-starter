<p align="center">
  <img src="assets/banner.png" alt="Clown Beatdown" width="400" />
</p>

# Clown Beatdown

### Overview

A Seismic starter project demonstrating **shielded smart contracts**. Players beat down a clown by calling `hit()` to reduce its stamina (starts at 3). Once the clown is knocked out, any contributor can call `rob()` to reveal a randomly selected shielded secret. Anyone can then call `reset()` to start a new round.

The contract uses Seismic's shielded types (`sbytes`, `suint256`) to keep secrets encrypted on-chain until they're revealed through gameplay.

### Project Structure

```
├── contracts/          # Solidity smart contracts (sforge)
├── packages/
│   ├── web/            # Frontend application
│   ├── cli/            # CLI client
│   └── processes/      # Local dev process orchestration
```

### Prerequisites

- [Bun](https://bun.sh/docs/installation)
- [seismic-foundry](https://docs.seismic.systems/onboarding/publish-your-docs) dev tools (`sforge`, `sanvil`)

### Getting Started

Install dependencies from the root directory:

```bash
bun install
```

Start local development (launches `sanvil`, deploys contracts, and starts the web app):

```bash
bun run dev:local
```

To reset all local state and start fresh:

```bash
bun run dev:local:reset
```

### Development Scripts

| Script            | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `dev:local`       | Full local dev environment                             |
| `dev:local:reset` | Full local dev environment with clean state            |
| `anvil:new`       | Start a fresh `sanvil` instance with state persistence |
| `anvil:state`     | Start `sanvil` loading existing state                  |
| `web:dev`         | Run the web frontend in dev mode                       |
| `web:build`       | Build the web frontend                                 |
| `contract:build`  | Compile contracts with `sforge`                        |
| `contract:deploy` | Deploy contracts to the configured network             |
| `contract:clean`  | Remove build artifacts                                 |

### Sub-packages

- **Contracts** — deployment and testing instructions: [`contracts/README.md`](contracts/README.md)
- **CLI** — command-line client: [`packages/cli/README.md`](packages/cli/README.md)
