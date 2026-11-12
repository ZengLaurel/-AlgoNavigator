import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ExecResult, PyodideStatus } from './types'
import type { WorkerRequest, WorkerResponse } from './protocol'
import { PyodideContext } from './pyodideContext'
import { ModuleRunner, type ModuleRunInput } from './moduleRunner'
import { moduleFailure } from './moduleExecution'

const INITIALIZATION_TIMEOUT_MS = 30000
const EXECUTION_TIMEOUT_MS = 5000
const failure = (error: string): ExecResult => ({
  stdout: '',
  error,
  finalState: null,
})

export function createPyodideWorker(): Worker {
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
}

export function PyodideProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PyodideStatus>('idle')
  const workerRef = useRef<Worker | null>(null)
  const readyRef = useRef(false)
  const requestIdRef = useRef(0)
  const activeRef = useRef<
    ((result: ExecResult, discard?: boolean) => void) | null
  >(null)
  const mountedRef = useRef(true)
  const moduleRunnerRef = useRef<ModuleRunner | null>(null)
  const runModule = useCallback((input: ModuleRunInput) => {
    if (!mountedRef.current || activeRef.current)
      return Promise.resolve(
        moduleFailure(
          { ...input, requestId: 0, workerGeneration: 0 },
          'Python is unavailable or busy.',
          'BUSY',
        ),
      )
    moduleRunnerRef.current ??= new ModuleRunner(
      createPyodideWorker,
      (value) => {
        if (mountedRef.current) setStatus(value)
      },
    )
    return moduleRunnerRef.current.run(input)
  }, [])
  const cancelModule = useCallback(() => moduleRunnerRef.current?.cancel(), [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      moduleRunnerRef.current?.cancel()
      activeRef.current?.(
        failure('Python execution was cancelled because the editor closed.'),
        true,
      )
      workerRef.current?.terminate()
      workerRef.current = null
      readyRef.current = false
    }
  }, [])

  const run = useCallback((code: string): Promise<ExecResult> => {
    if (!mountedRef.current)
      return Promise.resolve(failure('The Python editor is closed.'))
    if (activeRef.current || moduleRunnerRef.current?.busy)
      return Promise.resolve(
        failure('Python is busy. Wait for the current run to finish.'),
      )

    return new Promise<ExecResult>((resolve) => {
      const requestId = ++requestIdRef.current
      let worker: Worker | null = null
      let timer: ReturnType<typeof setTimeout> | undefined
      let settled = false
      let executing = false
      const finish = (result: ExecResult, discard = false) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        worker?.removeEventListener('message', handleMessage)
        worker?.removeEventListener('error', handleError)
        worker?.removeEventListener('messageerror', handleMessageError)
        if (discard) {
          // Recovery must never construct a replacement before resolving the run.
          worker?.terminate()
          workerRef.current = null
          readyRef.current = false
        }
        activeRef.current = null
        if (mountedRef.current) setStatus(result.error ? 'error' : 'ready')
        resolve(result)
      }
      const post = (message: WorkerRequest) => {
        try {
          worker!.postMessage(message)
        } catch {
          finish(
            failure(
              'Python could not receive your code. Run again to restart it.',
            ),
            true,
          )
        }
      }
      const execute = () => {
        executing = true
        clearTimeout(timer)
        setStatus('running')
        timer = setTimeout(() => {
          finish(
            failure(
              'Your code took too long to finish. Check for an infinite loop and try again. Your code and progress have been kept.',
            ),
            true,
          )
        }, EXECUTION_TIMEOUT_MS)
        post({ type: 'run', requestId, code })
      }
      const handleMessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data
        if (!message || message.requestId !== requestId || settled) return
        if (message.type === 'ready' && !executing) {
          readyRef.current = true
          execute()
        } else if (message.type === 'init-error' && !executing) {
          finish(
            failure(
              `Python could not load. Run again to retry. ${message.error}`,
            ),
            true,
          )
        } else if (message.type === 'result' && executing) {
          finish(message.result)
        }
      }
      const handleError = (event: ErrorEvent) => {
        event.preventDefault()
        finish(
          failure(
            `Python stopped unexpectedly. Run again to restart it.${event.message ? ` ${event.message}` : ''}`,
          ),
          true,
        )
      }
      const handleMessageError = () => {
        finish(
          failure(
            'Python sent an unreadable response. Run again to restart it.',
          ),
          true,
        )
      }
      activeRef.current = finish
      try {
        worker = workerRef.current ?? createPyodideWorker()
        workerRef.current = worker
        worker.addEventListener('message', handleMessage)
        worker.addEventListener('error', handleError)
        worker.addEventListener('messageerror', handleMessageError)
        if (readyRef.current) {
          execute()
        } else {
          setStatus('loading')
          timer = setTimeout(() => {
            finish(
              failure(
                'Python took too long to load. Check your connection and run again to retry.',
              ),
              true,
            )
          }, INITIALIZATION_TIMEOUT_MS)
          post({ type: 'init', requestId })
        }
      } catch {
        finish(failure('Python could not start. Run again to retry.'), true)
      }
    })
  }, [])

  return (
    <PyodideContext.Provider value={{ status, run, runModule, cancelModule }}>
      {children}
    </PyodideContext.Provider>
  )
}
