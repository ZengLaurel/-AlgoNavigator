import { createContext, useContext, useState } from 'react'
import { createProgressStore } from './progress'

export const ModuleProgressContext = createContext<ReturnType<
  typeof createProgressStore
> | null>(null)
/** App supplies one memory source. Standalone room fixtures get an isolated fallback. */
export function useModuleProgressStore() {
  const shared = useContext(ModuleProgressContext)
  const [fallback] = useState(() => createProgressStore())
  return shared ?? fallback
}
