import {
  type ShieldedContract,
  type ShieldedWalletClient,
  createShieldedWalletClient,
  getShieldedContract,
  signedReadContract,
} from 'seismic-viem'
import { Abi, Address, Chain, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { getShieldedContractWithCheck } from '../lib/utils'

interface AppConfig {
  players: Array<{
    name: string
    privateKey: string
  }>
  wallet: {
    chain: Chain
    rpcUrl: string
  }
  contract: {
    abi: Abi
    address: Address
  }
}

export class App {
  private config: AppConfig
  private playerClients: Map<string, ShieldedWalletClient> = new Map()
  private playerContracts: Map<string, ShieldedContract> = new Map()

  constructor(config: AppConfig) {
    this.config = config
  }

  async init() {
    for (const player of this.config.players) {
      const walletClient = await createShieldedWalletClient({
        chain: this.config.wallet.chain,
        transport: http(this.config.wallet.rpcUrl),
        account: privateKeyToAccount(player.privateKey as `0x${string}`),
      })
      this.playerClients.set(player.name, walletClient)

      const contract = await getShieldedContractWithCheck(
        walletClient,
        this.config.contract.abi,
        this.config.contract.address
      )
      this.playerContracts.set(player.name, contract)
    }
    // console.log('playerContracts', this.playerContracts)
  }

  private getWalletClient(playerName: string): ShieldedWalletClient {
    const client = this.playerClients.get(playerName)
    if (!client) {
      throw new Error(`Wallet client for player ${playerName} not found`)
    }
    return client
  }

  private getPlayerContract(playerName: string): ShieldedContract {
    const contract = this.playerContracts.get(playerName)
    if (!contract) {
      throw new Error(`Shielded contract for player ${playerName} not found`)
    }
    return contract
  }

  async reset(playerName: string) {
    console.log(`- Player ${playerName} writing reset()`)
    const contract = this.getPlayerContract(playerName)
    const walletClient = this.getWalletClient(playerName)
    await contract.write.reset([])
  }

  async shake(playerName: string, numShakes: number) {
    console.log(`- Player ${playerName} writing shake()`)
    const contract = this.getPlayerContract(playerName)
    const walletClient = this.getWalletClient(playerName)
    await contract.write.shake([numShakes])
  }

  async hit(playerName: string) {
    console.log(`- Player ${playerName} writing hit()`)
    const contract = this.getPlayerContract(playerName)
    const walletClient = this.getWalletClient(playerName)
    await contract.write.hit([])
  }

  async look(playerName: string) {
    console.log(`- Player ${playerName} reading look()`)
    const contract = this.getPlayerContract(playerName)
    // console.log('contract', contract)
    const result = await contract.read.look()
    console.log(`- Player ${playerName} sees number:`, result)
  }
}
