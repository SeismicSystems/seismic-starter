# Seismic Starter: Clown Beatdown

This repository is a starter app for building with Seismic shielded smart contracts.

It gives you a complete end-to-end baseline:
- a shielded Solidity contract (`contracts/`)
- deployment + ABI sync tooling (`sforge` + Bun scripts)
- a wallet-connected web app using `seismic-react` (`packages/web`)

If you are onboarding to the Seismic ecosystem, this project is designed to show the full developer loop quickly.

## What This Starter Teaches

`ClownBeatdown` demonstrates:
- shielded storage types (`sbytes`, `suint256`)
- gameplay-driven reveal flows (`hit`, `rob`, `reset`)
- local chain development with `sanvil`
- frontend contract interaction with `seismic-react` / `seismic-viem`

Gameplay summary:
- `hit()` reduces stamina
- once stamina is `0`, contributors can `rob()` and reveal a secret
- `reset()` starts the next round

## Monorepo Layout

```text
contracts/            # Solidity source, scripts, artifacts, broadcast logs
packages/web/         # React + Vite frontend
packages/cli/         # CLI sample client
packages/processes/   # Process orchestration for local dev startup
```

## Prerequisites

- [Bun](https://bun.sh/docs/installation)
- Seismic Foundry toolchain (`sforge`, `sanvil`, `ssolc`)
  - Install via Seismic docs: [seismic-foundry onboarding](https://docs.seismic.systems/onboarding/publish-your-docs)

## Quickstart (Local, Recommended)

1. Install dependencies:

```bash
bun install
```

2. Create `.env.local-anvil` at repo root:

```bash
cat > .env.local-anvil <<'EOF'
# frontend
VITE_CHAIN_ID=31337
VITE_FAUCET_URL=https://faucet-2.seismicdev.net/

# chain
RPC_URL=http://127.0.0.1:8545
VITE_RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
EOF
```

3. Start a clean local stack:

```bash
bun run dev:local:reset
```

This command:
- copies `.env.local-anvil` -> `.env`
- starts `sanvil` with local persisted state
- compiles + deploys `ClownBeatdown`
- updates ABI/address artifacts
- starts the Vite app

4. Open the app:

```text
http://localhost:5173
```

5. Connect MetaMask on chain `31337`.

## Network and Wallet Notes

- The app is configured for local `sanvil` when `VITE_CHAIN_ID=31337` (or `sanvil`).
- On local Anvil, the app auto-funds the shielded wallet address to avoid insufficient-funds errors during onboarding.
- If MetaMask and app balances differ, reconnect wallet after startup and ensure chain is `31337`.

## Core Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev:local` | Start local stack using existing Anvil state |
| `bun run dev:local:reset` | Start local stack with reset state + redeploy |
| `bun run anvil:new` | Start fresh `sanvil` state |
| `bun run anvil:state` | Start `sanvil` using persisted state |
| `bun run contract:build` | Compile contracts |
| `bun run contract:deploy` | Deploy and refresh contract addresses |
| `bun run web:dev` | Run frontend in dev mode |
| `bun run web:build` | Build frontend |

## Build/Deploy Flow (What Happens Internally)

`contract:deploy` runs:
1. `contract:dev` (build + ABI generation)
2. `sforge script ... --broadcast --skip-simulation`
3. `contract:addresses` to write deployed address into ABI artifacts

The frontend consumes those artifacts from:
- `contracts/abis/$VITE_CHAIN_ID/...`
- copied into `packages/web/src/abis/...`

## Troubleshooting

### App loads but actions fail
- verify MetaMask chain is `31337`
- rerun `bun run dev:local:reset`
- hard refresh browser
- reconnect wallet

### `getClownStamina` returns no data / address is not a contract
- contract artifacts and chain are out of sync
- rerun `bun run contract:deploy`
- then rerun `bun run web:dev`

### Deploy script crashes in Foundry simulation
- this starter already uses `--skip-simulation` in `contract:deploy` to avoid common local Foundry panic paths

## Where to Go Next

- Modify `contracts/src/ClownBeatdown.sol` and add your own game mechanics
- Update `contracts/script/ClownBeatdown.s.sol` deployment seed data
- Extend UI actions in `packages/web/src/hooks/useGameActions.ts`
- Add contract tests in `contracts/test/`

## Additional Package Docs

- Contracts: [`contracts/README.md`](contracts/README.md)
- CLI sample: [`packages/cli/README.md`](packages/cli/README.md)
