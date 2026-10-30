import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ExecResult, PyodideStatus } from './types'
import { PyodideContext } from './pyodideContext'

interface WorkerMessage {
  type: 'result'
  result: ExecResult
}

const EXECUTION_TIMEOUT_MS = 5000

type WorkerFactory = () => Worker

export function createPyodideWorker(): Worker {
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
}

export function PyodideProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PyodideStatus>('idle')
  const workerRef = useRef<Worker | null>(null)
  const factoryRef = useRef<WorkerFactory>(createPyodideWorker)
  const requestIdRef = useRef(0)

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = factoryRef.current()
      setStatus('loading')
    }
    return workerRef.current
  }, [])

  const run = useCallback(
    (code: string) => {
      const worker = getWorker()
      setStatus('running')
      const requestId = ++requestIdRef.current

      return new Promise<ExecResult>((resolve) => {
        let settled = false
        const finish = (result: ExecResult) => {
          if (settled) return
          settled = true
          clearTimeout(timeout)
          worker.removeEventListener('message', handleMessage)
          worker.removeEventListener('error', handleError)
          setStatus(result.error ? 'error' : 'ready')
          resolve(result)
        }
        const handleMessage = (event: MessageEvent<WorkerMessage>) => {
          if (event.data.type === 'result') finish(event.data.result)
        }
        const handleError = (event: ErrorEvent) => {
          finish({
            stdout: '',
            error: event.message,
            finalState: null,
          })
        }
        const timeout = window.setTimeout(() => {
          worker.terminate()
          workerRef.current = factoryRef.current()
          finish({
            stdout: '',
            error:
              'Your code took too long to finish. The exercise was reset — check for an infinite loop and try again.',
            finalState: null,
          })
        }, EXECUTION_TIMEOUT_MS)

        worker.addEventListener('message', handleMessage)
        worker.addEventListener('error', handleError)
        worker.postMessage({ requestId, code })
      })
    },
    [getWorker],
  )

  return (
    <PyodideContext.Provider value={{ status, run }}>
      {children}
    </PyodideContext.Provider>
  )
}
