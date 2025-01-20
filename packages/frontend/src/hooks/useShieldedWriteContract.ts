import { getSeismicClients, ShieldedPublicClient, type GetSeismicClientsParameters } from "seismic-viem";

import { useCallback, useEffect, useState } from 'react'
import { type Abi, type Chain, type Account, type Transport, type ContractFunctionName, ContractFunctionArgs, WriteContractParameters, parseAbi, custom, http } from 'viem'
import { 
  createShieldedWalletClient, 
  createShieldedPublicClient,
  type ShieldedWalletClient,
  shieldedWriteContract,
  seismicDevnet
} from 'seismic-viem'
import { useAccount, useConnectorClient } from "wagmi";

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
  args
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

  // Initialize shielded clients when a wallet is connected
  useEffect(() => {
    const initShieldedClients = async () => {
      try {
        
        const account = extractedWalletClient.data?.account
        if (!account) throw new Error('No account connected')
        console.log('account', account)

        const transport = extractedWalletClient.data?.transport
        if (!transport) throw new Error('No transport connected')
        console.log('transport', JSON.stringify(transport, null, 2))
        const chain = extractedWalletClient.data?.chain
        if (!chain) throw new Error('No chain connected')
        console.log('chain', chain)

        const publicClient = await createShieldedPublicClient({
          transport: http(transport.url),
          chain
        })
        console.log('publicClient get tee public key', await publicClient.getTeePublicKey())

        const walletClient = await createShieldedWalletClient({
          chain,
          transport: http(transport.url),
          account
        })

        console.log('walletClient', walletClient)

        console.log('account is:', account)

        // Initialize the shielded public client
        

        console.log('publicClient get tee public key', await publicClient.getTeePublicKey())

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
    console.log('write', shieldedClients.wallet)
    if (!shieldedClients.wallet) {
      console.log('shieldedClients.wallet', shieldedClients.wallet)
      throw new Error('Shielded wallet client not initialized, the wallet is: ' + shieldedClients.wallet);
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const tx = await shieldedWriteContract(
        shieldedClients.wallet, 
        {
          address,
          abi,
          functionName,
          ...(args && { args })
        } as any
      );
      setHash(tx);
      return tx;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error executing shielded write');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [shieldedClients.wallet, address, abi, functionName, args]);

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
