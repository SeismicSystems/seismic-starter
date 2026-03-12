import { useCallback } from 'react'
import type { Hex } from 'viem'

// WEB3 REMOVED FOR UI DEVELOPMENT — restore from git when done
// Mock contract client that simulates game interactions locally

let mockStamina = 3

const fakeTxHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const useContractClient = () => {
  const clownStamina = useCallback(async (): Promise<bigint> => {
    await delay(100)
    return BigInt(mockStamina)
  }, [])

  const look = useCallback(async (): Promise<bigint> => {
    await delay(200)
    return BigInt(Math.floor(Math.random() * 1000))
  }, [])

  const revealChaos = useCallback(async (): Promise<bigint> => {
    await delay(200)
    return BigInt(42)
  }, [])

  const hit = useCallback(async (): Promise<Hex> => {
    await delay(300)
    mockStamina = Math.max(0, mockStamina - 1)
    return fakeTxHash
  }, [])

  const shake = useCallback(async (_numShakes: bigint): Promise<Hex> => {
    await delay(300)
    return fakeTxHash
  }, [])

  const taunt = useCallback(async (_numTaunts: bigint): Promise<Hex> => {
    await delay(300)
    return fakeTxHash
  }, [])

  const reset = useCallback(async (): Promise<Hex> => {
    await delay(300)
    mockStamina = 3
    return fakeTxHash
  }, [])

  const txUrl = useCallback((_txHash: Hex): string | null => {
    return null
  }, [])

  const addressUrl = useCallback((_address: Hex): string | null => {
    return null
  }, [])

  const waitForTransaction = useCallback(async (_hash: Hex) => {
    await delay(200)
    return { status: 'success' as const }
  }, [])

  return {
    loaded: true,
    walletClient: null,
    publicClient: null,
    walletAddress: () => '0x0000000000000000000000000000000000000000' as Hex,
    appContract: () => null,
    pubClient: () => null,
    wallet: () => null,
    clownStamina,
    look,
    revealChaos,
    hit,
    shake,
    taunt,
    reset,
    txUrl,
    addressUrl,
    waitForTransaction,
  }
}
