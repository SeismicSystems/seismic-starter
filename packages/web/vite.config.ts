import { resolve } from 'path'
import { defineConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: resolve(__dirname, '../..'),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Bun currently installs lucide-react@0.383 (Privy transitive dep)
      // without its ESM entry file. Point all imports to the working
      // app-level lucide-react build.
      'lucide-react': resolve(
        __dirname,
        'node_modules/lucide-react/dist/esm/lucide-react.js'
      ),
    },
  },
})
