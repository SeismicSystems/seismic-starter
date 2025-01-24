import { getDefaultConfig , Chain } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  anvil,
} from 'wagmi/chains';
import { createShieldedPublicClient } from 'seismic-viem';
import { useSendTransaction } from 'wagmi';
import { formatTransactionRequest } from 'viem';

const seismicDevnet = {
  id: 31337,
  name: 'Seismic',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  iconUrl: 'https://seismic-public-assets.s3.us-east-1.amazonaws.com/seismic-logo-light.png',
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'SeismicScan', url: 'http://127.0.0.1:8545' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
  formatters: {
    transactionRequest: {
      format: (request) => {
        const fmtReq = formatTransactionRequest(request)
        console.log(JSON.stringify(fmtReq, null, 2))
        return fmtReq
      }
    }
  }
} as const satisfies Chain;


export const config = getDefaultConfig({
  appName: 'Walnut App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    seismicDevnet as Chain,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});