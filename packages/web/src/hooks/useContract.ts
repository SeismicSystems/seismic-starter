import { useShieldedContract } from 'seismic-react'

import * as contractJson from '@/abis/contracts/ClownBeatdown.json' with { type: 'json' }
import type { DeployedContract } from '@/types/contract'

const parseChainId = (): number => {
  const chainId = import.meta.env.VITE_CHAIN_ID || 31337
  if (!chainId) {
    throw new Error('CHAIN_ID is not set')
  }
  return parseInt(chainId)
}

export const CHAIN_ID = parseChainId()

export const useAppContract = () =>
  useShieldedContract(contractJson as DeployedContract)
