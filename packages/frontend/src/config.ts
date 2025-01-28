import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sanvil } from 'seismic-react';

export const config = getDefaultConfig({
  appName: 'Walnut App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    sanvil,
  ],
  ssr: true,
});
