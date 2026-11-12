// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPyodide, type PyodideInterface } from 'pyodide'
import {
  runModuleCode,
  validModuleResult,
  type ModuleRunRequest,
} from './moduleExecution'

let runtime: PyodideInterface
beforeAll(async () => {
  runtime = await loadPyodide({ indexURL: 'node_modules/pyodide/' })
}, 30000)
function request(
  moduleId: ModuleRunRequest['moduleId'],
  code: string,
): ModuleRunRequest {
  return {
    moduleId,
    taskId: `${moduleId}-code`,
    exampleId: 'main',
    sessionId: 'test-session',
    requestId: 1,
    workerGeneration: 0,
    type: 'run-module',
    protocolVersion: 2,
    code,
  }
}
describe('real Pyodide multi-module harnesses', () => {
  it.each([
    [
      'array',
      'array.insert(1,"X")\narray.set(3,"D")\narray.remove(2)\nprint(array.traverse())',
      ['A', 'X', 'D'],
    ],
    [
      'queue',
      'queue.enqueue("A")\nqueue.enqueue("B")\nprint(queue.peek())\nqueue.dequeue()\nqueue.enqueue("C")',
      ['B', 'C'],
    ],
    [
      'linked-list',
      'chain.insertAfter("a","x")\nchain.removeHead()\nprint(chain.visit("x"))',
      ['x', 'b'],
    ],
  ] as const)(
    'executes %s in Python and validates independently replayed state',
    async (moduleId, code, expected) => {
      const input = request(moduleId, code)
      const result = await runModuleCode(runtime, input)
      expect(result.error).toBe(null)
      expect(validModuleResult(input, result)).toBe(true)
      const final = result.finalState!
      const values =
        final.kind === 'array'
          ? final.items.map((i) => i.value)
          : final.kind === 'queue'
            ? final.waiting.map((i) => i.value)
            : [final.head, final.nodes.find((n) => n.id === final.head)!.next]
      expect(values).toEqual(expected)
      expect(result.events.length).toBeGreaterThan(0)
    },
  )
  it('starts fresh, clears variables after exceptions and rejects object replacement or tampering', async () => {
    const broken = await runModuleCode(
      runtime,
      request('queue', 'previous_secret = 42\nqueue.dequeue()'),
    )
    expect(broken.error?.code).toBe('EMPTY')
    const fresh = await runModuleCode(
      runtime,
      request(
        'queue',
        'assert "previous_secret" not in globals()\nqueue.enqueue("K")',
      ),
    )
    expect(fresh.error).toBe(null)
    expect(fresh.events).toHaveLength(1)
    expect(
      (await runModuleCode(runtime, request('array', 'array = []'))).error
        ?.code,
    ).toBe('INVALID_EVIDENCE')
    expect(
      (
        await runModuleCode(
          runtime,
          request('array', 'array._state["items"] = []'),
        )
      ).error?.code,
    ).toBe('INVALID_EVIDENCE')
  })
  it('allows a caught invalid operation followed by repair, and rejects unknown fixtures', async () => {
    const result = await runModuleCode(
      runtime,
      request(
        'array',
        'try:\n    array.get(-1)\nexcept ValueError:\n    pass\narray.get(0)',
      ),
    )
    expect(result.error).toBe(null)
    expect(result.events.map((e) => e.accepted)).toEqual([false, true])
    const unknown = await runModuleCode(runtime, {
      ...request('queue', 'queue.peek()'),
      taskId: 'array-code',
    })
    expect(unknown.error?.code).toBe('INVALID_REQUEST')
  })
  it('keeps bounded output labelled and refuses an unbounded operation trace', async () => {
    const output = await runModuleCode(
      runtime,
      request('queue', 'print("x" * 5000)'),
    )
    expect(output.stdout).toContain('[Output truncated]')
    const trace = await runModuleCode(
      runtime,
      request('array', 'for i in range(129):\n    array.get(0)'),
    )
    expect(trace.error?.code).toBe('EVIDENCE_LIMIT')
  })
})

it('runs the forest repair task with two Python reference edits and ordered visits', async () => {
  const { linkedCodeGoal } = await import('../../content/modules/linkedList')
  const input = request(
    'linked-list',
    "chain.link('x','b')\nchain.link('a','x')\nchain.visit('a')\nchain.visit('x')\nprint(chain.visit('b'))",
  )
  const result = await runModuleCode(runtime, input)
  expect(result.error).toBe(null)
  expect(validModuleResult(input, result)).toBe(true)
  expect(linkedCodeGoal(result.finalState!, result.events)).toBe(true)
  expect(result.stdout.trim()).toBe('B')
})

it('runs Harbor Dispatch in real Python with observational peek and FIFO departures', async () => {
  const { queueCodeGoal } = await import('../../content/modules/queue')
  const input = request(
    'queue',
    "queue.enqueue('A')\nqueue.enqueue('B')\nprint(queue.peek())\nprint(queue.dequeue())\nqueue.enqueue('C')",
  )
  const result = await runModuleCode(runtime, input)
  expect(result.error).toBe(null)
  expect(validModuleResult(input, result)).toBe(true)
  expect(queueCodeGoal(result.finalState!, result.events)).toBe(true)
  expect(result.stdout.trim()).toBe('A\nA')
})

it('preserves blank output lines for module and Stack programs', async () => {
  const { runStackCode } = await import('./execBridge')
  const code = "print('first')\nprint()\nprint('third')"
  const module = await runModuleCode(runtime, request('queue', code))
  expect(module.stdout).toBe('first\n\nthird\n')
  const stack = await runStackCode(runtime, 'stack = MyStack()\n' + code)
  expect(stack.stdout).toBe('first\n\nthird\n')
})
it.each(['array', 'linked-list', 'queue'] as const)(
  'recovers a fresh %s Python namespace after an exception',
  async (moduleId) => {
    const broken = await runModuleCode(
      runtime,
      request(moduleId, 'leaked = 42\nraise ValueError("lesson failure")'),
    )
    expect(broken.error).not.toBe(null)
    const fresh = await runModuleCode(
      runtime,
      request(moduleId, 'assert "leaked" not in globals()\nprint("recovered")'),
    )
    expect(fresh.error).toBe(null)
    expect(fresh.stdout).toBe('recovered\n')
    expect(fresh.events).toHaveLength(0)
  },
)
