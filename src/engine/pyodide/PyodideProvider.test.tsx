import { useEffect } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePyodide, type PyodideContextValue } from './pyodideContext'
import { PyodideProvider } from './PyodideProvider'
import type { WorkerRequest, WorkerResponse } from './protocol'

export class FakeWorker extends EventTarget {
  static instances: FakeWorker[] = []
  static failConstruction = false
  messages: WorkerRequest[] = []
  terminated = false
  failPost = false
  constructor() {
    super()
    if (FakeWorker.failConstruction) throw new Error('constructor failed')
    FakeWorker.instances.push(this)
  }
  postMessage(message: WorkerRequest) {
    if (this.failPost) throw new Error('post failed')
    this.messages.push(message)
  }
  emit(message: WorkerResponse) {
    this.dispatchEvent(new MessageEvent('message', { data: message }))
  }
  terminate() {
    this.terminated = true
  }
}

let context: PyodideContextValue
function Probe() {
  const value = usePyodide()
  useEffect(() => {
    context = value
  }, [value])
  return <output>{value.status}</output>
}
const result = { stdout: '3\n', error: null, finalState: null }
const mount = () =>
  render(
    <PyodideProvider>
      <Probe />
    </PyodideProvider>,
  )
const worker = () => FakeWorker.instances.at(-1)!
function start() {
  let promise!: ReturnType<PyodideContextValue['run']>
  act(() => {
    promise = context.run('print(3)')
  })
  return promise
}
function ready() {
  const requestId = worker().messages.at(-1)!.requestId
  act(() => worker().emit({ type: 'ready', requestId }))
  return requestId
}

describe('PyodideProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('Worker', FakeWorker)
    FakeWorker.instances = []
    FakeWorker.failConstruction = false
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('waits for correlated ready, resolves the actual result and reuses initialization', async () => {
    mount()
    const promise = start()
    expect(screen.getByText('loading')).toBeTruthy()
    expect(worker().messages[0].type).toBe('init')
    await act(() => vi.advanceTimersByTimeAsync(10000))
    const requestId = ready()
    expect(screen.getByText('running')).toBeTruthy()
    act(() => worker().emit({ type: 'result', requestId, result }))
    await expect(promise).resolves.toEqual(result)
    expect(screen.getByText('ready')).toBeTruthy()
    const second = start()
    expect(worker().messages.map((m) => m.type)).toEqual(['init', 'run', 'run'])
    act(() =>
      worker().emit({ type: 'result', requestId: requestId + 1, result }),
    )
    await expect(second).resolves.toEqual(result)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('settles initialization after 30 seconds rather than the execution deadline and retries', async () => {
    mount()
    const promise = start()
    const settled = vi.fn()
    void promise.then(settled)
    await act(() => vi.advanceTimersByTimeAsync(29999))
    expect(settled).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    await expect(promise).resolves.toMatchObject({
      error: expect.stringContaining('too long to load'),
    })
    expect(worker().terminated).toBe(true)
    const retry = start()
    const requestId = ready()
    act(() => worker().emit({ type: 'result', requestId, result }))
    await expect(retry).resolves.toEqual(result)
  })

  it('settles execution timeout even when replacement construction would throw, then recovers', async () => {
    mount()
    const promise = start()
    ready()
    FakeWorker.failConstruction = true
    await act(() => vi.advanceTimersByTimeAsync(5000))
    await expect(promise).resolves.toMatchObject({
      error: expect.stringContaining('infinite loop'),
    })
    expect(FakeWorker.instances).toHaveLength(1)
    expect(worker().terminated).toBe(true)
    expect(screen.getByText('error')).toBeTruthy()
    const failedRetry = start()
    await expect(failedRetry).resolves.toMatchObject({
      error: expect.stringContaining('could not start'),
    })
    FakeWorker.failConstruction = false
    const retry = start()
    const requestId = ready()
    act(() => worker().emit({ type: 'result', requestId, result }))
    await expect(retry).resolves.toEqual(result)
  })

  it('settles constructor failures and allows a fresh attempt', async () => {
    mount()
    FakeWorker.failConstruction = true
    await expect(start()).resolves.toMatchObject({
      error: expect.stringContaining('could not start'),
    })
    expect(vi.getTimerCount()).toBe(0)
    FakeWorker.failConstruction = false
    const retry = start()
    ready()
    await act(() => vi.advanceTimersByTimeAsync(5000))
    await expect(retry).resolves.toMatchObject({
      error: expect.stringContaining('too long to finish'),
    })
  })

  it.each(['init', 'run'] as const)(
    'settles %s postMessage failures',
    async (phase) => {
      mount()
      const original = FakeWorker.prototype.postMessage
      if (phase === 'init')
        vi.spyOn(FakeWorker.prototype, 'postMessage').mockImplementation(() => {
          throw new Error('post failed')
        })
      const promise = start()
      if (phase === 'run') {
        worker().failPost = true
        ready()
      }
      await expect(promise).resolves.toMatchObject({
        error: expect.stringContaining('could not receive'),
      })
      expect(worker().terminated).toBe(true)
      expect(vi.getTimerCount()).toBe(0)
      FakeWorker.prototype.postMessage = original
      vi.restoreAllMocks()
    },
  )

  it('settles an initialization error and restarts on retry', async () => {
    mount()
    const promise = start()
    act(() =>
      worker().emit({
        type: 'init-error',
        requestId: 1,
        error: 'WASM unavailable',
      }),
    )
    await expect(promise).resolves.toMatchObject({
      error: expect.stringContaining('WASM unavailable'),
    })
    expect(worker().terminated).toBe(true)
    const retry = start()
    const requestId = ready()
    act(() => worker().emit({ type: 'result', requestId, result }))
    await expect(retry).resolves.toEqual(result)
  })

  it.each(['error', 'messageerror'])(
    'settles %s events, ignores late messages and permits retry',
    async (type) => {
      mount()
      const promise = start()
      const old = worker()
      act(() =>
        old.dispatchEvent(
          type === 'error'
            ? new ErrorEvent('error', { message: 'load failed' })
            : new MessageEvent('messageerror'),
        ),
      )
      await expect(promise).resolves.toMatchObject({
        error: expect.any(String),
      })
      expect(old.terminated).toBe(true)
      const retry = start()
      act(() => old.emit({ type: 'result', requestId: 1, result }))
      expect(screen.getByText('loading')).toBeTruthy()
      const requestId = ready()
      act(() => worker().emit({ type: 'result', requestId, result }))
      await expect(retry).resolves.toEqual(result)
    },
  )

  it('rejects concurrency without disturbing the active promise and ignores stale/wrong-phase responses', async () => {
    mount()
    const promise = start()
    await expect(start()).resolves.toMatchObject({
      error: expect.stringContaining('busy'),
    })
    act(() => {
      worker().emit({ type: 'ready', requestId: 999 })
      worker().emit({ type: 'result', requestId: 1, result })
    })
    expect(screen.getByText('loading')).toBeTruthy()
    const requestId = ready()
    act(() => {
      worker().emit({ type: 'ready', requestId })
      worker().emit({ type: 'result', requestId: 999, result })
    })
    expect(worker().messages).toHaveLength(2)
    expect(screen.getByText('running')).toBeTruthy()
    act(() => worker().emit({ type: 'result', requestId, result }))
    await expect(promise).resolves.toEqual(result)
  })

  it.each(['loading', 'running'])(
    'settles on unmount during %s and removes timers/listeners',
    async (phase) => {
      const view = mount()
      const promise = start()
      if (phase === 'running') ready()
      const remove = vi.spyOn(worker(), 'removeEventListener')
      view.unmount()
      await expect(promise).resolves.toMatchObject({
        error: expect.stringContaining('cancelled'),
      })
      expect(worker().terminated).toBe(true)
      expect(remove.mock.calls.map((c) => c[0])).toEqual([
        'message',
        'error',
        'messageerror',
      ])
      expect(vi.getTimerCount()).toBe(0)
      await expect(context.run('print(1)')).resolves.toMatchObject({
        error: expect.stringContaining('closed'),
      })
    },
  )
})
