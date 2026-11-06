import { describe, expect, it } from 'vitest'
import { checkStairwayRepair, getStairwayFeedback } from './stairwayCheck'
import type { StructureState } from './types'

function stateOf(
  glyphs: Array<'base' | 'moon' | 'star' | 'sun' | 'cracked'>,
): StructureState {
  return {
    elements: glyphs.map((glyph, index) => ({
      id: `slot-${index}`,
      value: index,
      glyph,
    })),
  }
}

describe('checkStairwayRepair', () => {
  const target = ['base', 'moon', 'star'] as const

  it('matches when the stack equals the target exactly, bottom to top', () => {
    expect(
      checkStairwayRepair(stateOf(['base', 'moon', 'star']), [...target]),
    ).toBe(true)
  })

  it('rejects the right stones in the wrong order', () => {
    expect(
      checkStairwayRepair(stateOf(['moon', 'base', 'star']), [...target]),
    ).toBe(false)
  })

  it('rejects an extra stone', () => {
    expect(
      checkStairwayRepair(stateOf(['base', 'moon', 'star', 'sun']), [
        ...target,
      ]),
    ).toBe(false)
  })

  it('rejects a missing stone', () => {
    expect(checkStairwayRepair(stateOf(['base', 'moon']), [...target])).toBe(
      false,
    )
  })

  it('rejects a wrong glyph at an otherwise correct position', () => {
    expect(
      checkStairwayRepair(stateOf(['base', 'moon', 'sun']), [...target]),
    ).toBe(false)
  })

  it('treats a missing run (null state) as not matching', () => {
    expect(checkStairwayRepair(null, [...target])).toBe(false)
  })

  it('defaults an omitted glyph to base for checking and feedback', () => {
    const state = stateOf(['base', 'moon', 'star'])
    delete state.elements[0].glyph
    expect(checkStairwayRepair(state, [...target])).toBe(true)
    expect(getStairwayFeedback(state, [...target])).toContain(
      'matches the target exactly',
    )
  })
})

describe('getStairwayFeedback', () => {
  const target = ['base', 'moon', 'star'] as const

  it('identifies the two missing stones after the correct base prefix', () => {
    expect(getStairwayFeedback(stateOf(['base']), [...target])).toContain(
      'Missing 2 stones: moon → star',
    )
  })

  it('identifies the remaining single stone', () => {
    expect(
      getStairwayFeedback(stateOf(['base', 'moon']), [...target]),
    ).toContain('Missing 1 stone: star')
  })

  it('identifies wrong order by position from the bottom', () => {
    expect(
      getStairwayFeedback(stateOf(['base', 'star', 'moon']), [...target]),
    ).toContain("Stone 2 from the bottom should be 'moon', but is 'star'")
  })

  it('identifies a wrong glyph even when the stack is too short or long', () => {
    for (const glyphs of [['sun'], ['base', 'sun', 'star', 'moon']] as const) {
      expect(getStairwayFeedback(stateOf([...glyphs]), [...target])).toContain(
        'Change that push call',
      )
    }
  })

  it('explains how to remove extra stones with pop', () => {
    expect(
      getStairwayFeedback(stateOf(['base', 'moon', 'star', 'sun']), [
        ...target,
      ]),
    ).toContain(
      '1 extra stone on top. Remove the extra push calls or use stack.pop()',
    )
  })

  it('distinguishes an empty stack from no returned stack', () => {
    expect(getStairwayFeedback(stateOf([]), [...target])).toContain(
      'Your stack is empty. Missing 3 stones: base → moon → star',
    )
    expect(getStairwayFeedback(null, [...target])).toContain(
      'No stack result was returned',
    )
  })

  it('agrees with checker for matching empty targets', () => {
    expect(checkStairwayRepair(stateOf([]), [])).toBe(true)
    expect(getStairwayFeedback(stateOf([]), [])).toContain(
      'matches the target exactly',
    )
    expect(checkStairwayRepair(null, [])).toBe(false)
  })
})
