import { describe, expect, it } from 'vitest'
import {
  createProgressStore,
  emptyProgress,
  MODULE_PROGRESS_KEY,
  parseModuleProgress,
} from './progress'

function storage() {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}
describe('four-module progress migration and memory recovery', () => {
  it('does not hide a quota failure when a subscriber rereads progress', () => {
    const disk = storage()
    let full = true
    const store = createProgressStore(() => ({
      getItem: disk.getItem,
      setItem: (key, value) => {
        if (full) throw new Error('quota')
        disk.setItem(key, value)
      },
    }))
    const unsubscribe = store.subscribe(() => store.read())
    expect(store.complete('array')).toBe(false)
    expect(store.available()).toBe(false)
    expect(store.read().modules.array.completed).toBe(true)
    full = false
    expect(store.update('array', { unlockedThrough: 3 })).toBe(true)
    expect(createProgressStore(() => disk).read().modules.array.completed).toBe(
      true,
    )
    unsubscribe()
  })
  it('migrates all three Stack records and leaves the legacy evidence unchanged', () => {
    const disk = storage()
    disk.setItem(
      'algonavigator.stack-ruins.progress',
      JSON.stringify({ version: 1, unlockedThrough: 2 }),
    )
    disk.setItem(
      'algonavigator.stack-teaching.v1',
      JSON.stringify({
        version: 1,
        unlocked: true,
        mastered: ['build', 'unknown', 'build'],
      }),
    )
    disk.setItem(
      'algonavigator.adventure-progress.v1',
      JSON.stringify({ stackCompleted: true }),
    )
    const store = createProgressStore(() => disk)
    expect(store.read().modules.stack).toEqual({
      unlockedThrough: 3,
      completed: true,
      teachingUnlocked: true,
      mastered: ['build'],
    })
    expect(store.update('array', { unlockedThrough: 2 })).toBe(true)
    expect(store.read().modules.array.completed).toBe(false)
    expect(disk.getItem('algonavigator.stack-ruins.progress')).toContain(
      '"unlockedThrough":2',
    )
  })
  it('merges monotonically, retains other modules and never duplicates gems or mastery', () => {
    const disk = storage()
    const store = createProgressStore(() => disk)
    store.complete('array')
    store.master('array', 'array-index')
    store.master('array', 'array-index')
    store.complete('stack')
    store.update('array', { unlockedThrough: 1, completed: false })
    const restored = createProgressStore(() => disk).read()
    expect(restored.modules.array.mastered).toEqual(['array-index'])
    expect(restored.modules.array.unlockedThrough).toBe(3)
    expect(
      Object.values(restored.modules).filter((m) => m.completed),
    ).toHaveLength(2)
    expect(store.master('queue', 'array-index')).toBe(false)
  })
  it('rejects inconsistent modules and unknown fields while filtering unknown exercise IDs', () => {
    const record = emptyProgress()
    record.modules.queue.completed = true
    record.modules.array.teachingUnlocked = true
    record.modules.array.mastered = ['array-index', 'unknown', 'array-index']
    const parsed = parseModuleProgress(record)
    expect(parsed.modules.queue.completed).toBe(false)
    expect(parsed.modules.array.mastered).toEqual(['array-index'])
    expect(parseModuleProgress({ ...record, privateCode: 'x' })).toEqual(
      emptyProgress(),
    )
  })
  it('keeps memory progress on read/write failure and persists it after storage recovers', () => {
    const disk = storage()
    let blocked = true
    const store = createProgressStore(() => {
      if (blocked) throw new Error('denied')
      return disk
    })
    expect(store.complete('queue')).toBe(false)
    expect(store.read().modules.queue.completed).toBe(true)
    blocked = false
    expect(store.update('stack', { unlockedThrough: 2 })).toBe(true)
    expect(createProgressStore(() => disk).read().modules.queue.completed).toBe(
      true,
    )
  })
  it('does not overwrite an unsupported future format and retries failed migration writes', () => {
    const disk = storage()
    disk.setItem(MODULE_PROGRESS_KEY, '{"version":99,"private":"preserve"}')
    const store = createProgressStore(() => disk)
    expect(store.complete('stack')).toBe(false)
    expect(disk.getItem(MODULE_PROGRESS_KEY)).toContain('preserve')
    disk.values.delete(MODULE_PROGRESS_KEY)
    expect(store.complete('stack')).toBe(true)
    expect(JSON.parse(disk.getItem(MODULE_PROGRESS_KEY)!).version).toBe(2)
  })
})
