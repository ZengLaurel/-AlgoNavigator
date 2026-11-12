import { loadPyodide, type PyodideInterface } from 'pyodide'
import { runStackCode } from './execBridge'
import {
  runModuleCode,
  moduleFailure,
  validModuleRequest,
} from './moduleExecution'
import type { WorkerRequest, WorkerResponse } from './protocol'

const PYODIDE_INDEX_URL = '/pyodide/'
let pyodide: PyodideInterface | undefined
let initialization: Promise<PyodideInterface> | undefined

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage(message: WorkerResponse): void
}

const workerScope = self as unknown as WorkerScope

workerScope.onmessage = async ({ data }) => {
  const { requestId } = data
  if (data.type === 'init') {
    try {
      initialization ??= loadPyodide({ indexURL: PYODIDE_INDEX_URL })
      pyodide = await initialization
      workerScope.postMessage({ type: 'ready', requestId })
    } catch (error) {
      initialization = undefined
      workerScope.postMessage({
        type: 'init-error',
        requestId,
        error: String(error),
      })
    }
    return
  }
  if (data.type === 'run-module') {
    if (!validModuleRequest(data) || !pyodide) {
      workerScope.postMessage(
        moduleFailure(
          data,
          'Python is not ready or the lesson is invalid.',
          'INVALID_REQUEST',
        ),
      )
      return
    }
    workerScope.postMessage(await runModuleCode(pyodide, data))
    return
  }
  try {
    if (!pyodide)
      throw new Error('Python is not initialized. Run again to retry.')
    const result = await runStackCode(pyodide, data.code)
    workerScope.postMessage({ type: 'result', requestId, result })
  } catch (error) {
    workerScope.postMessage({
      type: 'result',
      requestId,
      result: { stdout: '', error: String(error), finalState: null },
    })
  }
}
