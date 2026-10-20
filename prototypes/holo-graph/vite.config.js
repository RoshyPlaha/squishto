import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const WASM_DIR = fileURLToPath(new URL('./node_modules/@mediapipe/tasks-vision/wasm', import.meta.url))

// Serves MediaPipe's WASM runtime from our own origin (dev) and copies it into the build,
// so it always matches the installed package and doesn't depend on a CDN.
function mediapipeWasm() {
  return {
    name: 'mediapipe-wasm',
    configureServer(server) {
      server.middlewares.use('/mediapipe-wasm', (req, res, next) => {
        const file = path.join(WASM_DIR, path.basename(req.url.split('?')[0]))
        if (!fs.existsSync(file)) return next()
        res.setHeader('Content-Type', file.endsWith('.wasm') ? 'application/wasm' : 'text/javascript')
        fs.createReadStream(file).pipe(res)
      })
    },
    generateBundle() {
      for (const name of fs.readdirSync(WASM_DIR)) {
        this.emitFile({ type: 'asset', fileName: `mediapipe-wasm/${name}`, source: fs.readFileSync(path.join(WASM_DIR, name)) })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), mediapipeWasm()],
  // three.js alone is ~1MB; that's fine for a local demo.
  build: { chunkSizeWarningLimit: 1600 },
})
