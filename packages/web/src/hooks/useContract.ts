// WEB3 REMOVED FOR UI DEVELOPMENT — restore from git when done

const parseChainId = (): number => {
  const chainId = import.meta.env.VITE_CHAIN_ID || 31337
  if (!chainId) {
    throw new Error('CHAIN_ID is not set')
  }
  return parseInt(chainId)
}

export const CHAIN_ID = parseChainId()

export const useAppContract = () => ({ contract: null })
