import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { defineConfig, type Plugin } from 'vite'

/** Serves the tutor proxy during `npm run dev`.
 *
 * The app is otherwise a static bundle, so without this the browser has no
 * `/api/tutor` to call locally. The handler is loaded through Vite's SSR
 * module runner, which keeps the Anthropic SDK and the API key out of the
 * client bundle — `api/` is never imported from `src/`.
 */
function tutorDevApi(): Plugin {
  return {
    name: 'algonavigator-tutor-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/tutor', (req, res) => {
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => {
          void (async () => {
            try {
              const { handleTutorRequest } = await server.ssrLoadModule(
                '/api/tutor/handler.ts',
              )
              const { askClaude } = await server.ssrLoadModule(
                '/api/tutor/claudeClient.ts',
              )
              const { TUTOR_SYSTEM_PROMPT } = await server.ssrLoadModule(
                '/api/tutor/systemPrompt.ts',
              )

              const result = await handleTutorRequest(
                {
                  method: req.method ?? 'GET',
                  body: Buffer.concat(chunks).toString('utf8'),
                },
                { askModel: askClaude, systemPrompt: TUTOR_SYSTEM_PROMPT },
              )

              res.statusCode = result.status
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify(result.body))
            } catch (error) {
              // Surfaces setup problems (missing API key, bad import) in the
              // dev terminal while keeping the browser response child-safe.
              server.config.logger.error(
                `[tutor] dev request failed: ${String(error)}`,
              )
              res.statusCode = 502
              res.setHeader('content-type', 'application/json')
              res.end(
                JSON.stringify({
                  reply:
                    "I can't answer right now. Keep trying the stack exercise and ask me again in a moment.",
                  moderationFlag: false,
                }),
              )
            }
          })()
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tutorDevApi(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pyodide/*',
          dest: 'pyodide',
        },
      ],
    }),
  ],
})
