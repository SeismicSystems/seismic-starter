import React from 'react'
import { PropsWithChildren } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ShieldedWalletProvider } from 'seismic-react'
import { sanvil } from 'seismic-react/rainbowkit'
import { checkFaucet } from 'seismic-viem'
import { Address, PublicClient, http } from 'viem'
import { Config, WagmiProvider } from 'wagmi'

import { AuthProvider } from '@/components/chain/WalletConnectButton'
import { CHAIN_ID } from '@/hooks/useContract'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'

const FAUCET_URL = import.meta.env.VITE_FAUCET_URL
const CHAINS = [sanvil]

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
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ShieldedWalletProvider
            config={config}
            options={{
              publicTransport,
              publicChain,
              onAddressChange: async ({
                publicClient,
                address,
              }: {
                publicClient: PublicClient
                address: Address
              }) => {
                if (!FAUCET_URL) {
                  return
                }
                await checkFaucet({
                  address,
                  publicClient,
                  faucetUrl: FAUCET_URL,
                  minBalanceEther: 0.5,
                })
              },
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
