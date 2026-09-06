import path from 'node:path'
import { PROTOTYPES_DIR, listPrototypes } from './prototypes.js'

const VIRTUAL_ID = 'virtual:prototype-manifest'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`

/**
 * Exposes the list of prototype HTML files to the entry page as
 * `import prototypes from 'virtual:prototype-manifest'`.
 *
 * Adding or removing a file under `prototypes/` refreshes the list in dev; the
 * build reads the folder once and every file is emitted as its own page (see
 * `rollupOptions.input` in vite.config.js).
 */
export default function prototypeManifest() {
  let rootDir = process.cwd()

  return {
    name: 'sandbox:prototype-manifest',

    configResolved(config) {
      rootDir = config.root
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) {
        return null
      }

      return `export default ${JSON.stringify(listPrototypes(rootDir))}`
    },

    configureServer(server) {
      const watchDir = path.join(rootDir, PROTOTYPES_DIR)
      server.watcher.add(watchDir)

      const refresh = (file) => {
        if (!file.startsWith(watchDir) || !file.endsWith('.html')) {
          return
        }

        const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID)

        if (module) {
          server.moduleGraph.invalidateModule(module)
        }

        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
      server.watcher.on('change', refresh)
    },
  }
}
