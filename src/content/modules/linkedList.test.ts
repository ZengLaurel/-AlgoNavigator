import { describe, it, expect } from 'vitest'
import {
  linkedActivities,
  linkedCodeInitial,
  linkedCodeGoal,
  linkedApplyInitial,
  linkedApplyGoal,
  linkedObservation,
  linkedPredictions,
  forest,
  pathIs,
} from './linkedList'
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
const action = (
  operation: string,
  args: ModuleAction['args'] = {},
): ModuleAction => ({ operation, args })
function trace(initial: ModuleState, actions: ModuleAction[]) {
  let state = cloneState(initial)
  const events = actions.map((a, i) => {
    const e = applyOperation(state, a, i)
    state = e.after
    return e
  })
  return { state, events }
}
export const linkedSolutions: ModuleAction[][][] = [
  [
    [
      action('visit', { id: 'a' }),
      action('visit', { id: 'c' }),
      action('visit', { id: 'b' }),
    ],
    [action('visit', { id: 'k' }), action('visit', { id: 'm' })],
  ],
  [[action('insertHead', { id: 'x' })], [action('insertHead', { id: 'k' })]],
  [
    [
      action('link', { id: 'x', nextId: 'b' }),
      action('link', { id: 'a', nextId: 'x' }),
    ],
    [
      action('link', { id: 'm', nextId: null }),
      action('link', { id: 'k', nextId: 'm' }),
    ],
  ],
  [[action('removeAfter', { previousId: 'a' })], [action('removeHead')]],
]
describe('Linked list curriculum', () => {
  it('uses the trusted fixture and six valid narrated prediction steps', () => {
    expect(executionFixture('linked-list', 'linked-list-code', 'main')).toEqual(
      linkedCodeInitial,
    )
    expect(linkedObservation.every((x) => x.event.accepted && x.caption)).toBe(
      true,
    )
    expect(linkedPredictions).toHaveLength(6)
  })
  it('requires real reference edits, the full path and ordered visits for Python', () => {
    const r = trace(linkedCodeInitial, [
      ...linkedSolutions[2][0],
      action('visit', { id: 'a' }),
      action('visit', { id: 'x' }),
      action('visit', { id: 'b' }),
    ])
    expect(linkedCodeGoal(r.state, r.events)).toBe(true)
    expect(linkedCodeGoal(r.state, [])).toBe(false)
    expect(linkedCodeGoal(r.state, r.events.slice(0, -1))).toBe(false)
  })
  it('rejects cycles, invalid IDs and supports reference repair without dropping nodes', () => {
    const cycle = trace(linkedCodeInitial, [
      action('link', { id: 'b', nextId: 'a' }),
    ])
    expect(pathIs(cycle.state, ['a', 'b'])).toBe(false)
    const repair = applyOperation(
      cycle.state,
      action('link', { id: 'b', nextId: null }),
      1,
    )
    expect(pathIs(repair.after, ['a', 'b'])).toBe(true)
    const invalid = applyOperation(
      repair.after,
      action('link', { id: 'a', nextId: 'missing' }),
    )
    expect(invalid.accepted).toBe(false)
    expect(invalid.after).toEqual(repair.after)
  })
  it('awards delivery only with removal, insertion and ordered complete traversal', () => {
    const ops = [
      action('removeAfter', { previousId: 'p' }),
      action('insertAfter', { previousId: 'p', id: 'x' }),
      ...['p', 'x', 'r'].map((id) => action('visit', { id })),
    ]
    const r = trace(linkedApplyInitial, ops)
    expect(linkedApplyGoal(r.state, r.events)).toBe(true)
    expect(linkedApplyGoal(r.state, [])).toBe(false)
    const wrong = trace(linkedApplyInitial, [
      ...ops.slice(0, 2),
      ...['r', 'x', 'p'].map((id) => action('visit', { id })),
    ])
    expect(linkedApplyGoal(wrong.state, wrong.events)).toBe(false)
  })
  it('handles empty removal, single-node removal and equal-valued node identities', () => {
    const empty = forest(null, [])
    expect(applyOperation(empty, action('removeHead')).errorCode).toBe('EMPTY')
    const one = forest('k', [['k', 'same', null]])
    expect(pathIs(applyOperation(one, action('removeHead')).after, [])).toBe(
      true,
    )
    expect(pathIs(linkedActivities[0].demo.initial, ['a', 'c', 'b'])).toBe(true)
  })
  for (const [i, def] of linkedActivities.entries()) {
    it(`${def.exerciseId}: learns only after demonstration, explanation and fresh transfer`, () => {
      let s = newTeachingSession(def)
      s = reduceTeaching(def, s, { type: 'start' })
      for (const a of linkedSolutions[i][0])
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
      for (const a of linkedSolutions[i][1])
        s = reduceTeaching(def, s, { type: 'operate', action: a })
      s = reduceTeaching(def, s, { type: 'submit-transfer' })
      expect(s.phase).toBe('learned')
    })
    it(`${def.exerciseId}: rejects empty evidence, wrong reasons and reset mastery`, () => {
      let s = reduceTeaching(def, newTeachingSession(def), { type: 'start' })
      expect(reduceTeaching(def, s, { type: 'submit-demo' }).phase).toBe(
        'demonstrate',
      )
      for (const a of linkedSolutions[i][0])
        s = reduceTeaching(def, s, { type: 'operate', action: a })
      s = reduceTeaching(def, s, { type: 'submit-demo' })
      s = reduceTeaching(def, s, {
        type: 'rule',
        ruleId: def.ruleId,
        reasonId: 'wrong',
      })
      expect(s.phase).toBe('correct-rule')
      s = reduceTeaching(def, s, { type: 'reset' })
      expect(s.phase).not.toBe('learned')
      expect(s.events).toHaveLength(0)
    })
  }
})
