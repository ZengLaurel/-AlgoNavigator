import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
  'map-board',
  'node-entrance',
  'node-hall',
  'node-corridor',
  'node-dead-end',
  'node-exit',
  'badge-stack',
  'fx-sparkle',
]

describe('ASSETS', () => {
  it('registered exports exist as genuine PNGs at manifest dimensions', () => {
    const manifest = JSON.parse(
      readFileSync(resolve('public/assets/export-manifest.json'), 'utf8'),
    ) as { assets: { output: string; width: number; height: number }[] }
    for (const descriptor of Object.values(ASSETS)) {
      if (!descriptor.src) continue
      const bytes = readFileSync(resolve('public', descriptor.src.slice(1)))
      expect([...bytes.subarray(0, 8)]).toEqual([
        137, 80, 78, 71, 13, 10, 26, 10,
      ])
      const entry = manifest.assets.find(
        (asset) => descriptor.src === `/assets/${asset.output}`,
      )
      expect(entry).toBeDefined()
      expect(bytes.readUInt32BE(16)).toBe(entry!.width)
      expect(bytes.readUInt32BE(20)).toBe(entry!.height)
    }
  })
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
