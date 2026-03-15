import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
  ssr: {
    noExternal: ['@convex-dev/better-auth'],
  },
  build: {
    rollupOptions: {
      external: ['node:stream', 'node:stream/web', 'node:async_hooks'],
    },
  },
  optimizeDeps: {
    exclude: ['@tanstack/router-core', '@tanstack/start-storage-context', '@tanstack/start-server-core'],
  },
})

export default config
