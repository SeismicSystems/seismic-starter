import { getSeismicClients, ShieldedPublicClient, type GetSeismicClientsParameters } from "seismic-viem";

import { useCallback, useEffect, useState } from 'react'
import { type Abi, type Chain, type Account, type Transport, type ContractFunctionName, ContractFunctionArgs, WriteContractParameters, parseAbi } from 'viem'
import { 
  createShieldedWalletClient, 
  createShieldedPublicClient,
  type ShieldedWalletClient,
  shieldedWriteContract,
  seismicDevnet
} from 'seismic-viem'
import { useAccount, useConnectorClient } from "wagmi";

export type UseShieldedWriteContractConfig<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  TArgs extends ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>,
  chainOverride extends Chain | undefined = undefined
> = {
  address: `0x${string}`
  abi: TAbi
  functionName: TFunctionName
  chain?: TChain
  transport: TTransport
  args?: TArgs
  // Optional overrides for the transaction
  overrides?: chainOverride
}

export function useShieldedWriteContract<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account,
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>, 
  TArgs extends ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>,
  chainOverride extends Chain | undefined = undefined
>({
  address,
  abi,
  functionName,
  chain,
  transport,
  args,
  overrides
}: UseShieldedWriteContractConfig<TTransport, TChain, TAccount, TAbi, TFunctionName, TArgs, chainOverride>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hash, setHash] = useState<`0x${string}` | null>(null)
  const extractedWalletClient = useConnectorClient()

  // Store the shielded client instances
  const [shieldedClients, setShieldedClients] = useState<{
    wallet: ShieldedWalletClient<TTransport, TChain, TAccount> | null
    public: ShieldedPublicClient<TTransport, TChain, undefined, undefined> | null
  }>({
    wallet: null,
    public: null  
  })

  // Initialize shielded clients when a wallet is connected
  useEffect(() => {
    const initShieldedClients = async () => {
      try {
        const account = extractedWalletClient.data?.account
        if (!account) throw new Error('No account connected')

        const walletClient = await createShieldedWalletClient({
          chain,
          transport,
          account
        })

        // Initialize the shielded public client
        const publicClient = await createShieldedPublicClient({
          transport,
          chain
        })

        setShieldedClients({
          wallet: walletClient as ShieldedWalletClient<TTransport, TChain, TAccount>,
          public: publicClient
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize shielded clients'))
      }
    }

    initShieldedClients()
  }, [chain, transport])

  // The write function that executes the shielded contract write
  const write = useCallback(async () => {
    if (!shieldedClients.wallet) {
      throw new Error('Shielded wallet client not initialized')
    }

    setIsLoading(true)
    setError(null)
    try {
      const tx = await shieldedWriteContract(shieldedClients.wallet, {
        address,
        abi,
        functionName,
        args: args || [],
        ...overrides
      })
      setHash(tx)
      return tx
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error executing shielded write')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [
    shieldedClients.wallet,
    address,
    abi,
    functionName,
    args,
    overrides,
    chain
  ])

  // Function to simulate the transaction before executing
  const simulate = useCallback(async () => {
    if (!shieldedClients.public) {
      throw new Error('Shielded public client not initialized')
    }

    try {
      // Simulate the transaction using the wallet client
      const result = await shieldedClients.wallet.simulateContract({
        address,
        abi,
        functionName,
        args: args || [],
        ...overrides
      })
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error simulating transaction')
      throw error
    }
  }, [
    shieldedClients.public,
    address,
    abi,
    functionName,
    args,
    overrides
  ])

  return {
    write,
    simulate,
    isLoading,
    error,
    hash,
    shieldedClients
  }
}

// Usage example:
/*
const { write, simulate, isLoading, error, hash } = useShieldedWriteContract({
  address: '0x...',
  abi: myContractAbi,
  functionName: 'myFunction',
  args: [arg1, arg2],
  overrides: {
    gas: 100000n
  }
})

// Simulate first
try {
  await simulate()
  // If simulation succeeds, execute the write
  const tx = await write()
  console.log('Transaction hash:', tx)
} catch (error) {
  console.error('Error:', error)
}
*/


// const a = getSeismicClients({
//   account: {
//     address: '0x0000000000000000000000000000000000000000',
//     privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
//   },
// });
