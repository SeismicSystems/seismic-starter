import React from 'react'
import { PropsWithChildren, useCallback } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ShieldedWalletProvider } from 'seismic-react'
import { sanvil, seismicTestnet } from 'seismic-react/rainbowkit'
import { type ShieldedPublicClient } from 'seismic-viem'
import type { Hex } from 'viem'
import { http as viemHttp } from 'viem'
import { WagmiProvider, http as wagmiHttp } from 'wagmi'

import {
  AuthProvider,
  PrivyAuthProvider,
} from '@/components/chain/AuthProviders'
import { isPrivyWalletProvider } from '@/config/walletMode'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { PrivyProvider } from '@privy-io/react-auth'
import {
  WagmiProvider as PrivyWagmiProvider,
  createConfig as createPrivyConfig,
} from '@privy-io/wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'

type OnAddressChangeParams = {
  publicClient: ShieldedPublicClient
  address: Hex
}

const configuredChainId = String(import.meta.env.VITE_CHAIN_ID ?? '')
const configuredRpcUrl = String(import.meta.env.VITE_RPC_URL ?? '').trim()
const isSanvilConfig =
  configuredChainId === 'sanvil' || configuredChainId === String(sanvil.id)
const baseChain = isSanvilConfig ? sanvil : seismicTestnet
const CHAIN = configuredRpcUrl
  ? {
      ...baseChain,
      rpcUrls: {
        ...baseChain.rpcUrls,
        default: { ...baseChain.rpcUrls.default, http: [configuredRpcUrl] },
        public: { ...baseChain.rpcUrls.public, http: [configuredRpcUrl] },
      },
    }
  : baseChain
const CHAINS = [CHAIN]
const publicChain = CHAINS[0]
const publicRpcUrl = publicChain.rpcUrls.default.http[0]
const publicTransport = viemHttp(publicRpcUrl)
const privyAppId = String(import.meta.env.VITE_PRIVY_APP_ID ?? '').trim()

const walletConnectConfig = getDefaultConfig({
  appName: 'Seismic Starter',
  projectId: 'd705c8eaf9e6f732e1ddb8350222cdac',
  // @ts-expect-error: this is fine
  chains: CHAINS,
  ssr: false,
})

const privyConfig = createPrivyConfig({
  // @ts-expect-error: this is fine
  chains: CHAINS,
  transports: {
    [CHAIN.id]: wagmiHttp(publicRpcUrl),
  },
})

const client = new QueryClient()

if (isPrivyWalletProvider && !privyAppId) {
  throw new Error(
    'VITE_PRIVY_APP_ID is required when VITE_WALLET_PROVIDER=privy'
  )
}

const useSanvilAutoFund = () =>
  useCallback(async ({ publicClient, address }: OnAddressChangeParams) => {
    if (publicClient.chain?.id !== sanvil.id) return

    const existingBalance = await publicClient.getBalance({ address })
    if (existingBalance > 0n) return

    const setBalance = publicClient.request as unknown as (args: {
      method: string
      params?: unknown[]
    }) => Promise<unknown>

    await setBalance({
      method: 'anvil_setBalance',
      params: [address, `0x${(10_000n * 10n ** 18n).toString(16)}`],
    })
  }, [])

const WalletConnectProviders: React.FC<PropsWithChildren> = ({ children }) => {
  const handleAddressChange = useSanvilAutoFund()

  return (
    <WagmiProvider config={walletConnectConfig}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ShieldedWalletProvider
            config={walletConnectConfig}
            options={{
              publicTransport,
              publicChain,
              onAddressChange: handleAddressChange,
            }}
          >
            <AuthProvider>{children}</AuthProvider>
          </ShieldedWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

const PrivyProviders: React.FC<PropsWithChildren> = ({ children }) => {
  const handleAddressChange = useSanvilAutoFund()

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Keep Privy chain selection aligned with app chain.
        defaultChain: CHAIN,
        supportedChains: CHAINS,
        loginMethods: ['twitter'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <QueryClientProvider client={client}>
        <PrivyWagmiProvider config={privyConfig}>
          <ShieldedWalletProvider
            config={privyConfig}
            options={{
              publicTransport,
              publicChain,
              onAddressChange: handleAddressChange,
            }}
          >
            <PrivyAuthProvider>{children}</PrivyAuthProvider>
          </ShieldedWalletProvider>
        </PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  if (isPrivyWalletProvider) {
    return <PrivyProviders>{children}</PrivyProviders>
  }

  return <WalletConnectProviders>{children}</WalletConnectProviders>
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  )
}

export default App
