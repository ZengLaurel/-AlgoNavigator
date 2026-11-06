import type { ExecResult } from './types'

export type WorkerRequest =
  | { type: 'init'; requestId: number }
  | { type: 'run'; requestId: number; code: string }

export type WorkerResponse =
  | { type: 'ready'; requestId: number }
  | { type: 'init-error'; requestId: number; error: string }
  | { type: 'result'; requestId: number; result: ExecResult }
