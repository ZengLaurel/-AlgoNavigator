import { executionFixture } from '../../content/modules/catalog'
import {
  equivalent,
  exactKeys,
  isRecord,
  replayEvidence,
  type ModuleState,
  type NewModuleId,
  type OperationEvent,
} from '../modules/structures'
import { MODULE_HARNESS } from './moduleHarness'
import { mapPythonError } from './errorMessages'
import type { PyodideInterface } from './execBridge'

export type RunIdentity = {
  moduleId: NewModuleId
  taskId: string
  exampleId: string
  sessionId: string
  requestId: number
  workerGeneration: number
}
export type ModuleRunRequest = RunIdentity & {
  type: 'run-module'
  protocolVersion: 2
  code: string
}
export type ModuleRunResult = RunIdentity & {
  type: 'module-result'
  protocolVersion: 2
  stdout: string
  error: { code: string; message: string } | null
  initialState: ModuleState | null
  finalState: ModuleState | null
  events: OperationEvent[]
}
export const runIdentity = (request: RunIdentity): RunIdentity => ({
  moduleId: request.moduleId,
  taskId: request.taskId,
  exampleId: request.exampleId,
  sessionId: request.sessionId,
  requestId: request.requestId,
  workerGeneration: request.workerGeneration,
})
export const moduleFailure = (
  request: RunIdentity,
  message: string,
  code = 'EXECUTION_ERROR',
): ModuleRunResult => ({
  ...runIdentity(request),
  type: 'module-result',
  protocolVersion: 2,
  stdout: '',
  error: { code, message },
  initialState: null,
  finalState: null,
  events: [],
})
export function sameRun(a: RunIdentity, b: RunIdentity) {
  return (
    [
      'moduleId',
      'taskId',
      'exampleId',
      'sessionId',
      'requestId',
      'workerGeneration',
    ] as const
  ).every((key) => a[key] === b[key])
}
export function validModuleRequest(v: unknown): v is ModuleRunRequest {
  return (
    isRecord(v) &&
    exactKeys(v, [
      'type',
      'protocolVersion',
      'moduleId',
      'taskId',
      'exampleId',
      'sessionId',
      'requestId',
      'workerGeneration',
      'code',
    ]) &&
    v.type === 'run-module' &&
    v.protocolVersion === 2 &&
    ['array', 'linked-list', 'queue'].includes(String(v.moduleId)) &&
    typeof v.taskId === 'string' &&
    typeof v.exampleId === 'string' &&
    typeof v.sessionId === 'string' &&
    v.sessionId.length > 0 &&
    v.sessionId.length <= 80 &&
    Number.isSafeInteger(v.requestId) &&
    Number(v.requestId) > 0 &&
    Number.isSafeInteger(v.workerGeneration) &&
    Number(v.workerGeneration) >= 0 &&
    typeof v.code === 'string' &&
    v.code.length <= 20000 &&
    executionFixture(v.moduleId as NewModuleId, v.taskId, v.exampleId) !== null
  )
}
export function validModuleResult(
  request: ModuleRunRequest,
  result: unknown,
): result is ModuleRunResult {
  if (
    !isRecord(result) ||
    !exactKeys(result, [
      'type',
      'protocolVersion',
      'moduleId',
      'taskId',
      'exampleId',
      'sessionId',
      'requestId',
      'workerGeneration',
      'stdout',
      'error',
      'initialState',
      'finalState',
      'events',
    ]) ||
    !sameRun(request, result as unknown as RunIdentity) ||
    result.type !== 'module-result' ||
    result.protocolVersion !== 2 ||
    typeof result.stdout !== 'string' ||
    result.stdout.length > 4050
  )
    return false
  if (result.error !== null)
    return (
      isRecord(result.error) &&
      typeof result.error.code === 'string' &&
      typeof result.error.message === 'string' &&
      result.error.message.length <= 2000 &&
      result.finalState === null &&
      result.initialState === null &&
      Array.isArray(result.events) &&
      result.events.length === 0
    )
  const initial = executionFixture(
    request.moduleId,
    request.taskId,
    request.exampleId,
  )
  return (
    initial !== null &&
    equivalent(initial, result.initialState) &&
    replayEvidence(initial, result.finalState, result.events)
  )
}
export async function runModuleCode(
  pyodide: PyodideInterface,
  request: ModuleRunRequest,
): Promise<ModuleRunResult> {
  if (!validModuleRequest(request))
    return moduleFailure(
      request,
      'Choose a registered lesson and try again.',
      'INVALID_REQUEST',
    )
  const initial = executionFixture(
    request.moduleId,
    request.taskId,
    request.exampleId,
  )!
  let stdout = ''
  let truncated = false
  pyodide.setStdout({
    batched: (text) => {
      truncated ||= stdout.length + text.length + 1 > 4000
      stdout = (stdout + text + '\n').slice(0, 4000)
    },
  })
  // One private namespace per run. The object binding and export closure are captured before student code.
  const binding =
    request.moduleId === 'linked-list' ? 'chain' : request.moduleId
  const program = `${MODULE_HARNESS}\n_obj = TeachingStructure(_json.loads(${JSON.stringify(JSON.stringify(initial))}))\n_ns = {${JSON.stringify(binding)}: _obj}\nexec(${JSON.stringify(request.code)}, _ns)\nif _ns.get(${JSON.stringify(binding)}) is not _obj: raise ValueError('INVALID_EVIDENCE')\n_result = _json.dumps(dict(finalState=_obj._state, events=_obj._events), ensure_ascii=False)\n`
  try {
    // globals exposed by Pyodide stay clean even if the submitted program throws.
    await pyodide.runPythonAsync('_module_scope = {}')
    await pyodide.runPythonAsync(
      `exec(${JSON.stringify(program)}, _module_scope)`,
    )
    const raw = await pyodide.runPythonAsync('_module_scope["_result"]')
    const evidence: unknown = typeof raw === 'string' ? JSON.parse(raw) : null
    const result = {
      ...runIdentity(request),
      type: 'module-result' as const,
      protocolVersion: 2 as const,
      stdout: stdout + (truncated ? '\n[Output truncated]' : ''),
      error: null,
      initialState: initial,
      finalState: isRecord(evidence) ? evidence.finalState : null,
      events: isRecord(evidence) ? evidence.events : [],
    }
    return validModuleResult(request, result)
      ? result
      : moduleFailure(
          request,
          'The operation history does not match your structure. Use the lesson methods and retry.',
          'INVALID_EVIDENCE',
        )
  } catch (error) {
    const message = String(error)
    const code = [
      'EMPTY',
      'INVALID_INDEX',
      'CAPACITY_FULL',
      'INVALID_REFERENCE',
      'CYCLE',
      'EVIDENCE_LIMIT',
      'INVALID_EVIDENCE',
      'INVALID_CAPACITY',
      'INVALID_VALUE',
      'ALREADY_LINKED',
    ].find((code) => message.includes(code))
    const feedback: Record<string, string> = {
      EMPTY: 'There is no item to inspect or remove.',
      INVALID_INDEX:
        'Use an index within the used positions, starting at zero.',
      CAPACITY_FULL:
        'All positions are full. Grow the storage area before inserting.',
      INVALID_REFERENCE:
        'That node reference is missing. Check the node identity.',
      CYCLE:
        'This path returns to an earlier node. Repair the reference and retry.',
      EVIDENCE_LIMIT:
        'This run has too many items or actions. Reset and try a shorter demonstration.',
      INVALID_EVIDENCE:
        'Keep the provided teaching object and use its methods.',
      INVALID_CAPACITY: 'Choose a larger capacity, up to 16.',
      INVALID_VALUE: 'Use a short word or a finite number.',
      ALREADY_LINKED:
        'That node is already connected. Inspect its next reference.',
    }
    return moduleFailure(
      request,
      code
        ? feedback[code]
        : mapPythonError(message).replaceAll('stack', 'structure'),
      code ?? 'EXECUTION_ERROR',
    )
  } finally {
    await pyodide
      .runPythonAsync('_module_scope.clear(); del _module_scope')
      .catch(() => undefined)
  }
}
