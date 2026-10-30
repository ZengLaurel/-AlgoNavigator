import type { StructureState } from '../structures/types'

export interface ExecResult {
  stdout: string
  error: string | null
  finalState: StructureState | null
}

export type PyodideStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error'
