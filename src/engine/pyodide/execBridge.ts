import { mapPythonError } from './errorMessages'
import { STACK_HARNESS, STACK_STATE_EXPRESSION } from './pythonHarness'
import type { ExecResult } from './types'
import type { StructureElement } from '../structures/types'

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
    // Each item is a (value, glyph) pair from MyStack.push; glyph is None
    // unless the student (or the Stairway Repair exercise) passed one.
    const pairs = stateProxy.toJs({ create_proxies: false }) as Array<
      [number | string, StructureElement['glyph'] | null]
    >
    stateProxy.destroy?.()

    return {
      stdout,
      error: null,
      finalState: {
        elements: pairs.map(([value, glyph], index) => ({
          id: `slot-${index}`,
          value,
          ...(glyph ? { glyph } : {}),
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
