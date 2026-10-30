import { act, render, screen } from '@testing-library/react'
import { usePyodide } from './pyodideContext'
import { PyodideProvider } from './PyodideProvider'
import { afterEach, describe, expect, it, vi } from 'vitest'

class FakeWorker {
  static instances: FakeWorker[] = []
  static respondNext = false
  private messageListeners = new Set<(event: MessageEvent) => void>()
  private errorListeners = new Set<(event: ErrorEvent) => void>()
  terminated = false
  respond = false

  constructor() {
    FakeWorker.instances.push(this)
    this.respond = FakeWorker.respondNext
    FakeWorker.respondNext = false
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === 'message')
      this.messageListeners.add(listener as (event: MessageEvent) => void)
    if (type === 'error')
      this.errorListeners.add(listener as (event: ErrorEvent) => void)
  }

  removeEventListener(type: string, listener: EventListener) {
    if (type === 'message')
      this.messageListeners.delete(listener as (event: MessageEvent) => void)
    if (type === 'error')
      this.errorListeners.delete(listener as (event: ErrorEvent) => void)
  }

  postMessage() {
    if (!this.respond) return
    queueMicrotask(() => {
      const event = new MessageEvent('message', {
        data: {
          type: 'result',
          result: {
            stdout: '3\n',
            error: null,
            finalState: { elements: [{ id: 'slot-0', value: 3 }] },
          },
        },
      })
      this.messageListeners.forEach((listener) => listener(event))
    })
  }

  terminate() {
    this.terminated = true
  }
}

function Probe() {
  const { status, run } = usePyodide()
  return (
    <>
      <output data-testid="status">{status}</output>
      <button type="button" onClick={() => void run('print(3)')}>
        Run code
      </button>
    </>
  )
}

describe('PyodideProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    FakeWorker.instances = []
    FakeWorker.respondNext = false
  })

  it('resolves a worker result and returns to ready status', async () => {
    vi.stubGlobal('Worker', FakeWorker)
    FakeWorker.respondNext = true

    render(
      <PyodideProvider>
        <Probe />
      </PyodideProvider>,
    )

    await act(async () => {
      screen.getByRole('button', { name: 'Run code' }).click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(screen.getByTestId('status').textContent).toBe('ready')
    expect(FakeWorker.instances).toHaveLength(1)
  })

  it('terminates a hanging worker and resolves with a timeout message', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('Worker', FakeWorker)

    render(
      <PyodideProvider>
        <Probe />
      </PyodideProvider>,
    )

    let settled = false
    await act(async () => {
      screen.getByRole('button', { name: 'Run code' }).click()
      await vi.advanceTimersByTimeAsync(5000)
      settled = true
    })

    expect(settled).toBe(true)
    expect(FakeWorker.instances[0].terminated).toBe(true)
    expect(FakeWorker.instances).toHaveLength(2)
    expect(screen.getByTestId('status').textContent).toBe('error')
  })
})
