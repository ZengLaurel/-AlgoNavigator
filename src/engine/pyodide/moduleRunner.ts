import {
  moduleFailure,
  sameRun,
  validModuleRequest,
  validModuleResult,
  type ModuleRunRequest,
  type ModuleRunResult,
} from './moduleExecution'
import type { WorkerResponse } from './protocol'
import type { PyodideStatus } from './types'

export type ModuleRunInput = Omit<
  ModuleRunRequest,
  'type' | 'protocolVersion' | 'requestId' | 'workerGeneration'
>
/** Owns one execution generation. Cancellation settles its promise before another run can start. */
export class ModuleRunner {
  private worker: Worker | null = null
  private generation = 0
  private nextId = 0
  private pending: (() => void) | null = null
  private readonly createWorker: () => Worker
  private readonly status: (value: PyodideStatus) => void
  constructor(
    createWorker: () => Worker,
    status: (value: PyodideStatus) => void = () => undefined,
  ) {
    this.createWorker = createWorker
    this.status = status
  }
  get busy() {
    return this.pending !== null
  }
  cancel() {
    this.pending?.()
    this.worker?.terminate()
    this.worker = null
    this.generation++
  }
  run(input: ModuleRunInput): Promise<ModuleRunResult> {
    const request: ModuleRunRequest = {
      ...input,
      type: 'run-module',
      protocolVersion: 2,
      requestId: ++this.nextId,
      workerGeneration: this.generation,
    }
    if (!validModuleRequest(request))
      return Promise.resolve(
        moduleFailure(request, 'Choose a registered task.', 'INVALID_REQUEST'),
      )
    if (this.pending)
      return Promise.resolve(
        moduleFailure(request, 'Wait for the active run.', 'BUSY'),
      )
    return new Promise((resolve) => {
      let settled = false
      let executing = false
      let timer: ReturnType<typeof setTimeout>
      let worker: Worker | null = null
      const finish = (result: ModuleRunResult) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        worker?.removeEventListener('message', receive)
        worker?.removeEventListener('error', failed)
        worker?.removeEventListener('messageerror', failed)
        worker?.terminate()
        this.worker = null
        this.pending = null
        this.generation++
        this.status(result.error ? 'error' : 'ready')
        resolve(result)
      }
      const failed = () =>
        finish(
          moduleFailure(
            request,
            'Python stopped. Run again to retry.',
            'WORKER_ERROR',
          ),
        )
      const receive = (event: MessageEvent<WorkerResponse>) => {
        const value = event.data
        if (!value || value.requestId !== request.requestId) return
        if (value.type === 'ready' && !executing) {
          executing = true
          clearTimeout(timer)
          this.status('running')
          timer = setTimeout(
            () =>
              finish(
                moduleFailure(
                  request,
                  'Your code took too long. Check the loop and retry.',
                  'TIMEOUT',
                ),
              ),
            5000,
          )
          try {
            worker!.postMessage(request)
          } catch {
            failed()
          }
        } else if (value.type === 'init-error' && !executing) failed()
        else if (
          value.type === 'module-result' &&
          executing &&
          sameRun(request, value)
        ) {
          finish(
            validModuleResult(request, value)
              ? value
              : moduleFailure(
                  request,
                  'Python sent invalid lesson evidence. Run again.',
                  'INVALID_EVIDENCE',
                ),
          )
        }
      }
      this.pending = () =>
        finish(
          moduleFailure(
            request,
            'The task changed. This run was cancelled.',
            'CANCELLED',
          ),
        )
      timer = setTimeout(
        () =>
          finish(
            moduleFailure(
              request,
              'Python took too long to load. Run again.',
              'INIT_TIMEOUT',
            ),
          ),
        30000,
      )
      this.status('loading')
      try {
        worker = this.createWorker()
        this.worker = worker
        worker.addEventListener('message', receive)
        worker.addEventListener('error', failed)
        worker.addEventListener('messageerror', failed)
        worker.postMessage({ type: 'init', requestId: request.requestId })
      } catch {
        failed()
      }
    })
  }
}
