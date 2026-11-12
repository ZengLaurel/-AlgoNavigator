import { describe, it, expect } from 'vitest'
import {
  queueActivities,
  queueCodeInitial,
  queueCodeGoal,
  queueApplyInitial,
  queueApplyGoal,
  queueObservation,
  queuePredictions,
  harbor,
} from './queue'
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
const action = (operation: string, value?: string): ModuleAction => ({
  operation,
  args: value === undefined ? {} : { value },
})
function trace(initial: ModuleState, actions: ModuleAction[]) {
  let state = cloneState(initial)
  const events = actions.map((a, i) => {
    const e = applyOperation(state, a, i)
    state = e.after
    return e
  })
  return { state, events }
}
export const queueSolutions: ModuleAction[][][] = [
  [[action('dequeue')], [action('dequeue')]],
  [[action('enqueue', 'X')], [action('enqueue', 'N')]],
  [[action('peek')], [action('peek')]],
  [
    [action('dequeue'), action('enqueue', 'C'), action('dequeue')],
    [
      action('dequeue'),
      action('enqueue', 'K'),
      action('peek'),
      action('dequeue'),
      action('enqueue', 'L'),
    ],
  ],
]
describe('Queue curriculum', () => {
  it('matches the trusted empty Python fixture and six narrated prediction steps', () => {
    expect(executionFixture('queue', 'queue-code', 'main')).toEqual(
      queueCodeInitial,
    )
    expect(queueObservation.every((x) => x.event.accepted && x.caption)).toBe(
      true,
    )
    expect(queuePredictions).toHaveLength(6)
  })
  it('requires actual ordered enqueue, peek and dequeue evidence for Python', () => {
    const r = trace(queueCodeInitial, [
      action('enqueue', 'A'),
      action('enqueue', 'B'),
      action('peek'),
      action('dequeue'),
      action('enqueue', 'C'),
    ])
    expect(queueCodeGoal(r.state, r.events)).toBe(true)
    expect(queueCodeGoal(r.state, [])).toBe(false)
    const wrong = trace(queueCodeInitial, [
      action('enqueue', 'A'),
      action('peek'),
      action('dequeue'),
      action('enqueue', 'B'),
      action('enqueue', 'C'),
    ])
    expect(queueCodeGoal(wrong.state, wrong.events)).toBe(false)
  })
  it('checks departure history and interleaved service order, not just the final waiting boat', () => {
    const r = trace(queueApplyInitial, [
      action('peek'),
      action('dequeue'),
      action('enqueue', 'green'),
      action('dequeue'),
    ])
    expect(queueApplyGoal(r.state, r.events)).toBe(true)
    expect(queueApplyGoal(r.state, [])).toBe(false)
    const late = trace(queueApplyInitial, [
      action('peek'),
      action('dequeue'),
      action('dequeue'),
      action('enqueue', 'green'),
    ])
    expect(queueApplyGoal(late.state, late.events)).toBe(false)
    expect(
      queueApplyGoal({ ...r.state, served: [] } as ModuleState, r.events),
    ).toBe(false)
  })
  it('keeps peek observational, reports EMPTY without mutation, and supports arrival recovery', () => {
    const empty = harbor([])
    for (const op of ['peek', 'dequeue']) {
      const e = applyOperation(empty, action(op))
      expect(e.errorCode).toBe('EMPTY')
      expect(e.after).toEqual(empty)
    }
    const r = trace(empty, [
      action('dequeue'),
      action('enqueue', 'K'),
      action('peek'),
      action('dequeue'),
    ])
    expect(r.events[2].after).toEqual(r.events[2].before)
    expect(r.state.kind === 'queue' && r.state.waiting).toEqual([])
    expect(
      r.state.kind === 'queue' && r.state.served.map((x) => x.value),
    ).toEqual(['K'])
  })
  it('distinguishes equal-valued boat identities and returns each arrival once', () => {
    const r = trace(harbor(['same', 'same']), [
      action('dequeue'),
      action('enqueue', 'same'),
      action('dequeue'),
    ])
    expect(r.state.kind === 'queue' && r.state.served.map((x) => x.id)).toEqual(
      ['boat-0', 'boat-1'],
    )
    expect(r.state.kind === 'queue' && r.state.waiting[0].id).not.toBe('boat-0')
  })
  for (const [i, def] of queueActivities.entries()) {
    it(`${def.exerciseId}: requires demonstration, explanation and independent transfer`, () => {
      let s = reduceTeaching(def, newTeachingSession(def), { type: 'start' })
      for (const a of queueSolutions[i][0])
        s = reduceTeaching(def, s, { type: 'operate', action: a })
      s = reduceTeaching(def, s, { type: 'submit-demo' })
      expect(s.phase).toBe('correct-rule')
      s = reduceTeaching(def, s, {
        type: 'rule',
        ruleId: def.ruleId,
        reasonId: def.reasonId,
      })
      expect(s.phase).toBe('transfer-ready')
      s = reduceTeaching(def, s, { type: 'start-transfer' })
      for (const a of queueSolutions[i][1])
        s = reduceTeaching(def, s, { type: 'operate', action: a })
      s = reduceTeaching(def, s, { type: 'submit-transfer' })
      expect(s.phase).toBe('learned')
    })
    it(`${def.exerciseId}: rejects empty evidence and wrong explanations; reset cannot award mastery`, () => {
      let s = reduceTeaching(def, newTeachingSession(def), { type: 'start' })
      expect(reduceTeaching(def, s, { type: 'submit-demo' }).phase).toBe(
        'demonstrate',
      )
      for (const a of queueSolutions[i][0])
        s = reduceTeaching(def, s, { type: 'operate', action: a })
      s = reduceTeaching(def, s, { type: 'submit-demo' })
      s = reduceTeaching(def, s, {
        type: 'rule',
        ruleId: def.ruleId,
        reasonId: 'wrong',
      })
      expect(s.phase).toBe('correct-rule')
      s = reduceTeaching(def, s, { type: 'reset' })
      expect(s.events).toHaveLength(0)
      expect(s.phase).not.toBe('learned')
    })
  }
})
