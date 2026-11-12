import { describe, expect, it } from 'vitest'
import { executionFixture } from '../../content/modules/catalog'
import {
  applyOperation,
  linkedOrder,
  replayEvidence,
  validState,
  type ModuleState,
} from './structures'

describe('multi-structure operations and evidence', () => {
  it('shifts array identities on insertion/removal and preserves them on replacement', () => {
    const initial = executionFixture('array', 'array-code', 'main')!
    const insert = applyOperation(initial, {
      operation: 'insert',
      args: { index: 1, value: 'X' },
    })
    const remove = applyOperation(
      insert.after,
      { operation: 'remove', args: { index: 2 } },
      1,
    )
    expect(remove.returned).toBe('B')
    expect(
      remove.after.kind === 'array' && remove.after.items.map((i) => i.value),
    ).toEqual(['A', 'X', 'C'])
    expect(replayEvidence(initial, remove.after, [insert, remove])).toBe(true)
    expect(initial.kind === 'array' && initial.items.length).toBe(3)
    expect(
      replayEvidence(initial, initial, [{ ...insert, after: initial }]),
    ).toBe(false)
  })
  it('rejects bounds and full-capacity operations without mutation, allowing grow and retry', () => {
    const initial: ModuleState = {
      kind: 'array',
      capacity: 1,
      items: [{ id: 'a', value: 'A' }],
    }
    for (const index of [-1, 1, 0.5])
      expect(
        applyOperation(initial, { operation: 'get', args: { index } }).after,
      ).toEqual(initial)
    expect(
      applyOperation(initial, {
        operation: 'insert',
        args: { index: 1, value: 'B' },
      }).errorCode,
    ).toBe('CAPACITY_FULL')
    const grown = applyOperation(initial, {
      operation: 'grow',
      args: { capacity: 3 },
    }).after
    expect(
      applyOperation(grown, {
        operation: 'insert',
        args: { index: 1, value: 'B' },
      }).accepted,
    ).toBe(true)
  })
  it('follows references, preserves the successor and detaches removed nodes', () => {
    const initial = executionFixture('linked-list', 'linked-list-code', 'main')!
    const insert = applyOperation(initial, {
      operation: 'insertAfter',
      args: { previousId: 'a', id: 'x' },
    })
    const remove = applyOperation(
      insert.after,
      { operation: 'removeHead', args: {} },
      1,
    )
    expect(
      remove.after.kind === 'linked-list' && linkedOrder(remove.after),
    ).toEqual(['x', 'b'])
    if (remove.after.kind === 'linked-list')
      expect(remove.after.nodes.find((n) => n.id === 'a')!.next).toBe(null)
    expect(replayEvidence(initial, remove.after, [insert, remove])).toBe(true)
  })
  it('detects cycles with bounded traversal while allowing link repair', () => {
    const initial = executionFixture('linked-list', 'linked-list-code', 'main')!
    const cycle = applyOperation(initial, {
      operation: 'link',
      args: { id: 'b', nextId: 'a' },
    })
    if (cycle.after.kind !== 'linked-list') throw new Error('wrong fixture')
    expect(() =>
      linkedOrder(cycle.after as typeof initial & { kind: 'linked-list' }),
    ).toThrow('CYCLE')
    const repaired = applyOperation(cycle.after, {
      operation: 'link',
      args: { id: 'b', nextId: null },
    }).after
    expect(repaired.kind === 'linked-list' && linkedOrder(repaired)).toEqual([
      'a',
      'b',
    ])
  })
  it('records FIFO service and leaves peek unchanged even with duplicate values', () => {
    let state: ModuleState = { kind: 'queue', waiting: [], served: [] }
    const events = ['A', 'A'].map((value, sequence) => {
      const e = applyOperation(
        state,
        { operation: 'enqueue', args: { value } },
        sequence,
      )
      state = e.after
      return e
    })
    const peek = applyOperation(state, { operation: 'peek', args: {} }, 2)
    expect(peek.after).toEqual(state)
    const pop = applyOperation(state, { operation: 'dequeue', args: {} }, 2)
    expect(pop.after.kind === 'queue' && pop.after.served[0].id).toBe('new-0')
    expect(replayEvidence(events[0].before, pop.after, [...events, pop])).toBe(
      true,
    )
    expect(
      applyOperation(
        { kind: 'queue', waiting: [], served: [] },
        { operation: 'dequeue', args: {} },
      ).errorCode,
    ).toBe('EMPTY')
  })
  it('rejects unknown fields, invalid references, nonfinite values and fabricated histories', () => {
    expect(
      validState({ kind: 'array', capacity: 1, items: [], learned: true }),
    ).toBe(false)
    expect(
      validState({
        kind: 'queue',
        waiting: [{ id: 'a', value: Infinity }],
        served: [],
      }),
    ).toBe(false)
    expect(
      validState({ kind: 'linked-list', head: 'missing', nodes: [] }),
    ).toBe(false)
    const state = executionFixture('array', 'array-code', 'main')!
    expect(
      replayEvidence(state, state, [
        { operation: 'get', args: {}, accepted: true },
      ]),
    ).toBe(false)
  })
})
