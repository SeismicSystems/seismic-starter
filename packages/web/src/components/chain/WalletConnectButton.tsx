import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useConnectModal } from '@rainbow-me/rainbowkit'

// Create authentication context
type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  openConnectModal: () => void
  accountName?: string
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  openConnectModal: () => {},
})

export const useAuth = () => useContext(AuthContext)

// Wallet icon component using SVG for better quality
const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
  </svg>
)

const WalletButton: React.FC<
  React.PropsWithChildren<
    { onClick: () => void } & React.HTMLAttributes<HTMLButtonElement>
  >
> = ({ children, onClick, ...props }) => {
  return (
    <button onClick={onClick} className="" {...props}>
      {children}
    </button>
  )
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { openConnectModal } = useConnectModal() || {
    openConnectModal: () => {},
  }
  const { address, isConnecting, isConnected, isDisconnected } = useAccount()
  const [authState, setAuthState] = useState<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    openConnectModal: openConnectModal || (() => {}),
  })

  useEffect(() => {
    setAuthState({
      isAuthenticated: isConnected,
      isLoading: isConnecting,
      openConnectModal: openConnectModal || (() => {}),
      accountName: address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : undefined,
    })
  }, [isConnected, isConnecting, isDisconnected, address, openConnectModal])

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  )
}

const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        openConnectModal,
        chain,
        openAccountModal,
        openChainModal,
        mounted,
        authenticationStatus,
      }) => {
        if (!mounted || authenticationStatus === 'loading') {
          return <></>
        }
        if (!account || authenticationStatus === 'unauthenticated') {
          return (
            <WalletButton onClick={openConnectModal}>
              <span className="md:inline hidden">CONNECT WALLET</span>
              <span className="md:hidden">
                <WalletIcon />
              </span>
            </WalletButton>
          )
        }
        if (chain?.unsupported) {
          return (
            <WalletButton onClick={openChainModal}>
              <span className="md:inline hidden">Unsupported chain</span>
              <span className="md:hidden">
                <WalletIcon />
              </span>
            </WalletButton>
          )
        }
        return (
          <WalletButton onClick={openAccountModal}>
            <span className="">
              <WalletIcon />
            </span>
          </WalletButton>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default WalletConnectButton
