import type { Plugin } from 'vite'

/** Local acceptance only. Never registered by the product's Vite configuration. */
export function acceptanceFaults(crashFirstWorker: boolean): Plugin {
  return {
    name: 'local-acceptance-faults',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/tutor', (req, res) => {
        req.resume()
        res.statusCode = 503
        res.setHeader('content-type', 'application/json')
        res.setHeader('cache-control', 'no-store')
        res.end(
          JSON.stringify({
            reply: 'AI is unavailable during this local acceptance run.',
          }),
        )
      })
      server.middlewares.use('/__acceptance-worker-crash.js', (_req, res) => {
        res.setHeader('content-type', 'text/javascript')
        res.setHeader('cache-control', 'no-store')
        res.end('throw new Error("Controlled local acceptance Worker failure")')
      })
    },
    transform(code, id) {
      if (
        !crashFirstWorker ||
        !id
          .replaceAll('\\', '/')
          .split('?')[0]
          .endsWith('/src/engine/pyodide/PyodideProvider.tsx')
      )
        return null
      const marker = 'export function createPyodideWorker(): Worker {'
      if (!code.includes(marker))
        throw new Error(
          'Acceptance Worker factory changed; update the harness instead of silently skipping the fault.',
        )
      return {
        code: code.replace(
          marker,
          `let acceptanceCrashPending = true
${marker}
  if (acceptanceCrashPending) {
    acceptanceCrashPending = false
    return new Worker('/__acceptance-worker-crash.js', { type: 'module' })
  }`,
        ),
        map: null,
      }
    },
  }
}
