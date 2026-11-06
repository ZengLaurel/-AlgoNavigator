import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { CodeEditorPanel } from './CodeEditorPanel'
import { PyodideProvider } from '../engine/pyodide/PyodideProvider'
import { PyodideContext } from '../engine/pyodide/pyodideContext'
import type { ExecResult } from '../engine/pyodide/types'
import type { WorkerRequest, WorkerResponse } from '../engine/pyodide/protocol'

vi.mock('codemirror', () => ({ basicSetup: [] }))
vi.mock('@codemirror/view', () => ({
  EditorView: class {
    static updateListener = { of: () => [] }
    destroy() {}
  },
  keymap: { of: () => [] },
}))
class EditorWorker extends EventTarget {
  static instances: EditorWorker[] = []
  messages: WorkerRequest[] = []
  constructor() {
    super()
    EditorWorker.instances.push(this)
  }
  postMessage(message: WorkerRequest) {
    this.messages.push(message)
  }
  terminate() {}
  emit(message: WorkerResponse) {
    this.dispatchEvent(new MessageEvent('message', { data: message }))
  }
}
function Editor() {
  const [result, setResult] = useState<ExecResult | null>(null)
  return (
    <>
      <CodeEditorPanel starterCode="print(3)" onResult={setResult} />
      <output>{result?.error ?? result?.stdout}</output>
    </>
  )
}

describe('CodeEditorPanel', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    EditorWorker.instances = []
  })
  it('shows loading then running, disables both buttons, displays timeout and recovers without resetting code', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('Worker', EditorWorker)
    render(
      <PyodideProvider>
        <Editor />
      </PyodideProvider>,
    )
    const run = screen.getByRole('button', { name: 'Run' }) as HTMLButtonElement
    const reset = screen.getByRole('button', {
      name: 'Reset',
    }) as HTMLButtonElement
    fireEvent.click(run)
    expect(screen.getByText('Loading Python…')).toBeTruthy()
    expect(run.disabled).toBe(true)
    expect(reset.disabled).toBe(true)
    const first = EditorWorker.instances[0]
    act(() => first.emit({ type: 'ready', requestId: 1 }))
    expect(screen.getByText('Running your code…')).toBeTruthy()
    expect(run.disabled).toBe(true)
    expect(reset.disabled).toBe(true)
    await act(() => vi.advanceTimersByTimeAsync(5000))
    expect(screen.getByText(/Your code took too long/)).toBeTruthy()
    expect(run.disabled).toBe(false)
    expect(reset.disabled).toBe(false)
    fireEvent.click(run)
    const retry = EditorWorker.instances[1]
    act(() => retry.emit({ type: 'ready', requestId: 2 }))
    expect(retry.messages[1]).toEqual({
      type: 'run',
      requestId: 2,
      code: 'print(3)',
    })
    await act(async () =>
      retry.emit({
        type: 'result',
        requestId: 2,
        result: { stdout: '3\n', error: null, finalState: null },
      }),
    )
    expect(screen.getByText('Python is ready.')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
    expect(run.disabled).toBe(false)
  })
  it('turns an unexpected rejection into a visible result instead of an unhandled rejection', async () => {
    const run = vi.fn().mockRejectedValue(new Error('unexpected'))
    render(
      <PyodideContext.Provider value={{ status: 'ready', run }}>
        <Editor />
      </PyodideContext.Provider>,
    )
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Run' })),
    )
    expect(
      screen.getByText('Python could not run your code. Please try again.'),
    ).toBeTruthy()
    expect(run).toHaveBeenCalledWith('print(3)')
  })
})
