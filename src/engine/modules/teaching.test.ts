import { describe, expect, it } from 'vitest'
import {
  newTeachingSession,
  reduceTeaching,
  type TeachingDefinition,
} from './teaching'

const def: TeachingDefinition = {
  moduleId: 'queue',
  exerciseId: 'queue-peek',
  ruleId: 'peek-keeps',
  reasonId: 'inspect-not-remove',
  allowedOperations: ['peek'],
  hints: ['Find front.', 'Peek observes.', 'Did anything leave?'],
  demo: {
    id: 'demo',
    initial: { kind: 'queue', waiting: [{ id: 'a', value: 'A' }], served: [] },
    goal: (_, events) =>
      events.some(
        (e) => e.accepted && e.operation === 'peek' && e.returned === 'A',
      ),
  },
  transfer: {
    id: 'transfer',
    initial: { kind: 'queue', waiting: [{ id: 'k', value: 'K' }], served: [] },
    goal: (_, events) =>
      events.some(
        (e) => e.accepted && e.operation === 'peek' && e.returned === 'K',
      ),
  },
}
describe('deterministic teaching gates', () => {
  it('requires observed evidence, correct rule and reason, then an independent transfer', () => {
    let state = reduceTeaching(def, newTeachingSession(def), { type: 'start' })
    state = reduceTeaching(def, state, { type: 'submit-demo' })
    expect(state.phase).toBe('demonstrate')
    state = reduceTeaching(def, state, {
      type: 'operate',
      action: { operation: 'peek', args: {} },
    })
    state = reduceTeaching(def, state, { type: 'submit-demo' })
    expect(state.phase).toBe('correct-rule')
    state = reduceTeaching(def, state, {
      type: 'rule',
      ruleId: def.ruleId,
      reasonId: 'wrong',
    })
    expect(state.phase).toBe('correct-rule')
    state = reduceTeaching(def, state, {
      type: 'rule',
      ruleId: def.ruleId,
      reasonId: def.reasonId,
    })
    expect(state.phase).toBe('transfer-ready')
    state = reduceTeaching(def, state, { type: 'submit-transfer' })
    expect(state.phase).toBe('transfer-ready')
    state = reduceTeaching(def, state, { type: 'start-transfer' })
    expect(state.events).toHaveLength(0)
    state = reduceTeaching(def, state, {
      type: 'operate',
      action: { operation: 'peek', args: {} },
    })
    expect(state.events[0].returned).toBe('K')
    state = reduceTeaching(def, state, { type: 'submit-transfer' })
    expect(state.phase).toBe('learned')
    expect(reduceTeaching(def, state, { type: 'replay' }).phase).toBe('intro')
  })
  it('cannot grant mastery through hints, disallowed actions or a correct terminal state alone', () => {
    let state = newTeachingSession(def)
    for (let i = 0; i < 10; i++)
      state = reduceTeaching(def, state, { type: 'hint' })
    expect(state.hintLevel).toBe(3)
    expect(state.phase).toBe('intro')
    state = reduceTeaching(def, state, { type: 'start' })
    expect(
      reduceTeaching(def, state, {
        type: 'operate',
        action: { operation: 'dequeue', args: {} },
      }),
    ).toEqual(state)
    expect(reduceTeaching(def, state, { type: 'submit-transfer' }).phase).toBe(
      'demonstrate',
    )
  })
  it('rejects identical transfer data and evidence from another exercise', () => {
    expect(() =>
      newTeachingSession({
        ...def,
        transfer: { ...def.transfer, initial: def.demo.initial },
      }),
    ).toThrow()
    const state = { ...newTeachingSession(def), exerciseId: 'queue-first' }
    expect(reduceTeaching(def, state, { type: 'start' })).toEqual(state)
  })
})
