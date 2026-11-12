import type { ExecResult } from './types'
import type { ModuleRunRequest, ModuleRunResult } from './moduleExecution'

export type WorkerRequest =
  | ModuleRunRequest
  | { type: 'init'; requestId: number }
  | { type: 'run'; requestId: number; code: string }

export type WorkerResponse =
  | ModuleRunResult
  | { type: 'ready'; requestId: number }
  | { type: 'init-error'; requestId: number; error: string }
  | { type: 'result'; requestId: number; result: ExecResult }
