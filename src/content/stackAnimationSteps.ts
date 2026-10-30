import type { AnimationStep, StructureState } from '../engine/structures/types'

function state(values: number[], highlightLast = false): StructureState {
  return {
    elements: values.map((value, index) => ({
      id: `slot-${index}`,
      value,
      highlighted: highlightLast && index === values.length - 1,
    })),
  }
}

export const stackAnimationSteps: AnimationStep[] = [
  {
    operation: 'push',
    description: 'push(5) — put 5 on top of the (empty) stack.',
    beforeState: state([]),
    afterState: state([5]),
  },
  {
    operation: 'push',
    description: 'push(8) — 8 goes on top of 5.',
    beforeState: state([5]),
    afterState: state([5, 8]),
  },
  {
    operation: 'push',
    description: 'push(3) — 3 goes on top of 8.',
    beforeState: state([5, 8]),
    afterState: state([5, 8, 3]),
  },
  {
    operation: 'peek',
    description: 'peek() — look at the top item without removing it. It’s 3!',
    beforeState: state([5, 8, 3]),
    afterState: state([5, 8, 3], true),
  },
  {
    operation: 'pop',
    description: 'pop() — remove the top item. 3 comes off.',
    beforeState: state([5, 8, 3], true),
    afterState: state([5, 8]),
  },
  {
    operation: 'pop',
    description: 'pop() — remove the top item. 8 comes off.',
    beforeState: state([5, 8]),
    afterState: state([5]),
  },
]
