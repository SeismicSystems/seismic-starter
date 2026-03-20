import { useCallback, useEffect, useState } from 'react'
import { useShieldedWallet } from 'seismic-react'
import {
  ShieldedPublicClient,
  ShieldedWalletClient,
  addressExplorerUrl,
  txExplorerUrl,
} from 'seismic-viem'
import { type Hex, hexToString } from 'viem'

import { useAppContract } from './useContract'

export const useContractClient = () => {
  const [loaded, setLoaded] = useState(false)
  const { walletClient, publicClient } = useShieldedWallet()
  const { contract } = useAppContract()

  useEffect(() => {
    if (walletClient && publicClient && contract) {
      setLoaded(true)
    } else {
      setLoaded(false)
    }
  }, [walletClient, publicClient, contract])

  const wallet = useCallback((): ShieldedWalletClient => {
    if (!walletClient) {
      throw new Error('Wallet client not found')
    }
    return walletClient
  }, [walletClient])

  const pubClient = useCallback((): ShieldedPublicClient => {
    if (!publicClient) {
      throw new Error('Public client not found')
    }
    return publicClient
  }, [publicClient])

  const walletAddress = useCallback((): Hex => {
    return wallet().account.address
  }, [wallet])

  const appContract = useCallback((): ReturnType<
    typeof useAppContract
  >['contract'] => {
    if (!contract) {
      throw new Error('Contract not found')
    }
    return contract
  }, [contract])

  /*
    function getClownStamina() external view returns (uint256);
    function rob() external view returns (bytes32);
    function hit() external;
    function reset() external;
  */

  const clownStamina = useCallback(async (): Promise<bigint> => {
    return appContract().tread.getClownStamina()
  }, [appContract])

  const rob = useCallback(async (): Promise<string> => {
    const result = (await appContract().read.rob()) as Hex
    return hexToString(result)
  }, [appContract])

  const hit = useCallback(async (): Promise<Hex> => {
    return appContract().twrite.hit()
  }, [appContract])

  const reset = useCallback(async (): Promise<Hex> => {
    return appContract().twrite.reset()
  }, [appContract])

  const txUrl = useCallback(
    (txHash: Hex): string | null => {
      return txExplorerUrl({ chain: pubClient().chain, txHash })
    },
    [pubClient]
  )

  const addressUrl = useCallback(
    (address: Hex): string | null => {
      return addressExplorerUrl({ chain: pubClient().chain, address })
    },
    [pubClient]
  )

  const waitForTransaction = useCallback(
    async (hash: Hex) => {
      return await pubClient().waitForTransactionReceipt({ hash })
    },
    [pubClient]
  )

  return {
    loaded,
    walletClient,
    publicClient,
    walletAddress,
    appContract,
    pubClient,
    wallet,
    clownStamina,
    rob,
    hit,
    reset,
    txUrl,
    addressUrl,
    waitForTransaction,
  }
}
