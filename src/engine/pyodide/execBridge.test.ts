// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { runStackCode, type PyodideInterface } from './execBridge'

function createFakePyodide(): PyodideInterface {
  let stdoutHandler: ((text: string) => void) | undefined
  const values = [5, 8]
  return {
    setStdout: ({ batched }) => {
      stdoutHandler = batched
    },
    runPythonAsync: async (code: string) => {
      if (code.includes('print(stack.peek())')) {
        stdoutHandler?.('3\n')
      }
      if (code.includes('missing_name')) {
        throw new Error("NameError: name 'missing_name' is not defined")
      }
      if (code === '_read_state(stack)') {
        return {
          toJs: () => values,
          destroy: () => undefined,
        }
      }
      return undefined
    },
  }
}

describe('runStackCode', () => {
  it('captures output and returns the final stack state', async () => {
    const result = await runStackCode(
      createFakePyodide(),
      `stack = MyStack()
stack.push(5)
stack.push(8)
stack.push(3)
print(stack.peek())
stack.pop()
`,
    )

    expect(result.stdout.trim()).toBe('3')
    expect(result.error).toBeNull()
    expect(result.finalState?.elements).toEqual([
      { id: 'slot-0', value: 5 },
      { id: 'slot-1', value: 8 },
    ])
  })

  it('returns a friendly error when student code fails', async () => {
    const result = await runStackCode(
      createFakePyodide(),
      `stack = MyStack()
stack.push(5)
print(missing_name)
`,
    )

    expect(result.error).toBe(
      'Python does not know that name yet. Check its spelling and make sure you created it.',
    )
    expect(result.finalState).toBeNull()
  })
})
