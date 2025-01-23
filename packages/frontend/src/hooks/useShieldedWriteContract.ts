
import { getSeismicClients, ShieldedPublicClient, type GetSeismicClientsParameters } from "seismic-viem";
import { useCallback, useEffect, useState } from 'react'
import { type Abi, type Chain, type Account, type Transport, type ContractFunctionName, ContractFunctionArgs, WriteContractParameters, parseAbi, custom, http, TransactionRequest, AbiFunction, getAbiItem, toFunctionSelector, encodeAbiParameters, Hex, hexToBytes, bytesToHex, Client } from 'viem'
import { KeyringSnapRpcClient } from '@metamask/keyring-snap-client';
import { 
  createShieldedWalletClient, 
  createShieldedPublicClient,
  type ShieldedWalletClient,
  shieldedWriteContract,
  seismicDevnet
} from 'seismic-viem'
import { useAccount, useConnectorClient } from "wagmi";
import { getConnectorClient, writeContract } from "wagmi/actions";
import { config } from "../wagmi";
import { formatAbiItem } from "viem/utils";
import { gcm } from '@noble/ciphers/webcrypto'
import { prepareTransactionRequest } from "viem/actions";
import { anvil } from "viem/chains";

const SNAP_ID = "npm:@metamask/snap-simple-keyring-snap"

const connectSnap = async (client: Client) => {
  const connectedSnaps: {[snapId: string]: { blocked: boolean, enabled: boolean } } = await client.request({
    method: "wallet_getSnaps"
  })
  console.log('connectedSnaps', JSON.stringify(connectedSnaps, null, 2))
  
  const keyringSnap = Object.entries(connectedSnaps).find(([snapId, snap]) => snapId === "npm:@metamask/snap-simple-keyring-snap")
  if (!keyringSnap) {
    const snaps = await client.request({
      method: "wallet_requestSnaps",
      params: {
        [SNAP_ID]: {}
      },
    })
    console.log('snaps', JSON.stringify(snaps, null, 2))
  } 
}

export const stringifyBigInt = (_: any, v: any) =>
  typeof v === 'bigint' ? v.toString() : v

const numberToNonce = (num: bigint | number): Uint8Array => {
  let value = BigInt(num)

  // Create a buffer for the full nonce (12 bytes)
  const nonceBuffer = new Uint8Array(12)
  // Write the u64 value in big-endian format to the first 8 bytes
  for (let i = 8 - 1; i >= 0; i--) {
    nonceBuffer[i] = Number(value & 0xffn)
    value = value >> 8n
  }

  // Last 4 bytes remain as zeros
  return nonceBuffer
}

const encrypt = async (
  keyHex: Hex,
  plaintext: Hex,
  nonce: number
): Promise<Hex> => {
  // Handle the nonce based on its type
  const nonceBuffer = new Uint8Array(numberToNonce(nonce))

  const key = hexToBytes(keyHex)
  const plaintextBytes = hexToBytes(plaintext)
  const ciphertextBytes = await gcm(key, nonceBuffer).encrypt(plaintextBytes)
  return bytesToHex(ciphertextBytes)
}

export type UseShieldedWriteContractConfig<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  TArgs extends ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>
> = {
  address: `0x${string}`
  abi: TAbi
  functionName: TFunctionName
  args?: TArgs
}

export function useShieldedWriteContract<
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>, 
  TArgs extends ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>
>({
  address,
  abi,
  functionName,
  args = [] as TArgs
}: UseShieldedWriteContractConfig<TAbi, TFunctionName, TArgs>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hash, setHash] = useState<`0x${string}` | null>(null)
  const extractedWalletClient = useConnectorClient()

  // Store the shielded client instances
  const [shieldedClients, setShieldedClients] = useState<{
    wallet: ShieldedWalletClient<Transport, Chain | undefined, Account> | null
    public: ShieldedPublicClient<Transport, Chain | undefined, undefined, undefined> | null
  }>({
    wallet: null,
    public: null  
  })

  const { address: walletAddress, isConnected, isConnecting } = useAccount();

  // Initialize shielded clients when a wallet is connected
  useEffect(() => {
    const initShieldedClients = async () => {
      try {
        
        const account = extractedWalletClient.data?.account
        if (!account) throw new Error('No account connected')
        // console.log('account', account)

        const transport = extractedWalletClient.data?.transport
        if (!transport) throw new Error('No transport connected')
        // console.log('transport', JSON.stringify(transport, null, 2))
        const chain = extractedWalletClient.data?.chain
        if (!chain) throw new Error('No chain connected')
        // console.log('chain', chain)

        const publicClient = await createShieldedPublicClient({
          transport: http(transport.url),
          // @ts-ignore
          chain
        })
        // console.log('publicClient get tee public key', await publicClient.getTeePublicKey())

        const walletClient = await createShieldedWalletClient({
          // @ts-ignore
          chain,
          transport: http(transport.url),
          // @ts-ignore
          account
        })

        setShieldedClients({
          wallet: walletClient,
          public: publicClient
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize shielded clients'))
      }
    }

    initShieldedClients()
  }, [extractedWalletClient.data])

  // The write function that executes the shielded contract write
  const write = useCallback(async () => {
    if (!isConnected) { throw new Error('Wallet not connected') }
    if (!walletAddress) { throw new Error('Wallet address not found') }
    // console.log('write', shieldedClients.wallet)
    if (!shieldedClients.wallet) {
      // console.log('shieldedClients.wallet', shieldedClients.wallet)
      throw new Error('Shielded wallet client not initialized, the wallet is: ' + shieldedClients.wallet);
    }

    setIsLoading(true);
    setError(null);

    const client = await getConnectorClient(config, {
      chainId: 31337,
      // connector,
    })

    // const isFlask = await client.request({ method: 'web3_clientVersion' })
    // console.log('isFlask', isFlask)


    // console.log(JSON.stringify({ abi: abi, functionName, args }, null, 2))
    // @ts-ignore
    const functionAbi = getAbiItem({ abi: abi, name: functionName }) as AbiFunction
    // console.log('functionAbi', JSON.stringify(functionAbi, null, 2))
    const selector = toFunctionSelector(formatAbiItem(functionAbi))
    // console.log('selector', selector)
    const encodedParams = encodeAbiParameters(functionAbi.inputs, args as readonly unknown[]).slice(2)
    // console.log('encodedParams', encodedParams)
    const plaintextCalldata = `${selector}${encodedParams}` as `0x${string}`
    // console.log('plaintextCalldata', plaintextCalldata)

    const aesKey = shieldedClients.wallet.getEncryption()

    // console.log(JSON.stringify({ client, walletAddress }, null, 2))
    // config.connectors

    const nonce = await shieldedClients.wallet.getTransactionCount({
      address: walletAddress,
    })

    console.log(JSON.stringify({ client }, null, 2))

    const seismicInput = await encrypt(aesKey, plaintextCalldata, nonce)
    const request = {
      to: address,
      data: seismicInput,
      gas: 30_000_000n,
      gasPrice: 2_121_033_093n,
      nonce: nonce!,
      chainId: 31337,
      account: walletAddress,
    }

    const { type, ...preparedTx } = await prepareTransactionRequest(shieldedClients.wallet, { ...request, type: 'legacy' })
    console.log('preparedTx', preparedTx)
    const toSign = { 
      // type: '0x4a',
      // encryptionPubkey: shieldedClients.wallet.getEncryptionPublicKey(),
      ...preparedTx,
      type: 'legacy',
     }

     const tx = await client.request({
      method: "eth_sendTransaction",
      params: [toSign]
     })
     console.log('tx', JSON.stringify(tx, null, 2))

    // const keyringClient = new KeyringSnapRpcClient(SNAP_ID, window.ethereum)
    // const accounts = await keyringClient.submitRequest({
    //   id: "bf74af86-3fb2-4e64-95eb-52422bbbfe34",
    //   request: {
    //     method: "eth_signTransaction",
    //     params: [toSign]
    //   },
    //   account: "29107aae-d491-4969-8538-a820afbedf13",
    //   scope: "eip155:31337"
    // })
    // console.log(accounts)

    // console.log('toSign', JSON.stringify(toSign, stringifyBigInt, 2))

    // else {
    //   console.log('keyringSnap', keyringSnap)
    // }
    // console.log('snaps', JSON.stringify(snaps, null, 2))
    // console.log('nonce', nonce)

    // const signedTx = await client.request({
    //   method: "wallet_invokeSnap",
    //   params: {
    //     snapId: SNAP_ID,
    //     method: "eth_signTransaction",
    //     params: [toSign]
    //   }
    // })
    // console.log('signedTx', signedTx)

    // const account = extractedWalletClient.data?.account
    // if (!account) throw new Error('No account connected')

    // console.log(JSON.stringify(account, null, 2))

    // const signedTx = await account.signTransaction(toSign)

    // const signedTx = await client.request({
    //   method: "eth_signTransaction",
    //   params: [toSign]
    // })
    // console.log('signedTx', signedTx)
    // try {
    //   const signedTx = await client.request({
    //     method: 'wallet_invokeSnap',
    //     params: {
    //       snapId: "npm:@metamask/snap-simple-keyring-snap",
    //       request: {
    //         method: 'signTransaction',
    //         params: [toSign],
    //       },
    //     },
    //   })
    //   // const signedTx = await client.request({
    //   //   method: 'eth_signTransaction',
    //   //   params: [toSign],
    //   // })
    //   console.log('signedTx', signedTx)
    // } catch (err) {
    //   console.error('Error signing transaction', err)
    // }
    // console.log('signedTx', signedTx)
    // const 
    // const request = {
    //     address,
    //     abi,
    //     functionName,
    //     ...(args && { args }),
    //     gas: 30_000_000,
    // } as TransactionRequest
    // return await client
    //   .request(
    //     {
    //       method: 'eth_signTransaction',
    //       params: [request],
    //     },
    //     { retryCount: 0 },
    //   )

    // try {
    //   const tx = await writeContract(config,
    //     // shieldedClients.wallet, 
    //     {
    //       address,
    //       abi,
    //       functionName,
    //       ...(args && { args })
    //     } as any
    //   );
    //   setHash(tx);
    //   return tx;
    // } catch (err) {
    //   const error = err instanceof Error ? err : new Error('Error executing shielded write');
    //   setError(error);
    //   throw error;
    // } finally {
    //   setIsLoading(false);
    // }
    setIsLoading(false);
  }, [
    shieldedClients.wallet,
    address,
    abi,
    functionName,
    args,
    walletAddress,
    isConnected,
  ]);

  return {
    write,
    isLoading,
    error,
    hash,
    shieldedClients
  }
}

// Usage example:
/*
const { write, isLoading, error, hash } = useShieldedWriteContract({
  address: '0x...',
  abi: myContractAbi,
  functionName: 'myFunction',
  args: [arg1, arg2]
})

try {
  const tx = await write()
  console.log('Transaction hash:', tx)
} catch (error) {
  console.error('Error:', error)
}
*/
