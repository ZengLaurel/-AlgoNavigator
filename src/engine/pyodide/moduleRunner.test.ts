import { afterEach, describe, expect, it, vi } from 'vitest'
import { ModuleRunner } from './moduleRunner'
import { executionFixture } from '../../content/modules/catalog'
import { runIdentity, type ModuleRunRequest } from './moduleExecution'

class FakeWorker extends EventTarget {
  postMessage = vi.fn()
  terminate = vi.fn()
  emit(data: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data }))
  }
}
const input = {
  moduleId: 'queue' as const,
  taskId: 'queue-code',
  exampleId: 'main',
  sessionId: 'test',
  code: '',
}
describe('module Worker lifecycle', () => {
  afterEach(() => vi.useRealTimers())
  it('ignores stale identities, settles once and permits a clean subsequent run', async () => {
    const workers: FakeWorker[] = []
    const runner = new ModuleRunner(() => {
      const w = new FakeWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const pending = runner.run(input)
    expect((await runner.run(input)).error?.code).toBe('BUSY')
    const init = workers[0].postMessage.mock.calls[0][0]
    workers[0].emit({ type: 'ready', requestId: init.requestId })
    const request = workers[0].postMessage.mock.calls[1][0] as ModuleRunRequest
    const state = executionFixture('queue', 'queue-code', 'main')!
    const result = {
      ...runIdentity(request),
      type: 'module-result',
      protocolVersion: 2,
      initialState: state,
      finalState: state,
      events: [],
      stdout: '',
      error: null,
    }
    workers[0].emit({ ...result, sessionId: 'old' })
    expect(runner.busy).toBe(true)
    workers[0].emit(result)
    workers[0].emit(result)
    expect((await pending).error).toBe(null)
    expect(workers[0].terminate).toHaveBeenCalledOnce()
    const cancelled = runner.run({ ...input, sessionId: 'new' })
    runner.cancel()
    expect((await cancelled).error?.code).toBe('CANCELLED')
  })
  it('terminates hung or crashed workers and recovers without losing the caller task', async () => {
    vi.useFakeTimers()
    const workers: FakeWorker[] = []
    const runner = new ModuleRunner(() => {
      const w = new FakeWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const first = runner.run(input)
    workers[0].emit({ type: 'ready', requestId: 1 })
    await vi.advanceTimersByTimeAsync(5000)
    expect((await first).error?.code).toBe('TIMEOUT')
    expect(workers[0].terminate).toHaveBeenCalledOnce()
    const second = runner.run(input)
    workers[1].dispatchEvent(new Event('error'))
    expect((await second).error?.code).toBe('WORKER_ERROR')
    const third = runner.run(input)
    await vi.advanceTimersByTimeAsync(30000)
    expect((await third).error?.code).toBe('INIT_TIMEOUT')
    expect(workers).toHaveLength(3)
  })
})

it.each(['array', 'linked-list', 'queue'] as const)(
  'rebuilds a timed-out %s worker and rejects old replies after retry',
  async (moduleId) => {
    vi.useFakeTimers()
    try {
      const workers: FakeWorker[] = []
      const runner = new ModuleRunner(() => {
        const w = new FakeWorker()
        workers.push(w)
        return w as unknown as Worker
      })
      const lesson = { ...input, moduleId, taskId: moduleId + '-code' }
      const first = runner.run(lesson)
      workers[0].emit({
        type: 'ready',
        requestId: workers[0].postMessage.mock.calls[0][0].requestId,
      })
      await vi.advanceTimersByTimeAsync(5000)
      expect((await first).error?.code).toBe('TIMEOUT')
      const second = runner.run(lesson)
      workers[1].emit({
        type: 'ready',
        requestId: workers[1].postMessage.mock.calls[0][0].requestId,
      })
      const req = workers[1].postMessage.mock.calls[1][0] as ModuleRunRequest
      const state = executionFixture(moduleId, lesson.taskId, 'main')!
      const reply = {
        ...runIdentity(req),
        type: 'module-result',
        protocolVersion: 2,
        initialState: state,
        finalState: state,
        events: [],
        stdout: '',
        error: null,
      }
      workers[0].emit(reply)
      expect(runner.busy).toBe(true)
      workers[1].emit(reply)
      expect((await second).error).toBe(null)
      expect(workers[0].terminate).toHaveBeenCalledOnce()
    } finally {
      vi.useRealTimers()
    }
  },
)
