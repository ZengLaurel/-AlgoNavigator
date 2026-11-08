export const ADVENTURE_PROGRESS_KEY = 'algonavigator.adventure-progress.v1'

/** Only completed, shipped modules count; visiting a room never awards a gem. */
export function readStackCompleted(): boolean {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(ADVENTURE_PROGRESS_KEY) ?? 'null',
    )
    return (
      typeof value === 'object' &&
      value !== null &&
      'stackCompleted' in value &&
      value.stackCompleted === true
    )
  } catch {
    return false
  }
}

export function saveStackCompleted(): boolean {
  try {
    window.localStorage.setItem(
      ADVENTURE_PROGRESS_KEY,
      JSON.stringify({ stackCompleted: true }),
    )
    return true
  } catch {
    // Keep the game usable when browser storage is unavailable or full.
    return false
  }
}
