import { createServer } from 'vite'
import { acceptanceFaults } from './acceptanceFaults.ts'

const crash = process.argv.includes('--worker-crash')
const server = await createServer({
  plugins: [acceptanceFaults(crash)],
  optimizeDeps: { include: ['pyodide'] },
  server: { host: '127.0.0.1', port: 4175, strictPort: true },
})
await server.listen()
console.log(
  'LOCAL ACCEPTANCE ONLY: AI is forced unavailable; separate origin/storage at port 4175.',
)
console.log(
  `First Worker crash per page load: ${crash ? 'enabled; retry uses real Pyodide' : 'disabled'}.`,
)
server.printUrls()
