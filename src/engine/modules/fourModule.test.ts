import { describe, it, expect } from 'vitest'
import { arrayActivities } from '../../content/modules/array'
import { linkedActivities } from '../../content/modules/linkedList'
import { queueActivities } from '../../content/modules/queue'
import { newTeachingSession, reduceTeaching } from './teaching'
import { createProgressStore } from './progress'
import { MODULE_IDS, type ModuleAction } from './structures'
const a = (
  operation: string,
  args: ModuleAction['args'] = {},
): ModuleAction => ({ operation, args })
const v = (id: string) => a('visit', { id })
const q = (op: string, value?: string) =>
  a(op, value === undefined ? {} : { value })
const cases = [
  [arrayActivities[0], [a('get', { index: 0 })], [a('get', { index: 2 })]],
  [
    arrayActivities[1],
    [a('insert', { index: 1, value: 'X' })],
    [a('insert', { index: 1, value: 'M' })],
  ],
  [
    arrayActivities[2],
    [a('remove', { index: 1 })],
    [a('remove', { index: 0 })],
  ],
  [
    arrayActivities[3],
    [a('grow', { capacity: 4 }), a('insert', { index: 2, value: 'C' })],
    [a('grow', { capacity: 5 }), a('insert', { index: 3, value: 'N' })],
  ],
  [linkedActivities[0], [v('a'), v('c'), v('b')], [v('k'), v('m')]],
  [
    linkedActivities[1],
    [a('insertHead', { id: 'x' })],
    [a('insertHead', { id: 'k' })],
  ],
  [
    linkedActivities[2],
    [a('link', { id: 'x', nextId: 'b' }), a('link', { id: 'a', nextId: 'x' })],
    [a('link', { id: 'm', nextId: null }), a('link', { id: 'k', nextId: 'm' })],
  ],
  [
    linkedActivities[3],
    [a('removeAfter', { previousId: 'a' })],
    [a('removeHead')],
  ],
  [queueActivities[0], [q('dequeue')], [q('dequeue')]],
  [queueActivities[1], [q('enqueue', 'X')], [q('enqueue', 'N')]],
  [queueActivities[2], [q('peek')], [q('peek')]],
  [
    queueActivities[3],
    [q('dequeue'), q('enqueue', 'C'), q('dequeue')],
    [q('enqueue', 'K'), q('peek'), q('dequeue'), q('enqueue', 'L')],
  ],
] as const
describe('four-module joint acceptance', () => {
  for (const [def, demo, transfer] of cases)
    it(`${def.exerciseId}: wrong rule, empty transfer, reset, replay and cross-task isolation`, () => {
      let s = reduceTeaching(def, newTeachingSession(def), { type: 'start' })
      expect(
        reduceTeaching(def, s, { type: 'operate', action: a('unknown') }),
      ).toEqual(s)
      for (const action of demo)
        s = reduceTeaching(def, s, { type: 'operate', action })
      s = reduceTeaching(def, s, { type: 'submit-demo' })
      expect(s.phase).toBe('correct-rule')
      s = reduceTeaching(def, s, {
        type: 'rule',
        ruleId: 'wrong',
        reasonId: def.reasonId,
      })
      expect(s.phase).toBe('correct-rule')
      s = reduceTeaching(def, s, {
        type: 'rule',
        ruleId: def.ruleId,
        reasonId: def.reasonId,
      })
      s = reduceTeaching(def, s, { type: 'start-transfer' })
      expect(reduceTeaching(def, s, { type: 'submit-transfer' }).phase).toBe(
        'transfer',
      )
      s = reduceTeaching(def, s, {
        type: 'operate',
        action: a(def.allowedOperations[0], {
          index: 999,
          id: 'missing',
          value: 'wrong',
        }),
      })
      expect(reduceTeaching(def, s, { type: 'submit-transfer' }).phase).toBe(
        'transfer',
      )
      s = reduceTeaching(def, s, { type: 'reset' })
      expect(s.phase).toBe('transfer')
      expect(s.events).toHaveLength(0)
      for (const action of transfer)
        s = reduceTeaching(def, s, { type: 'operate', action })
      s = reduceTeaching(def, s, { type: 'submit-transfer' })
      expect(s.phase).toBe('learned')
      expect(
        reduceTeaching(def, { ...s, exerciseId: 'other' }, { type: 'replay' })
          .exerciseId,
      ).toBe('other')
      const replay = reduceTeaching(def, s, { type: 'replay' })
      expect(replay.phase).toBe('intro')
      expect(replay.events).toHaveLength(0)
    })
  it('retains one gem per module through blocked writes and retry without cross-topic mastery', () => {
    const saved = new Map<string, string>()
    let blocked = true
    const disk = {
      getItem: (k: string) => saved.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (blocked) throw Error('quota')
        saved.set(k, v)
      },
    }
    const store = createProgressStore(() => disk)
    for (const id of MODULE_IDS) {
      store.complete(id)
      store.complete(id)
    }
    expect(
      Object.values(store.read().modules).filter((x) => x.completed),
    ).toHaveLength(4)
    expect(store.available()).toBe(false)
    store.master('array', 'queue-peek')
    expect(store.read().modules.array.mastered).toHaveLength(0)
    blocked = false
    store.complete('queue')
    expect(
      Object.values(createProgressStore(() => disk).read().modules).every(
        (x) => x.completed,
      ),
    ).toBe(true)
  })
})
