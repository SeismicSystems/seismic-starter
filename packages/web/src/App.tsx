import React from 'react'
import { PropsWithChildren } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ShieldedWalletProvider } from 'seismic-react'
import { sanvil, seismicTestnet } from 'seismic-react/rainbowkit'
import { Address, PublicClient, http, parseEther } from 'viem'
import { Config, WagmiProvider } from 'wagmi'
import { writeContract } from 'wagmi/actions'

import { AuthProvider } from '@/components/chain/WalletConnectButton'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'

const FAUCET_ADDRESS = '0xe7252ff3d80faf65844aee49a495a242bf1f7ad0' as const
const FAUCET_ABI = [
  {
    name: 'drip',
    type: 'function',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
const MIN_BALANCE = parseEther('0.5')

const CHAIN =
  import.meta.env.VITE_CHAIN_ID === 'sanvil' ? sanvil : seismicTestnet
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
                const balance = await publicClient.getBalance({ address })
                if (balance > MIN_BALANCE) return
                await writeContract(config, {
                  address: FAUCET_ADDRESS,
                  abi: FAUCET_ABI,
                  functionName: 'drip',
                  args: [address],
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
