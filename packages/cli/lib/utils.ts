import fs from 'fs'
import { type ShieldedWalletClient, getShieldedContract } from 'seismic-viem'
import { Abi, Address } from 'viem'

async function getShieldedContractWithCheck(
  walletClient: ShieldedWalletClient,
  abi: Abi,
  address: Address
) {
  const contract = getShieldedContract({
    abi: abi,
    address: address,
    client: walletClient,
  })

  const code = await walletClient.getCode({
    address: address,
  })
  if (!code) {
    throw new Error('Please deploy contract before running this script.')
  }

  return contract
}

function readContractAddress(broadcastFile: string): `0x${string}` {
  const broadcast = JSON.parse(fs.readFileSync(broadcastFile, 'utf8'))
  if (!broadcast.transactions?.[0]?.contractAddress) {
    throw new Error('Invalid broadcast file format')
  }
  return broadcast.transactions[0].contractAddress
}

function readContractABI(abiFile: string): Abi {
  const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'))
  if (!abi.abi) {
    throw new Error('Invalid ABI file format')
  }
  return abi.abi
}

export { getShieldedContractWithCheck, readContractAddress, readContractABI }
