import { createProgressStore } from './engine/modules/progress'
export const ADVENTURE_PROGRESS_KEY = 'algonavigator.adventure-progress.v1'

/** Only completed, shipped modules count; visiting a room never awards a gem. */
export function readStackCompleted(): boolean {
  return createProgressStore().read().modules.stack.completed
}

export function saveStackCompleted(): boolean {
  return createProgressStore().complete('stack')
}
