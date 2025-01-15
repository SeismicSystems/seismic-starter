import dotenv from "dotenv";
import { join } from "path";

import { createShieldedWalletClient, getShieldedContract, seismicDevnet } from "seismic-viem";
import { anvil } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { App } from "./app";
import { CONTRACT_NAME, CONTRACT_DIR } from "../lib/constants";
import { readContractAddress, readContractABI } from "../lib/utils";
import { http } from "viem";

dotenv.config();

async function main() {
    if (!process.env.CHAIN_ID || !process.env.RPC_URL || !process.env.PRIVKEY) {
        console.error("Please set your environment variables.");
        process.exit(1);
    }

    const broadcastFile = join(
        CONTRACT_DIR,
        "broadcast",
        `${CONTRACT_NAME}.s.sol`,
        process.env.CHAIN_ID,
        "run-latest.json",
    );
    const abiFile = join(
        CONTRACT_DIR,
        "out",
        `${CONTRACT_NAME}.sol`,
        `${CONTRACT_NAME}.json`,
    );

    // const walletClient = await createShieldedWalletClient({
    //     chain: anvil,
    //     transport: http(process.env.RPC_URL),
    //     account: privateKeyToAccount(process.env.PRIVKEY as `0x${string}`),
    // });
    // const contract = getShieldedContract({
    //     abi: readContractABI(abiFile),
    //     address: readContractAddress(broadcastFile),
    //     client: walletClient,
    // });

    // await contract.write.reset();

    const anvilId = anvil.id.toString();
    const chain = process.env.CHAIN_ID === anvilId ? anvil : seismicDevnet;

    const app = new App({
        wallet: {
            chain,
            rpcUrl: process.env.RPC_URL,
            privateKey: process.env.PRIVKEY,
        },
        contract: {
            abi: readContractABI(abiFile),
            address: readContractAddress(broadcastFile),
        },
    });
    await app.init();

    await app.reset();
    await app.shake();
    await app.shake();
    await app.hit();
    await app.shake();
    await app.hit();
    await app.look();
}

main();
