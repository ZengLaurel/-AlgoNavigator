import { createServer } from 'vite'

process.env.ALGONAV_TUTOR_PROVIDER = 'local-codex'
const server = await createServer({
  server: { host: '127.0.0.1', port: 4174, strictPort: true },
})
await server.listen()
console.log('Tutor provider: local Codex (uses your existing ChatGPT login).')
server.printUrls()
