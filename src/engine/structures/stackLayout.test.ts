import { describe, expect, it } from 'vitest'
import { computeStackLayout } from './stackLayout'
import type { StructureState } from './types'

describe('computeStackLayout', () => {
  it('places the first element (bottom of stack) below later elements', () => {
    const state: StructureState = {
      elements: [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 },
      ],
    }

    const positions = computeStackLayout(state)

    expect(positions).toHaveLength(3)
    // Lower index = bottom of stack = larger y (further down the SVG).
    expect(positions[0].y).toBeGreaterThan(positions[1].y)
    expect(positions[1].y).toBeGreaterThan(positions[2].y)
  })

  it('preserves element id, value, and highlighted flag', () => {
    const state: StructureState = {
      elements: [{ id: 'top', value: 42, highlighted: true }],
    }

    const [position] = computeStackLayout(state)

    expect(position.id).toBe('top')
    expect(position.value).toBe(42)
    expect(position.highlighted).toBe(true)
  })

  it('defaults highlighted to false when not specified', () => {
    const state: StructureState = { elements: [{ id: 'a', value: 1 }] }

    const [position] = computeStackLayout(state)

    expect(position.highlighted).toBe(false)
  })

  it('reserves stable slot positions when slotCount exceeds element count', () => {
    const empty: StructureState = { elements: [] }
    const oneElement: StructureState = { elements: [{ id: 'a', value: 1 }] }

    // Same slotCount reservation (e.g. a lesson's max stack depth) keeps
    // the bottom slot's y position identical across frames.
    const [emptySlotBottomY] = [
      computeStackLayout(
        { ...empty, elements: [{ id: 'ghost', value: 0 }] },
        3,
      )[0].y,
    ]
    const [realBottomY] = [computeStackLayout(oneElement, 3)[0].y]

    expect(realBottomY).toBe(emptySlotBottomY)
  })
})
