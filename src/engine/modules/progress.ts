import { exerciseIds, isModuleId } from '../../content/modules/catalog'
import { exactKeys, isRecord, MODULE_IDS, type ModuleId } from './structures'

export const MODULE_PROGRESS_KEY = 'algonavigator.modules-progress.v2'
export type ModuleProgress = {
  unlockedThrough: 1 | 2 | 3
  completed: boolean
  teachingUnlocked: boolean
  mastered: string[]
}
export type ProgressV2 = {
  version: 2
  modules: Record<ModuleId, ModuleProgress>
}
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
export const emptyModule = (): ModuleProgress => ({
  unlockedThrough: 1,
  completed: false,
  teachingUnlocked: false,
  mastered: [],
})
export const emptyProgress = (): ProgressV2 => ({
  version: 2,
  modules: Object.fromEntries(
    MODULE_IDS.map((id) => [id, emptyModule()]),
  ) as ProgressV2['modules'],
})
function parseModule(value: unknown, id: ModuleId): ModuleProgress {
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      'unlockedThrough',
      'completed',
      'teachingUnlocked',
      'mastered',
    ]) ||
    ![1, 2, 3].includes(value.unlockedThrough as number) ||
    typeof value.completed !== 'boolean' ||
    typeof value.teachingUnlocked !== 'boolean' ||
    !Array.isArray(value.mastered) ||
    value.mastered.some((v) => typeof v !== 'string') ||
    (value.completed &&
      (value.unlockedThrough !== 3 || !value.teachingUnlocked)) ||
    (value.mastered.length > 0 && !value.teachingUnlocked)
  )
    return emptyModule()
  return {
    unlockedThrough: value.unlockedThrough as 1 | 2 | 3,
    completed: value.completed,
    teachingUnlocked: value.teachingUnlocked,
    mastered: [
      ...new Set(value.mastered.filter((v) => exerciseIds[id].includes(v))),
    ].sort(),
  }
}
export function parseModuleProgress(value: unknown): ProgressV2 {
  const next = emptyProgress()
  if (
    !isRecord(value) ||
    !exactKeys(value, ['version', 'modules']) ||
    value.version !== 2 ||
    !isRecord(value.modules) ||
    !exactKeys(value.modules, [...MODULE_IDS])
  )
    return next
  for (const id of MODULE_IDS)
    next.modules[id] = parseModule(value.modules[id], id)
  return next
}
function merge(a: ModuleProgress, b: ModuleProgress): ModuleProgress {
  const completed = a.completed || b.completed
  return {
    unlockedThrough: completed
      ? 3
      : (Math.max(a.unlockedThrough, b.unlockedThrough) as 1 | 2 | 3),
    completed,
    teachingUnlocked: completed || a.teachingUnlocked || b.teachingUnlocked,
    mastered: [...new Set([...a.mastered, ...b.mastered])].sort(),
  }
}
/** Each owner keeps its own memory fallback; no global student state leaks between sessions/tests. */
export function createProgressStore(
  storage: () => StorageLike = () => window.localStorage,
) {
  const listeners = new Set<() => void>()
  let memory = emptyProgress()
  let available = true
  let futureVersion = false
  const readJson = (key: string): unknown => {
    const raw = storage().getItem(key)
    try {
      return JSON.parse(raw ?? 'null')
    } catch {
      return null
    }
  }
  function read(): ProgressV2 {
    try {
      const saved = readJson(MODULE_PROGRESS_KEY)
      futureVersion =
        isRecord(saved) &&
        Object.hasOwn(saved, 'version') &&
        saved.version !== 2
      const next = parseModuleProgress(saved)
      const legacy = emptyModule()
      const room = readJson('algonavigator.stack-ruins.progress')
      if (
        isRecord(room) &&
        exactKeys(room, ['version', 'unlockedThrough']) &&
        room.version === 1 &&
        [1, 2, 3].includes(room.unlockedThrough as number)
      )
        legacy.unlockedThrough = room.unlockedThrough as 1 | 2 | 3
      const teaching = readJson('algonavigator.stack-teaching.v1')
      if (
        isRecord(teaching) &&
        exactKeys(teaching, ['version', 'unlocked', 'mastered']) &&
        teaching.version === 1 &&
        typeof teaching.unlocked === 'boolean' &&
        Array.isArray(teaching.mastered)
      ) {
        legacy.teachingUnlocked = teaching.unlocked
        const mastered = teaching.mastered
        legacy.mastered = teaching.unlocked
          ? exerciseIds.stack.filter((id) => mastered.includes(id))
          : []
      }
      const gem = readJson('algonavigator.adventure-progress.v1')
      if (
        isRecord(gem) &&
        exactKeys(gem, ['stackCompleted']) &&
        gem.stackCompleted === true
      ) {
        legacy.completed = true
        legacy.unlockedThrough = 3
        legacy.teachingUnlocked = true
      }
      next.modules.stack = merge(next.modules.stack, legacy)
      for (const id of MODULE_IDS)
        next.modules[id] = merge(next.modules[id], memory.modules[id])
      memory = next
      // A successful read cannot erase an earlier quota/write failure. Only a
      // successful write proves that the in-memory progress is persisted.
      if (futureVersion) available = false
    } catch {
      available = false
    }
    return structuredClone(memory)
  }
  function update(id: ModuleId, change: Partial<ModuleProgress>): boolean {
    if (!isModuleId(id)) return false
    read()
    const candidate = parseModule({ ...memory.modules[id], ...change }, id)
    memory.modules[id] = merge(memory.modules[id], candidate)
    if (futureVersion) {
      available = false
      listeners.forEach((listener) => listener())
      return false
    }
    try {
      storage().setItem(MODULE_PROGRESS_KEY, JSON.stringify(memory))
      available = true
    } catch {
      available = false
    }
    listeners.forEach((listener) => listener())
    return available
  }
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    read,
    update,
    available: () => available,
    complete: (id: ModuleId) =>
      update(id, {
        unlockedThrough: 3,
        completed: true,
        teachingUnlocked: true,
      }),
    master: (id: ModuleId, exerciseId: string) => {
      const current = read().modules[id]
      if (!current.teachingUnlocked || !exerciseIds[id].includes(exerciseId))
        return false
      return update(id, { mastered: [...current.mastered, exerciseId] })
    },
  }
}
