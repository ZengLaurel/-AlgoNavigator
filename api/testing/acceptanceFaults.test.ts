// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { acceptanceFaults } from '../../scripts/acceptanceFaults.js'
import type { Plugin } from 'vite'

function transform(plugin: Plugin, code: string, id: string) {
  const hook = plugin.transform
  if (typeof hook !== 'function') throw Error('Expected transform hook')
  return hook.call({} as never, code, id)
}
const factory =
  'export function createPyodideWorker(): Worker {\n return realWorker()\n}'
describe('isolated local acceptance harness', () => {
  it('only changes the exact Worker factory when the explicit crash flag is enabled', () => {
    const result = transform(
      acceptanceFaults(true),
      factory,
      'D:/AIgoNavigator/src/engine/pyodide/PyodideProvider.tsx',
    )
    expect(result).toMatchObject({
      code: expect.stringContaining('/__acceptance-worker-crash.js'),
    })
    expect(result).toMatchObject({
      code: expect.stringContaining('return realWorker()'),
    })
    expect(
      transform(
        acceptanceFaults(false),
        factory,
        'D:/AIgoNavigator/src/engine/pyodide/PyodideProvider.tsx',
      ),
    ).toBe(null)
    expect(
      transform(
        acceptanceFaults(true),
        factory,
        'D:/AIgoNavigator/src/other.tsx',
      ),
    ).toBe(null)
  })
  it('fails visibly if the targeted factory changes instead of claiming a crash test passed', () => {
    expect(() =>
      transform(
        acceptanceFaults(true),
        'changed',
        '/src/engine/pyodide/PyodideProvider.tsx',
      ),
    ).toThrow('factory changed')
  })
  it('intercepts the AI endpoint before a provider can be called and serves a real crashing Worker script', () => {
    const handlers = new Map<string, (req: unknown, res: unknown) => void>()
    const hook = acceptanceFaults(true).configureServer
    if (typeof hook !== 'function') throw Error('Expected server hook')
    hook.call(
      {} as never,
      {
        middlewares: {
          use: (path: string, handler: (req: unknown, res: unknown) => void) =>
            handlers.set(path, handler),
        },
      } as never,
    )
    let body = ''
    let resumed = false
    const headers = new Map<string, string>()
    const response = {
      statusCode: 200,
      setHeader: (k: string, v: string) => headers.set(k, v),
      end: (v: string) => {
        body = v
      },
    }
    handlers.get('/api/tutor')!(
      {
        resume: () => {
          resumed = true
        },
      },
      response,
    )
    expect(response.statusCode).toBe(503)
    expect(resumed).toBe(true)
    expect(JSON.parse(body).reply).toContain('unavailable')
    expect(headers.get('cache-control')).toBe('no-store')
    handlers.get('/__acceptance-worker-crash.js')!({}, response)
    expect(body).toContain('throw new Error')
  })
})
