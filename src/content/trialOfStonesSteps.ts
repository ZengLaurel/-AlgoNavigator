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
    description: 'A plain stone is placed first, at the very bottom.',
    beforeState: state([]),
    afterState: state(['base']),
  },
  {
    operation: 'push',
    description: 'A moon stone is placed on top of it.',
    beforeState: state(['base']),
    afterState: state(['base', 'moon']),
  },
  {
    operation: 'push',
    description: 'A star stone goes on top, last of all.',
    beforeState: state(['base', 'moon']),
    afterState: state(['base', 'moon', 'star']),
  },
  {
    operation: 'peek',
    description: 'The star stone — the last one placed — is on top.',
    beforeState: state(['base', 'moon', 'star']),
    afterState: state(['base', 'moon', 'star'], true),
  },
  {
    operation: 'pop',
    description: 'The star stone, placed last, is removed first.',
    beforeState: state(['base', 'moon', 'star'], true),
    afterState: state(['base', 'moon']),
  },
  {
    operation: 'pop',
    description: 'Next the moon stone comes off.',
    beforeState: state(['base', 'moon']),
    afterState: state(['base']),
  },
  {
    operation: 'pop',
    description: 'Last, the base stone — placed first — comes off too.',
    beforeState: state(['base']),
    afterState: state([]),
  },
]
