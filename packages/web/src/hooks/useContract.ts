import { useShieldedContract } from 'seismic-react'

import * as contractJson from '@/abis/contracts/ClownBeatdown.json' with { type: 'json' }
import type { DeployedContract } from '@/types/contract'

export const useAppContract = () =>
  useShieldedContract(contractJson as DeployedContract)
