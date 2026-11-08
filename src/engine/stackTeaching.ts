import type { PracticeExample, PracticeKind } from '../content/stackPractice'

export type TeachingAction = 'push' | 'pop' | 'ignore' | 'peek'
export interface TeachingRun {
  cursor: number
  stack: string[]
  message: 0 | 1
  first: string | null
  discard: boolean
}
export const newTeachingRun = (): TeachingRun => ({
  cursor: 0,
  stack: [],
  message: 0,
  first: null,
  discard: false,
})
export function currentInput(
  example: PracticeExample,
  run: TeachingRun,
): string {
  return run.message === 1 ? (example.other ?? '') : example.input
}
export function runFinished(
  kind: PracticeKind,
  example: PracticeExample,
  run: TeachingRun,
): boolean {
  if (kind === 'build')
    return !run.discard && run.stack.join('') === example.target
  return (
    run.cursor === currentInput(example, run).length &&
    (kind !== 'backspace' || run.message === 1)
  )
}
export function expectedTeachingAction(
  kind: PracticeKind,
  example: PracticeExample,
  run: TeachingRun,
): TeachingAction | null {
  if (runFinished(kind, example, run)) return null
  if (run.discard) return 'pop'
  const token = currentInput(example, run)[run.cursor]
  if (kind === 'backspace' && token === '#')
    return run.stack.length ? 'pop' : 'ignore'
  if (kind === 'stars' && token === '*') return 'pop'
  if (kind === 'pairs' && token === run.stack.at(-1)) return 'pop'
  return 'push'
}
export function teachStep(
  kind: PracticeKind,
  example: PracticeExample,
  run: TeachingRun,
  action: TeachingAction,
): { run: TeachingRun; correct: boolean } {
  if (
    action === 'peek' ||
    action !== expectedTeachingAction(kind, example, run)
  )
    return { run, correct: false }
  if (action === 'pop' && !run.stack.length) return { run, correct: false }
  const token = currentInput(example, run)[run.cursor]
  const next: TeachingRun = { ...run, stack: [...run.stack] }
  if (action === 'push') next.stack.push(token)
  if (action === 'pop') next.stack.pop()
  if (run.discard) next.discard = false
  else {
    next.cursor++
    if (kind === 'build' && !example.target?.includes(token))
      next.discard = true
  }
  if (
    kind === 'backspace' &&
    next.message === 0 &&
    next.cursor === example.input.length
  ) {
    next.first = next.stack.join('')
    next.stack = []
    next.cursor = 0
    next.message = 1
  }
  return { run: next, correct: true }
}
export function teachingRuleCorrect(rule: string, reason: string): boolean {
  return rule === 'lifo' && reason === 'top'
}

export const TEACHING_PROGRESS_KEY = 'algonavigator.stack-teaching.v1'
export interface TeachingProgress {
  version: 1
  unlocked: boolean
  mastered: string[]
}
const knownIds = ['build', 'backspace', 'stars', 'pairs']
export function loadTeachingProgress(): TeachingProgress {
  const empty: TeachingProgress = { version: 1, unlocked: false, mastered: [] }
  try {
    const value = JSON.parse(
      localStorage.getItem(TEACHING_PROGRESS_KEY) ?? 'null',
    )
    if (
      !value ||
      value.version !== 1 ||
      typeof value.unlocked !== 'boolean' ||
      !Array.isArray(value.mastered)
    )
      return empty
    return {
      version: 1,
      unlocked: value.unlocked,
      mastered: value.unlocked
        ? knownIds.filter((id) => value.mastered.includes(id))
        : [],
    }
  } catch {
    return empty
  }
}
export function saveTeachingProgress(progress: TeachingProgress): boolean {
  try {
    localStorage.setItem(
      TEACHING_PROGRESS_KEY,
      JSON.stringify({
        version: 1,
        unlocked: progress.unlocked,
        mastered: knownIds.filter((id) => progress.mastered.includes(id)),
      }),
    )
    return true
  } catch {
    return false
  }
}
