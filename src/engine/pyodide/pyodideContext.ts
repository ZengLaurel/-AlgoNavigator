import { createContext, useContext } from 'react'
import type { ExecResult, PyodideStatus } from './types'
import type { ModuleRunInput } from './moduleRunner'
import type { ModuleRunResult } from './moduleExecution'

export interface PyodideContextValue {
  status: PyodideStatus
  run: (code: string) => Promise<ExecResult>
  runModule?: (input: ModuleRunInput) => Promise<ModuleRunResult>
  cancelModule?: () => void
}

export const PyodideContext = createContext<PyodideContextValue | null>(null)

export function usePyodide() {
  const context = useContext(PyodideContext)
  if (!context) {
    throw new Error('usePyodide must be used inside PyodideProvider')
  }
  return context
}
