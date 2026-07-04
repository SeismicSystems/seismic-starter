# Local deployment instructions

1. Open up a new terminal and start `sanvil`.

```bash
sanvil
```

2. Set the environment variables. You can copy our example `.env` file to start.

```bash
cd contracts/
cp .env.example .env
```

3. Ensure contract tests are passing. From this directory, run

```bash
sforge build
sforge test
```

4. Deploy the contract.

```bash
source .env
PRIVKEY="$PRIVKEY" sforge script script/ClownBeatdown.s.sol:ClownBeatdownScript \
      --rpc-url $RPC_URL \
      --broadcast \
      --skip-simulation
```

Note: the `PRIVKEY="$PRIVKEY"` prefix is required because `source .env` sets
shell variables without exporting them, so `vm.envUint("PRIVKEY")` in the
deploy script would not see the key otherwise. `--skip-simulation` matches
the root `contract:deploy` script and avoids known local Foundry simulation
panics (see the Troubleshooting section in the root README).
