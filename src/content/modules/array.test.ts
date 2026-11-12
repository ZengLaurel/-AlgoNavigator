import { describe, expect, it } from 'vitest'
import {
  arrayActivities,
  arrayApplyGoal,
  arrayApplyInitial,
  arrayCodeGoal,
  arrayCodeInitial,
  arrayObservation,
  arrayPredictions,
} from './array'
import {
  applyOperation,
  cloneState,
  type ModuleAction,
  type ModuleState,
} from '../../engine/modules/structures'
import {
  newTeachingSession,
  reduceTeaching,
} from '../../engine/modules/teaching'
import { executionFixture } from './catalog'

function trace(initial: ModuleState, actions: ModuleAction[]) {
  let state = cloneState(initial)
  const events = actions.map((a, i) => {
    const e = applyOperation(state, a, i)
    state = e.after
    return e
  })
  return { state, events }
}
export const arraySolutions: Record<string, [ModuleAction[], ModuleAction[]]> =
  {
    'array-index': [
      [{ operation: 'get', args: { index: 0 } }],
      [{ operation: 'get', args: { index: 2 } }],
    ],
    'array-insert': [
      [{ operation: 'insert', args: { index: 1, value: 'X' } }],
      [{ operation: 'insert', args: { index: 1, value: 'M' } }],
    ],
    'array-remove': [
      [{ operation: 'remove', args: { index: 1 } }],
      [{ operation: 'remove', args: { index: 0 } }],
    ],
    'array-grow': [
      [
        { operation: 'grow', args: { capacity: 4 } },
        { operation: 'insert', args: { index: 2, value: 'C' } },
      ],
      [
        { operation: 'grow', args: { capacity: 5 } },
        { operation: 'insert', args: { index: 3, value: 'N' } },
      ],
    ],
  }
describe('Array curriculum and teaching evidence', () => {
  it('covers all six operation families and prediction checks with a trusted Python initial state', () => {
    expect(arrayObservation.map((s) => s.event.operation)).toEqual([
      'get',
      'set',
      'insert',
      'remove',
      'traverse',
      'grow',
    ])
    expect(
      arrayObservation.every((s) => s.event.accepted && Boolean(s.caption)),
    ).toBe(true)
    expect(arrayPredictions).toHaveLength(6)
    expect(executionFixture('array', 'array-code', 'main')).toEqual(
      arrayCodeInitial,
    )
  })
  it('requires actual insert/set/remove evidence and correct retained identities for Python completion', () => {
    const run = trace(arrayCodeInitial, [
      { operation: 'insert', args: { index: 1, value: 'X' } },
      { operation: 'set', args: { index: 3, value: 'D' } },
      { operation: 'remove', args: { index: 2 } },
    ])
    expect(arrayCodeGoal(run.state, run.events)).toBe(true)
    expect(arrayCodeGoal(run.state, [])).toBe(false)
    expect(
      arrayCodeGoal(
        { ...run.state, items: [{ id: 'fake', value: 'A' }] } as ModuleState,
        run.events,
      ),
    ).toBe(false)
  })
  it('requires growth, preserved supplies, removal and a final observation in Camp Packing', () => {
    const actions: ModuleAction[] = [
      { operation: 'grow', args: { capacity: 5 } },
      { operation: 'insert', args: { index: 1, value: 'map' } },
      { operation: 'remove', args: { index: 2 } },
      { operation: 'traverse', args: {} },
    ]
    const run = trace(arrayApplyInitial, actions)
    expect(arrayApplyGoal(run.state, run.events)).toBe(true)
    const missing = trace(arrayApplyInitial, actions.slice(0, -1))
    expect(arrayApplyGoal(missing.state, missing.events)).toBe(false)
    expect(arrayApplyGoal(run.state, [])).toBe(false)
  })
  it.each(arrayActivities)(
    '$exerciseId needs demonstration, structured correction and fresh transfer',
    (activity) => {
      const [demo, transfer] = arraySolutions[activity.exerciseId]
      let session = reduceTeaching(activity, newTeachingSession(activity), {
        type: 'start',
      })
      session = reduceTeaching(activity, session, { type: 'submit-demo' })
      expect(session.phase).toBe('demonstrate')
      for (const action of demo)
        session = reduceTeaching(activity, session, { type: 'operate', action })
      session = reduceTeaching(activity, session, { type: 'submit-demo' })
      expect(session.phase).toBe('correct-rule')
      session = reduceTeaching(activity, session, {
        type: 'rule',
        ruleId: activity.ruleId,
        reasonId: 'wrong',
      })
      expect(session.phase).toBe('correct-rule')
      session = reduceTeaching(activity, session, {
        type: 'rule',
        ruleId: activity.ruleId,
        reasonId: activity.reasonId,
      })
      expect(session.phase).toBe('transfer-ready')
      session = reduceTeaching(activity, session, { type: 'start-transfer' })
      expect(session.events).toHaveLength(0)
      for (const action of transfer)
        session = reduceTeaching(activity, session, { type: 'operate', action })
      session = reduceTeaching(activity, session, { type: 'submit-transfer' })
      expect(session.phase).toBe('learned')
      expect(activity.hints).toHaveLength(3)
    },
  )
  it.each(arrayActivities)(
    '$exerciseId cannot learn from hints, unrequested outcomes or replay',
    (activity) => {
      let s = newTeachingSession(activity)
      for (let i = 0; i < 5; i++)
        s = reduceTeaching(activity, s, { type: 'hint' })
      expect(s.hintLevel).toBe(3)
      expect(s.phase).toBe('intro')
      s = reduceTeaching(activity, s, { type: 'start' })
      const bad =
        activity.exerciseId === 'array-grow'
          ? { operation: 'insert', args: { index: 0, value: 'BAD' } }
          : {
              operation: activity.allowedOperations[0],
              args:
                activity.exerciseId === 'array-index'
                  ? { index: 99 }
                  : activity.exerciseId === 'array-insert'
                    ? { index: 0, value: 'BAD' }
                    : { index: 99 },
            }
      s = reduceTeaching(activity, s, {
        type: 'operate',
        action: bad as ModuleAction,
      })
      s = reduceTeaching(activity, s, { type: 'submit-demo' })
      expect(s.phase).toBe('demonstrate')
      expect(
        reduceTeaching(activity, s, { type: 'reset' }).events,
      ).toHaveLength(0)
      expect(reduceTeaching(activity, s, { type: 'replay' }).phase).toBe(
        'intro',
      )
    },
  )
})
