import { mapPythonError } from './errorMessages'
import { STACK_HARNESS, STACK_STATE_EXPRESSION } from './pythonHarness'
import type { ExecResult } from './types'

interface PyProxy {
  toJs(options?: { create_proxies?: boolean }): unknown
  destroy?(): void
}

export interface PyodideInterface {
  runPythonAsync(code: string): Promise<unknown>
  setStdout(options: { batched: (text: string) => void }): void
}

export async function runStackCode(
  pyodide: PyodideInterface,
  code: string,
): Promise<ExecResult> {
  let stdout = ''
  pyodide.setStdout({ batched: (text) => (stdout += text) })

  try {
    await pyodide.runPythonAsync(STACK_HARNESS)
    await pyodide.runPythonAsync(code)
    const stateProxy = (await pyodide.runPythonAsync(
      STACK_STATE_EXPRESSION,
    )) as PyProxy
    const values = stateProxy.toJs({ create_proxies: false }) as Array<
      number | string
    >
    stateProxy.destroy?.()

    return {
      stdout,
      error: null,
      finalState: {
        elements: values.map((value, index) => ({
          id: `slot-${index}`,
          value,
        })),
      },
    }
  } catch (error) {
    return {
      stdout,
      error: mapPythonError(String(error)),
      finalState: null,
    }
  }
}
