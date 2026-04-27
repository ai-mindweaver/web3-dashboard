import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, base, arbitrum } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Web3 Dashboard Demo',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '',
  chains: [mainnet, sepolia, base, arbitrum],
  ssr: true,
});
