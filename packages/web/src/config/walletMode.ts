export type WalletProvider = 'walletconnect' | 'privy'

const rawWalletProvider = String(
  import.meta.env.VITE_WALLET_PROVIDER ?? 'walletconnect'
)
  .trim()
  .toLowerCase()

export const walletProvider: WalletProvider =
  rawWalletProvider === 'privy' ? 'privy' : 'walletconnect'

if (rawWalletProvider && rawWalletProvider !== walletProvider) {
  // Keep startup resilient when the env value is invalid.
  console.warn(
    `Unsupported VITE_WALLET_PROVIDER="${rawWalletProvider}". Falling back to "${walletProvider}".`
  )
}

export const isPrivyWalletProvider = walletProvider === 'privy'
