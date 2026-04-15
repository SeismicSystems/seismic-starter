import React, { useCallback, useMemo } from 'react'
import { useShieldedWallet } from 'seismic-react'
import { useAccount } from 'wagmi'

import {
  getEmbeddedConnectedWallet,
  useCreateWallet,
  usePrivy,
  useWallets,
} from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import { useAppContract } from '@/hooks/useContract'

import { AuthContext, AuthContextType } from './auth-context'

const NOOP = () => {}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const openConnectModal = useConnectModal()?.openConnectModal ?? NOOP
  const openWalletModal = openConnectModal
  const { address, isConnecting, isConnected } = useAccount()
  const { walletClient, publicClient } = useShieldedWallet()
  const { contract } = useAppContract()
  const isShieldedReady = Boolean(walletClient && publicClient && contract)
  const accountName = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined),
    [address]
  )

  const authState = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: Boolean(isConnected && isShieldedReady),
      isLoading: isConnecting,
      openConnectModal,
      openWalletModal,
      accountName,
    }),
    [
      isConnected,
      isConnecting,
      isShieldedReady,
      openConnectModal,
      openWalletModal,
      accountName,
    ]
  )

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  )
}

export const PrivyAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { address, isConnected } = useAccount()
  const { walletClient, publicClient } = useShieldedWallet()
  const { contract } = useAppContract()
  const privy = usePrivy()
  const { createWallet } = useCreateWallet()
  const { wallets } = useWallets()
  const { setActiveWallet } = useSetActiveWallet()
  const isShieldedReady = Boolean(walletClient && publicClient && contract)
  const embeddedWallet = useMemo(
    () => getEmbeddedConnectedWallet(wallets),
    [wallets]
  )

  const connectEmbeddedWallet = useCallback(() => {
    if (!embeddedWallet) return false
    void setActiveWallet(embeddedWallet)
    return true
  }, [embeddedWallet, setActiveWallet])

  const openConnectModal = useCallback(
    () => {
      if (!privy.ready) return
      if (!privy.authenticated) {
        privy.login({ loginMethods: ['twitter'] })
        return
      }
      if (connectEmbeddedWallet()) return
      void createWallet()
        .then(() => {
          connectEmbeddedWallet()
        })
        .catch(() => {
          connectEmbeddedWallet()
        })
    },
    [privy, createWallet, connectEmbeddedWallet]
  )

  const openWalletModal = useCallback(() => {
    if (!privy.ready || !privy.authenticated) {
      openConnectModal()
      return
    }
    if (!embeddedWallet) {
      openConnectModal()
      return
    }
    void privy.exportWallet({ address: embeddedWallet.address })
  }, [privy, embeddedWallet, openConnectModal])

  const accountName = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined),
    [address]
  )

  const authState = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: Boolean(
        privy.ready && privy.authenticated && isConnected && isShieldedReady
      ),
      isLoading: Boolean(!privy.ready),
      openConnectModal,
      openWalletModal,
      accountName,
    }),
    [
      privy.ready,
      privy.authenticated,
      isConnected,
      isShieldedReady,
      openConnectModal,
      openWalletModal,
      accountName,
    ]
  )

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  )
}
