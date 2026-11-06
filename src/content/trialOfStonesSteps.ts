import type {
  AnimationStep,
  StructureElement,
  StructureState,
} from '../engine/structures/types'

type Glyph = NonNullable<StructureElement['glyph']>

function state(glyphs: Glyph[], highlightLast = false): StructureState {
  return {
    elements: glyphs.map((glyph, index) => ({
      id: `stone-${index}`,
      value: glyph,
      glyph,
      highlighted: highlightLast && index === glyphs.length - 1,
    })),
  }
}

/**
 * Scripted push/pop sequence for the Trial of Stones room (SPEC §11.5.1):
 * demonstrates Last-In-First-Out by stacking three carved stones and then
 * removing them in reverse order, with captions written for a student who
 * has never seen a stack before — no code, no grading, pure observation.
 */
export const trialOfStonesSteps: AnimationStep[] = [
  {
    operation: 'push',
    description: 'push: place base on the empty stack. Base is now the top.',
    beforeState: state([]),
    afterState: state(['base']),
  },
  {
    operation: 'push',
    description: 'push: put moon above base. Moon is now the top.',
    beforeState: state(['base']),
    afterState: state(['base', 'moon']),
  },
  {
    operation: 'push',
    description: 'push: put star above moon. Star is now the top.',
    beforeState: state(['base', 'moon']),
    afterState: state(['base', 'moon', 'star']),
  },
  {
    operation: 'peek',
    description: 'peek: look at star on top. No stone is removed.',
    beforeState: state(['base', 'moon', 'star']),
    afterState: state(['base', 'moon', 'star'], true),
  },
  {
    operation: 'pop',
    description: 'pop: remove star from the top. Moon is now the top.',
    beforeState: state(['base', 'moon', 'star'], true),
    afterState: state(['base', 'moon']),
  },
  {
    operation: 'pop',
    description: 'pop: remove moon from the top. Base is now the top.',
    beforeState: state(['base', 'moon']),
    afterState: state(['base']),
  },
  {
    operation: 'pop',
    description: 'pop: remove base, the last stone. The stack is now empty.',
    beforeState: state(['base']),
    afterState: state([]),
  },
]
