import { describe, expect, it } from 'vitest'
import { ASSETS, type AssetKey } from './index'

const ALL_KEYS: AssetKey[] = [
  'stone-door-closed',
  'stone-door-open',
  'switch-inactive',
  'switch-active',
  'block-base',
  'block-moon',
  'block-sun',
  'block-star',
  'block-cracked',
  'sprite-idle',
  'sprite-guide',
  'sprite-thinking',
  'sprite-happy',
  'magic-stairs',
]

describe('ASSETS', () => {
  it.each(ALL_KEYS)('resolves a descriptor with alt text for %s', (key) => {
    const descriptor = ASSETS[key]
    expect(descriptor).toBeDefined()
    expect(descriptor.alt.length).toBeGreaterThan(0)
  })

  it('has no key resolving to an empty-string src (only null or a real path)', () => {
    for (const descriptor of Object.values(ASSETS)) {
      expect(descriptor.src).not.toBe('')
    }
  })
})
