import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { listPrototypes } from './prototypes.js'
import prototypeManifest from './vite-plugin-prototype-manifest.js'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

/**
 * Every prototype HTML file is its own build entry, so `prototypes/foo.html`
 * ends up at `dist/prototypes/foo.html` and keeps working as a plain page.
 */
const prototypeInputs = Object.fromEntries(
  listPrototypes(rootDir).map(({ id, file }) => [id, file]),
)

export default defineConfig(({ mode }) => ({
  plugins: [prototypeManifest()],

  build: {
    sourcemap: mode !== 'production',
    rollupOptions: {
      input: {
        index: 'index.html',
        ...prototypeInputs,
      },
    },
  },

  server: {
    port: Number(process.env.VITE_DEV_PORT || 5174),
    strictPort: true,
  },

  preview: {
    port: Number(process.env.VITE_PREVIEW_PORT || 4174),
    strictPort: true,
  },
}))
