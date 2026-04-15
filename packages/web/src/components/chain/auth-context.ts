import { createContext, useContext } from 'react'

export type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  openConnectModal: () => void
  openWalletModal: () => void
  accountName?: string
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  openConnectModal: () => {},
  openWalletModal: () => {},
})

export const useAuth = () => useContext(AuthContext)
