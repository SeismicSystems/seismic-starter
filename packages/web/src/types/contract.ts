import type { Abi, Hex } from 'viem'

export type ContractInterface = {
  chainId: number
  abi: Abi
  methodIdentifiers: { [functionSignature: string]: Hex }
}

export type DeployedContract = ContractInterface & {
  address: Hex
}
