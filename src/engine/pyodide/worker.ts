import { loadPyodide, type PyodideInterface } from 'pyodide'
import { runStackCode } from './execBridge'

const PYODIDE_INDEX_URL = '/pyodide/'
let pyodide: PyodideInterface | undefined

interface WorkerRequest {
  code: string
}

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage(message: unknown): void
}

const workerScope = self as unknown as WorkerScope

workerScope.onmessage = async (event) => {
  try {
    pyodide ??= await loadPyodide({ indexURL: PYODIDE_INDEX_URL })
    const result = await runStackCode(pyodide, event.data.code)
    workerScope.postMessage({ type: 'result', result })
  } catch (error) {
    workerScope.postMessage({
      type: 'result',
      result: {
        stdout: '',
        error: String(error),
        finalState: null,
      },
    })
  }
}
