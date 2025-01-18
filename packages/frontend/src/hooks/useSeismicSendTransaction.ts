import { getSeismicClients, type GetSeismicClientsParameters } from "seismic-viem";

import { useCallback, useEffect, useState } from 'react'
import { 
  type Abi,
  type Chain,
  type Transport,
  type Account 
} from 'viem'
import { 
  createShieldedWalletClient, 
  createShieldedPublicClient,
  type ShieldedWalletClient,
  shieldedWriteContract,
  seismicDevnet
} from 'seismic-viem'

export type UseShieldedWriteContractConfig<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChain extends Chain
> = {
  address: `0x${string}`
  abi: TAbi
  functionName: TFunctionName
  chain?: TChain
  args?: readonly unknown[]
  // Optional overrides for the transaction
  overrides?: {
    gas?: bigint
    maxFeePerGas?: bigint
    maxPriorityFeePerGas?: bigint
  }
}

export function useShieldedWriteContract<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChain extends Chain = typeof seismicDevnet,
  TAccount extends Account = Account
>({
  address,
  abi,
  functionName,
  chain = seismicDevnet as TChain,
  args,
  overrides
}: UseShieldedWriteContractConfig<TAbi, TFunctionName, TChain>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hash, setHash] = useState<`0x${string}` | null>(null)

  // Store the shielded client instances
  const [shieldedClients, setShieldedClients] = useState<{
    wallet: ShieldedWalletClient<Transport, TChain, TAccount> | null
    public: ReturnType<typeof createShieldedPublicClient> | null
  }>({
    wallet: null,
    public: null
  })

  // Initialize shielded clients when a wallet is connected
  useEffect(() => {
    const initShieldedClients = async () => {
      try {
        // Initialize the shielded wallet client
        const walletClient = await createShieldedWalletClient({
          chain,
          transport: window.ethereum, // Using injected provider
        })

        // Initialize the shielded public client
        const publicClient = createShieldedPublicClient({
          chain,
          transport: window.ethereum,
        })

        setShieldedClients({
          wallet: walletClient as ShieldedWalletClient<Transport, TChain, TAccount>,
          public: publicClient
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize shielded clients'))
      }
    }

    if (window.ethereum) {
      initShieldedClients()
    }
  }, [chain])

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
    overrides
  ])

  // Function to simulate the transaction before executing
  const simulate = useCallback(async () => {
    if (!shieldedClients.public) {
      throw new Error('Shielded public client not initialized')
    }

    try {
      // Simulate the transaction using the public client
      const result = await shieldedClients.public.simulateContract({
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
