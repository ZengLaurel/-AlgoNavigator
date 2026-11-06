import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkerRequest } from './protocol'

const { load, execute } = vi.hoisted(() => ({
  load: vi.fn(),
  execute: vi.fn(),
}))
vi.mock('pyodide', () => ({ loadPyodide: load }))
vi.mock('./execBridge', () => ({ runStackCode: execute }))

async function setup() {
  vi.resetModules()
  const scope = {
    onmessage: null as unknown as (event: {
      data: WorkerRequest
    }) => Promise<void>,
    postMessage: vi.fn(),
  }
  vi.stubGlobal('self', scope)
  await import('./worker')
  return scope
}

describe('Python worker protocol', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetAllMocks()
  })
  it('loads local resources before ready and correlates every result', async () => {
    const runtime = {}
    load.mockResolvedValue(runtime)
    const result = { stdout: '3', error: null, finalState: null }
    execute.mockResolvedValue(result)
    const scope = await setup()
    await scope.onmessage({ data: { type: 'init', requestId: 4 } })
    expect(load).toHaveBeenCalledWith({ indexURL: '/pyodide/' })
    expect(execute).not.toHaveBeenCalled()
    expect(scope.postMessage).toHaveBeenLastCalledWith({
      type: 'ready',
      requestId: 4,
    })
    await scope.onmessage({
      data: { type: 'run', requestId: 5, code: 'print(3)' },
    })
    expect(execute).toHaveBeenCalledWith(runtime, 'print(3)')
    expect(scope.postMessage).toHaveBeenLastCalledWith({
      type: 'result',
      requestId: 5,
      result,
    })
  })
  it('reports startup errors separately and allows another initialization', async () => {
    load
      .mockRejectedValueOnce(new Error('missing WASM'))
      .mockResolvedValueOnce({})
    const scope = await setup()
    await scope.onmessage({ data: { type: 'init', requestId: 7 } })
    expect(scope.postMessage).toHaveBeenLastCalledWith({
      type: 'init-error',
      requestId: 7,
      error: 'Error: missing WASM',
    })
    await scope.onmessage({ data: { type: 'init', requestId: 8 } })
    expect(scope.postMessage).toHaveBeenLastCalledWith({
      type: 'ready',
      requestId: 8,
    })
  })
  it('correlates execution failures and refuses execution before ready', async () => {
    const scope = await setup()
    await scope.onmessage({ data: { type: 'run', requestId: 2, code: 'pass' } })
    expect(scope.postMessage).toHaveBeenLastCalledWith({
      type: 'result',
      requestId: 2,
      result: {
        stdout: '',
        error: expect.stringContaining('not initialized'),
        finalState: null,
      },
    })
    load.mockResolvedValue({})
    await scope.onmessage({ data: { type: 'init', requestId: 3 } })
    execute.mockRejectedValue(new Error('execution failed'))
    await scope.onmessage({ data: { type: 'run', requestId: 4, code: 'pass' } })
    expect(scope.postMessage).toHaveBeenLastCalledWith({
      type: 'result',
      requestId: 4,
      result: {
        stdout: '',
        error: 'Error: execution failed',
        finalState: null,
      },
    })
  })
})
