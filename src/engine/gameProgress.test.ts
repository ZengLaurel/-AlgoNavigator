import { describe, expect, it } from 'vitest'
import {
  GAME_PROGRESS_KEY,
  loadProgress,
  parseProgress,
  saveProgress,
} from './gameProgress'

describe('versioned game unlock persistence', () => {
  it.each([1, 2, 3] as const)(
    'round trips ordered unlock level %i',
    (unlockedThrough) => {
      const values = new Map<string, string>()
      const storage = () => ({
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
          values.set(key, value)
        },
      })
      const progress = { version: 1 as const, unlockedThrough }
      expect(saveProgress(progress, storage)).toBe(true)
      expect(loadProgress(storage)).toEqual(progress)
      expect(JSON.parse(values.get(GAME_PROGRESS_KEY)!)).toEqual(progress)
    },
  )
  it.each([
    null,
    '',
    '{',
    'null',
    '[]',
    'true',
    '1',
    '{}',
    '{"version":2,"unlockedThrough":3}',
    '{"version":"1","unlockedThrough":3}',
    '{"version":1,"unlockedThrough":"3"}',
    '{"version":1,"unlockedThrough":4}',
    '{"version":1,"unlockedThrough":0}',
    '{"version":1,"unlockedThrough":2.5}',
    '{"version":1,"unlockedThrough":3,"code":"private"}',
  ])('rejects invalid progress %s', (raw) => {
    expect(parseProgress(raw)).toEqual({ version: 1, unlockedThrough: 1 })
  })
  it('survives denied storage access and quota errors', () => {
    const denied = () => {
      throw new Error('SecurityError')
    }
    expect(loadProgress(denied).unlockedThrough).toBe(1)
    expect(saveProgress({ version: 1, unlockedThrough: 3 }, denied)).toBe(false)
    expect(
      saveProgress({ version: 1, unlockedThrough: 3 }, () => ({
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError')
        },
      })),
    ).toBe(false)
  })
})
