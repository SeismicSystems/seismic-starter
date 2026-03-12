const getBaseApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000'
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not set')
  }
  return baseUrl
}

export const BASE_API_URL = getBaseApiUrl()
