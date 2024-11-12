import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) {
  throw new Error('Environment variable NEXT_PUBLIC_WC_PROJECT_ID is not set.');
}

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: projectId as string,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
