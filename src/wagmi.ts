import { http, createConfig } from 'wagmi'
// import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

import { type Chain } from 'viem'

export const cantoTestnet = {
  id: 7701,
  name: 'Canto Testnet',
  nativeCurrency: {
    name: 'Canto',
    symbol: 'CANTO',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://canto-testnet.plexnode.wtf']},
  },
  blockExplorers: {
    default: { name: 'Tuber', url: 'https://testnet.tuber.build/' },
  },
} as const satisfies Chain

export const config = createConfig({
  chains: [cantoTestnet],
  // chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [cantoTestnet.id]: http(),
    // [mainnet.id]: http(),
    // [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
