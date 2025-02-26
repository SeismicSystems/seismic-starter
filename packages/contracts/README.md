# Local deployment instructions

1. Open up a new terminal and start `sanvil`.

```bash
sanvil
```

2. Set the environment variables. You can copy our example `.env` file to start.

```bash
cd packages/contracts/
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
sforge script script/Walnut.s.sol:WalnutScript \
      --rpc-url $RPC_URL \
      --broadcast
```
