import { afterEach, describe, expect, it, vi } from 'vitest'
import { stackPractice } from '../content/stackPractice'
import {
  expectedTeachingAction,
  loadTeachingProgress,
  newTeachingRun,
  runFinished,
  saveTeachingProgress,
  teachStep,
  teachingRuleCorrect,
  TEACHING_PROGRESS_KEY,
} from './stackTeaching'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})
describe('teaching stack actions and transfer cases', () => {
  it.each([
    ['build', 0, '24', null],
    ['build', 1, '135', null],
    ['backspace', 0, 'mp', 'mp'],
    ['backspace', 1, '', 'r'],
    ['stars', 0, 'sra', null],
    ['stars', 1, 'ms', null],
    ['pairs', 0, 'q', null],
    ['pairs', 1, 'ay', null],
  ] as const)(
    '%s example %i finishes with expected survivors %s and first-message result %s',
    (id, variant, survivors, first) => {
      const exercise = stackPractice.find((item) => item.id === id)!
      const example = exercise.examples[variant]
      let run = newTeachingRun()
      let steps = 0
      while (!runFinished(exercise.kind, example, run) && steps++ < 100) {
        const action = expectedTeachingAction(exercise.kind, example, run)!
        const next = teachStep(exercise.kind, example, run, action)
        expect(next.correct).toBe(true)
        run = next.run
      }
      expect(steps).toBeLessThan(100)
      expect(run.stack.join('')).toBe(survivors)
      expect(run.first).toBe(first)
    },
  )
  it('requires pushing an unwanted crate before popping it, without consuming the following crate', () => {
    const example = { input: '123', target: '2' }
    const start = newTeachingRun()
    const pushed = teachStep('build', example, start, 'push').run
    expect(start.stack).toEqual([])
    expect(pushed).toMatchObject({ stack: ['1'], cursor: 1, discard: true })
    expect(teachStep('build', example, pushed, 'push').run).toBe(pushed)
    const popped = teachStep('build', example, pushed, 'pop').run
    expect(popped).toMatchObject({ stack: [], cursor: 1, discard: false })
  })
  it('ignores a backspace on empty text and never mutates on a wrong action or peek', () => {
    const start = newTeachingRun()
    const example = { input: '#a', other: 'a' }
    expect(teachStep('backspace', example, start, 'pop').run).toBe(start)
    expect(teachStep('backspace', example, start, 'peek').run).toBe(start)
    expect(teachStep('backspace', example, start, 'ignore').run.cursor).toBe(1)
  })
  it('stops build operations immediately at target, even with unread input', () => {
    const example = { input: '123', target: '1' }
    const run = teachStep('build', example, newTeachingRun(), 'push').run
    expect(runFinished('build', example, run)).toBe(true)
    expect(teachStep('build', example, run, 'push').run).toBe(run)
  })
  it('requires both LIFO and a top-only reason instead of accepting arbitrary free text', () => {
    expect(teachingRuleCorrect('lifo', 'top')).toBe(true)
    expect(teachingRuleCorrect('fifo', 'top')).toBe(false)
    expect(teachingRuleCorrect('lifo', 'anywhere')).toBe(false)
    expect(teachingRuleCorrect('', '')).toBe(false)
  })
  it('loads only known mastered IDs, deduplicates them and preserves no explanations', () => {
    localStorage.setItem(
      TEACHING_PROGRESS_KEY,
      JSON.stringify({
        version: 1,
        unlocked: true,
        mastered: ['pairs', 'pairs', 'unknown'],
        explanation: 'private',
      }),
    )
    expect(loadTeachingProgress()).toEqual({
      version: 1,
      unlocked: true,
      mastered: ['pairs'],
    })
    saveTeachingProgress(loadTeachingProgress())
    expect(localStorage.getItem(TEACHING_PROGRESS_KEY)).not.toContain('private')
  })
  it.each([
    '{broken',
    'null',
    '{"version":2}',
    '{"version":1,"unlocked":true,"mastered":{}}',
  ])('rejects corrupt or unsupported progress: %s', (raw) => {
    localStorage.setItem(TEACHING_PROGRESS_KEY, raw)
    expect(loadTeachingProgress()).toEqual({
      version: 1,
      unlocked: false,
      mastered: [],
    })
  })
  it('continues without persistence when browser storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Full')
    })
    expect(loadTeachingProgress().unlocked).toBe(false)
    expect(
      saveTeachingProgress({ version: 1, unlocked: true, mastered: [] }),
    ).toBe(false)
  })
})
