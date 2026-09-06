import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * SandboxSpaApp is served by the SandboxApi Strapi app from its `public/app`
 * folder, so the build writes straight into that folder and every asset URL is
 * prefixed with `/app/`.
 */
const STRAPI_PUBLIC_APP_DIR = fileURLToPath(
  new URL('../SandboxApi/public/app', import.meta.url),
)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:1337'

  return {
    // Matches the `/app` mount point inside the Strapi public folder.
    base: '/app/',

    plugins: [react()],

    build: {
      outDir: STRAPI_PUBLIC_APP_DIR,
      // The folder lives outside this package, so Vite needs permission to
      // clear it between builds.
      emptyOutDir: true,
      sourcemap: mode !== 'production',
    },

    server: {
      port: Number(env.VITE_DEV_PORT || 5173),
      strictPort: true,
      // In dev the SPA runs on its own origin, so proxy the Strapi routes to
      // keep request paths identical to production.
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/graphql': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
      },
    },

    preview: {
      port: Number(env.VITE_PREVIEW_PORT || 4173),
      strictPort: true,
    },
  }
})
