import { createContext, useContext } from 'react'
import type { ExecResult, PyodideStatus } from './types'

export interface PyodideContextValue {
  status: PyodideStatus
  run: (code: string) => Promise<ExecResult>
}

export const PyodideContext = createContext<PyodideContextValue | null>(null)

export function usePyodide() {
  const context = useContext(PyodideContext)
  if (!context) {
    throw new Error('usePyodide must be used inside PyodideProvider')
  }
  return context
}
