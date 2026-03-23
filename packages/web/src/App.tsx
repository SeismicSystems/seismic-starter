import React from 'react'
import { PropsWithChildren, useCallback } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {
  type OnAddressChangeParams,
  ShieldedWalletProvider,
} from 'seismic-react'
import { sanvil, seismicTestnet } from 'seismic-react/rainbowkit'
import { http } from 'viem'
import { Config, WagmiProvider } from 'wagmi'

import { AuthProvider } from '@/components/chain/WalletConnectButton'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'

const configuredChainId = String(import.meta.env.VITE_CHAIN_ID ?? '')
const isSanvilConfig =
  configuredChainId === 'sanvil' || configuredChainId === String(sanvil.id)
const CHAIN = isSanvilConfig ? sanvil : seismicTestnet
const CHAINS = [CHAIN]

const config = getDefaultConfig({
  appName: 'Seismic Starter',
  projectId: 'd705c8eaf9e6f732e1ddb8350222cdac',
  // @ts-expect-error: this is fine
  chains: CHAINS,
  ssr: false,
})

const client = new QueryClient()

const Providers: React.FC<PropsWithChildren<{ config: Config }>> = ({
  config,
  children,
}) => {
  const publicChain = CHAINS[0]
  const publicTransport = http(publicChain.rpcUrls.default.http[0])
  const handleAddressChange = useCallback(
    async ({ publicClient, address }: OnAddressChangeParams) => {
      if (publicClient.chain.id !== sanvil.id) return

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
    },
    []
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ShieldedWalletProvider
            config={config}
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

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Providers config={config}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  )
}

export default App
