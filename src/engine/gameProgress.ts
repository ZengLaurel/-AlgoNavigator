/** Only room unlocks are persisted; never student code, paths or identity. */
export const GAME_PROGRESS_KEY = 'algonavigator.stack-ruins.progress'
export type GameProgress = { version: 1; unlockedThrough: 1 | 2 | 3 }
export const initialProgress: GameProgress = { version: 1, unlockedThrough: 1 }
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>
const browserStorage: StorageAccess = () => window.localStorage

export function parseProgress(raw: string | null): GameProgress {
  try {
    const value: unknown = JSON.parse(raw ?? 'null')
    if (
      value !== null &&
      typeof value === 'object' &&
      Object.keys(value).length === 2 &&
      'version' in value &&
      value.version === 1 &&
      'unlockedThrough' in value &&
      (value.unlockedThrough === 1 ||
        value.unlockedThrough === 2 ||
        value.unlockedThrough === 3)
    )
      return { version: 1, unlockedThrough: value.unlockedThrough }
  } catch {
    /* Corrupt JSON is equivalent to no saved progress. */
  }
  return { ...initialProgress }
}

export function loadProgress(
  storage: StorageAccess = browserStorage,
): GameProgress {
  try {
    return parseProgress(storage().getItem(GAME_PROGRESS_KEY))
  } catch {
    return { ...initialProgress }
  }
}

export function saveProgress(
  progress: GameProgress,
  storage: StorageAccess = browserStorage,
): boolean {
  try {
    storage().setItem(GAME_PROGRESS_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}
