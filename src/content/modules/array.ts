import {
  applyOperation,
  equivalent,
  replayEvidence,
  type ArrayState,
  type ModuleState,
  type OperationEvent,
} from '../../engine/modules/structures'
import type { TeachingDefinition } from '../../engine/modules/teaching'

export const arrayState = (
  values: string[],
  capacity = values.length,
): ArrayState => ({
  kind: 'array',
  capacity,
  items: values.map((value, i) => ({ id: `item-${i}`, value })),
})
export const arrayValues = (state: ModuleState) =>
  state.kind === 'array' ? state.items.map((i) => i.value) : []
export const arrayCodeInitial = arrayState(['A', 'B', 'C'], 4)
export const arrayApplyInitial = arrayState(['rope', 'food', 'lamp'], 3)
export const arrayCodeStarter =
  '# array is provided. It starts with A, B, C and capacity 4.\n# Insert X at index 1, replace C with D, then remove B.\n# Use array.insert(index, value), array.set(index, value), array.remove(index).\n'
export const arrayCodeHints: [string, string, string] = [
  'Look at the index labels before and after inserting.',
  'Insertion moves later items. Replacing changes a value; removing closes a gap.',
  'After inserting, has the original C kept its old index? Inspect before the next operation.',
]
export const arrayCodeGoal = (state: ModuleState, events: OperationEvent[]) =>
  replayEvidence(arrayCodeInitial, state, events) &&
  state.kind === 'array' &&
  equivalent(arrayValues(state), ['A', 'X', 'D']) &&
  state.items[0].id === 'item-0' &&
  state.items[2].id === 'item-2' &&
  events.some(
    (e) =>
      e.accepted &&
      e.operation === 'insert' &&
      e.args.index === 1 &&
      e.args.value === 'X',
  ) &&
  events.some(
    (e) => e.accepted && e.operation === 'set' && e.args.value === 'D',
  ) &&
  events.some(
    (e) => e.accepted && e.operation === 'remove' && e.returned === 'B',
  )
export const arrayApplyGoal = (state: ModuleState, events: OperationEvent[]) =>
  replayEvidence(arrayApplyInitial, state, events) &&
  state.kind === 'array' &&
  state.capacity === 5 &&
  equivalent(arrayValues(state), ['rope', 'map', 'lamp']) &&
  state.items[0].id === 'item-0' &&
  state.items[2].id === 'item-2' &&
  events.some(
    (e) => e.accepted && e.operation === 'grow' && e.args.capacity === 5,
  ) &&
  events.some(
    (e) =>
      e.accepted &&
      e.operation === 'insert' &&
      e.args.index === 1 &&
      e.args.value === 'map',
  ) &&
  events.some(
    (e) => e.accepted && e.operation === 'remove' && e.returned === 'food',
  ) &&
  events.some(
    (e) =>
      e.accepted &&
      e.operation === 'traverse' &&
      equivalent(e.returned, ['rope', 'map', 'lamp']),
  )

const script = [
  ['get', { index: 0 }, 'Read index 0: the first item is A. Nothing moves.'],
  [
    'set',
    { index: 2, value: 'D' },
    'Replace C with D at index 2. Length stays 3.',
  ],
  [
    'insert',
    { index: 1, value: 'X' },
    'Insert X at index 1. B and D move one position right.',
  ],
  [
    'remove',
    { index: 2 },
    'Remove B at index 2. D moves left to close the gap.',
  ],
  [
    'traverse',
    {},
    'Visit used positions in order: A, X, D. Empty space is not an item.',
  ],
  [
    'grow',
    { capacity: 6 },
    'Move to a larger area. Capacity grows to 6, length remains 3 and order stays A, X, D.',
  ],
] as const
let observed = arrayState(['A', 'B', 'C'], 4)
export const arrayObservation = script.map(
  ([operation, args, caption], sequence) => {
    const event = applyOperation(
      observed,
      { operation, args: { ...args } },
      sequence,
    )
    observed = event.after as ArrayState
    return { event, caption }
  },
)
export const arrayPredictions = [
  {
    id: 'get',
    question: 'Before reading: which index belongs to the first item?',
    options: ['0', '1', 'A'],
    correct: '0',
  },
  {
    id: 'set',
    question: 'Before replacing C with D: what happens to the later items?',
    options: [
      'They all move right',
      'They stay in their positions',
      'They disappear',
    ],
    correct: 'They stay in their positions',
  },
  {
    id: 'insert',
    question: 'Before inserting in the middle: how do we keep the later items?',
    options: [
      'Overwrite them',
      'Shift them right',
      'Leave their old values outside the array',
    ],
    correct: 'Shift them right',
  },
  {
    id: 'remove',
    question: 'Before removing from the middle: how do we close the gap?',
    options: [
      'Shift later items left',
      'Leave an empty hole',
      'Change the index labels only',
    ],
    correct: 'Shift later items left',
  },
  {
    id: 'traverse',
    question: 'Before traversal: which positions should we visit?',
    options: [
      'Every capacity slot, including empty ones',
      'Only the last item',
      'All used positions in index order',
    ],
    correct: 'All used positions in index order',
  },
  {
    id: 'grow',
    question: 'Before growing: what should happen to the existing item order?',
    options: ['It reverses', 'It stays the same', 'All items are cleared'],
    correct: 'It stays the same',
  },
]

export interface ArrayActivity extends TeachingDefinition {
  title: string
  misconception: string
  ruleLabel: string
  reasonLabel: string
  demoPrompt: string
  transferPrompt: string
  value?: string
  transferValue?: string
  source: string
}
function goal(values: string[], operation: string, returned?: string) {
  return (state: ModuleState, events: OperationEvent[]) =>
    equivalent(arrayValues(state), values) &&
    events.some(
      (e) =>
        e.accepted &&
        e.operation === operation &&
        (returned === undefined || e.returned === returned),
    )
}
const source =
  'Original activity. Knowledge reference: Hello Algo, array chapter.'
export const arrayActivities: ArrayActivity[] = [
  {
    moduleId: 'array',
    exerciseId: 'array-index',
    title: 'Find a storage slot',
    misconception: 'I think the first item has index 1. Can you test my guess?',
    ruleId: 'zero-based',
    reasonId: 'position-not-value',
    ruleLabel: 'The first position has index 0',
    reasonLabel: 'An index describes a position, not the stored value',
    allowedOperations: ['get'],
    hints: [
      'Find the index labels.',
      'Counting labels begins at zero.',
      'How does the third position differ from the number on its label?',
    ],
    demo: {
      id: 'demo',
      initial: arrayState(['A', 'B', 'C']),
      goal: goal(['A', 'B', 'C'], 'get', 'A'),
    },
    transfer: {
      id: 'transfer',
      initial: arrayState(['K', 'L', 'M', 'N']),
      goal: goal(['K', 'L', 'M', 'N'], 'get', 'M'),
    },
    demoPrompt: 'Read the first item. Keep the storage unchanged.',
    transferPrompt: 'Read the third item. Keep the storage unchanged.',
    source,
  },
  {
    moduleId: 'array',
    exerciseId: 'array-insert',
    title: 'Insert new supplies',
    misconception:
      'I could put the new item on top of an old value. Would that keep all our supplies?',
    ruleId: 'shift-right',
    reasonId: 'preserve-existing',
    ruleLabel: 'Insert by shifting later items right',
    reasonLabel: 'The existing items need their own positions',
    allowedOperations: ['insert'],
    hints: [
      'Inspect the items after the insertion point.',
      'Insertion needs an unused position.',
      'Which direction preserves those later items?',
    ],
    demo: {
      id: 'demo',
      initial: arrayState(['A', 'B', 'C'], 4),
      goal: goal(['A', 'X', 'B', 'C'], 'insert'),
    },
    transfer: {
      id: 'transfer',
      initial: arrayState(['K', 'L'], 3),
      goal: goal(['K', 'M', 'L'], 'insert'),
    },
    value: 'X',
    transferValue: 'M',
    demoPrompt: 'Insert X at index 1. Keep A, B and C in order.',
    transferPrompt: 'Insert M at index 1. Keep K and L in order.',
    source,
  },
  {
    moduleId: 'array',
    exerciseId: 'array-remove',
    title: 'Close the empty gap',
    misconception:
      'After removing an item, I would leave a hole. Is our used storage still continuous?',
    ruleId: 'shift-left',
    reasonId: 'contiguous-used-slots',
    ruleLabel: 'Remove and shift later items left',
    reasonLabel: 'Used positions should have no empty gap',
    allowedOperations: ['remove'],
    hints: [
      'Locate the item to remove.',
      'Later items close the gap.',
      'What happens to used length after removal?',
    ],
    demo: {
      id: 'demo',
      initial: arrayState(['A', 'B', 'C', 'D']),
      goal: goal(['A', 'C', 'D'], 'remove', 'B'),
    },
    transfer: {
      id: 'transfer',
      initial: arrayState(['K', 'L', 'M']),
      goal: goal(['L', 'M'], 'remove', 'K'),
    },
    demoPrompt: 'Remove index 1 and keep the remaining order.',
    transferPrompt: 'Remove index 0 and keep the remaining order.',
    source,
  },
  {
    moduleId: 'array',
    exerciseId: 'array-grow',
    title: 'Make room for supplies',
    misconception:
      'Length and capacity are always equal, so I can never have spare storage. Am I right?',
    ruleId: 'length-vs-capacity',
    reasonId: 'spare-space',
    ruleLabel: 'Length and capacity can be different',
    reasonLabel: 'Unused capacity gives a new item room',
    allowedOperations: ['grow', 'insert'],
    hints: [
      'Compare length and capacity.',
      'Full storage needs more space before insertion.',
      'Does moving to a larger area change existing order?',
    ],
    demo: {
      id: 'demo',
      initial: arrayState(['A', 'B']),
      goal: (s, e) =>
        s.kind === 'array' &&
        s.capacity === 4 &&
        goal(['A', 'B', 'C'], 'insert')(s, e) &&
        e.some((x) => x.accepted && x.operation === 'grow'),
    },
    transfer: {
      id: 'transfer',
      initial: arrayState(['K', 'L', 'M']),
      goal: (s, e) =>
        s.kind === 'array' &&
        s.capacity === 5 &&
        goal(['K', 'L', 'M', 'N'], 'insert')(s, e) &&
        e.some((x) => x.accepted && x.operation === 'grow'),
    },
    value: 'C',
    transferValue: 'N',
    demoPrompt: 'Grow capacity from 2 to 4, then add C after B.',
    transferPrompt: 'Grow capacity from 3 to 5, then add N after M.',
    source,
  },
]
