import {
  applyOperation,
  equivalent,
  linkedOrder,
  replayEvidence,
  type LinkedListState,
  type ModuleState,
  type OperationEvent,
} from '../../engine/modules/structures'
import type { TeachingDefinition } from '../../engine/modules/teaching'
export function forest(
  head: string | null,
  nodes: [string, string, string | null][],
): LinkedListState {
  return {
    kind: 'linked-list',
    head,
    nodes: nodes.map(([id, value, next]) => ({ id, value, next })),
  }
}
export const linkedCodeInitial = forest('a', [
  ['a', 'A', 'b'],
  ['b', 'B', null],
  ['x', 'X', null],
])
export const linkedApplyInitial = forest('p', [
  ['r', 'lamp', null],
  ['p', 'rope', 'q'],
  ['x', 'map', null],
  ['q', 'food', 'r'],
])
export const linkedCodeStarter =
  '# chain is provided: a(A) -> b(B) -> None; x(X) is detached.\n# Connect x between a and b using TWO link calls, preserving b.\n# Then visit a, x and b in path order.\n'
export const linkedCodeHints: [string, string, string] = [
  'Read each node ID and its next reference.',
  'Preserve the successor before changing the previous reference.',
  'Visit from head, following next, until None. A repeated ID means a cycle.',
]
export function pathIs(s: ModuleState, ids: string[]) {
  if (s.kind !== 'linked-list') return false
  try {
    return equivalent(linkedOrder(s), ids)
  } catch {
    return false
  }
}
function visits(e: OperationEvent[], ids: string[]) {
  return equivalent(
    e
      .filter((x) => x.accepted && x.operation === 'visit')
      .map((x) => x.args.id),
    ids,
  )
}
export const linkedCodeGoal = (s: ModuleState, e: OperationEvent[]) =>
  replayEvidence(linkedCodeInitial, s, e) &&
  pathIs(s, ['a', 'x', 'b']) &&
  visits(e, ['a', 'x', 'b']) &&
  e.some(
    (x) =>
      x.accepted &&
      x.operation === 'link' &&
      x.args.id === 'x' &&
      x.args.nextId === 'b',
  ) &&
  e.some(
    (x) =>
      x.accepted &&
      x.operation === 'link' &&
      x.args.id === 'a' &&
      x.args.nextId === 'x',
  )
export const linkedApplyGoal = (s: ModuleState, e: OperationEvent[]) =>
  replayEvidence(linkedApplyInitial, s, e) &&
  pathIs(s, ['p', 'x', 'r']) &&
  visits(e, ['p', 'x', 'r']) &&
  e.some(
    (x) => x.accepted && x.operation === 'removeAfter' && x.returned === 'food',
  ) &&
  e.some(
    (x) => x.accepted && x.operation === 'insertAfter' && x.args.id === 'x',
  )
const script: [string, Record<string, string | null>, string][] = [
  [
    'visit',
    { id: 'a' },
    'Start at head a. Its value is A; its next reference is b.',
  ],
  [
    'link',
    { id: 'x', nextId: 'b' },
    'Save the successor: detached x now points to b. Head is still a.',
  ],
  [
    'link',
    { id: 'a', nextId: 'x' },
    'Reconnect a to x. The path is a → x → b → None.',
  ],
  [
    'visit',
    { id: 'x' },
    'Follow the reference from a to x, regardless of screen position.',
  ],
  [
    'removeAfter',
    { previousId: 'a' },
    'Remove x from the path by reconnecting a to b. x still exists off the path.',
  ],
  [
    'removeHead',
    {},
    'Removing a changes head to b. The final node still points to None.',
  ],
]
let observed = linkedCodeInitial
export const linkedObservation = script.map(([operation, args, caption], i) => {
  const event = applyOperation(observed, { operation, args }, i)
  observed = event.after as LinkedListState
  return { event, caption }
})
export const linkedPredictions = [
  ['head', 'Which ID is the first node?', ['a', 'b', 'x'], 'a'],
  [
    'save',
    'Before reconnecting a, what must x remember?',
    ['The successor b', 'The screen position', 'Nothing'],
    'The successor b',
  ],
  [
    'connect',
    'After a points to x, which path follows next?',
    ['a → x → b', 'a → b only', 'x → a → b'],
    'a → x → b',
  ],
  [
    'follow',
    'What decides the next node?',
    ['The next reference', 'The nearest picture', 'The value alphabet'],
    'The next reference',
  ],
  [
    'remove',
    'Removing x after a must do what?',
    ['Reconnect a to b', 'Erase the value only', 'Lose b'],
    'Reconnect a to b',
  ],
  [
    'new-head',
    'After removing head a, what is the new head?',
    ['b', 'a', 'None'],
    'b',
  ],
].map(([id, question, options, correct]) => ({
  id: id as string,
  question: question as string,
  options: options as string[],
  correct: correct as string,
}))
export interface LinkedActivity extends TeachingDefinition {
  title: string
  misconception: string
  ruleLabel: string
  reasonLabel: string
  demoPrompt: string
  transferPrompt: string
  source: string
}
const source =
  'Original activity. Knowledge reference: Hello Algo, linked list chapter (local reference).'
const goal =
  (ids: string[], op: string, visitIds?: string[]) =>
  (s: ModuleState, e: OperationEvent[]) =>
    pathIs(s, ids) &&
    e.some((x) => x.accepted && x.operation === op) &&
    (!visitIds || visits(e, visitIds))
export const linkedActivities: LinkedActivity[] = [
  {
    moduleId: 'linked-list',
    exerciseId: 'linked-list-follow',
    title: 'Follow next, not the picture',
    misconception:
      'I can just walk to the picture on the right, even if next points elsewhere!',
    ruleId: 'follow-next',
    reasonId: 'identity-not-value',
    ruleLabel: 'Follow next from head to None',
    reasonLabel: 'References identify nodes even when values are equal',
    allowedOperations: ['visit'],
    hints: [
      'Locate head.',
      'Read the current next ID. Equal values can belong to different nodes.',
      'Stop at None, never at a repeated node.',
    ],
    demo: {
      id: 'demo',
      initial: forest('a', [
        ['b', 'same', null],
        ['a', 'same', 'c'],
        ['c', 'lamp', 'b'],
      ]),
      goal: goal(['a', 'c', 'b'], 'visit', ['a', 'c', 'b']),
    },
    transfer: {
      id: 'transfer',
      initial: forest('k', [
        ['m', 'same', null],
        ['k', 'same', 'm'],
      ]),
      goal: goal(['k', 'm'], 'visit', ['k', 'm']),
    },
    demoPrompt:
      'Visit a, then follow next until None. Keep every link unchanged.',
    transferPrompt:
      'A new forest: visit from head k to None, using IDs despite the equal values.',
    source,
  },
  {
    moduleId: 'linked-list',
    exerciseId: 'linked-list-head',
    title: 'Add a new head beacon',
    misconception:
      'Putting a beacon near the entrance changes head automatically.',
    ruleId: 'update-head',
    reasonId: 'preserve-old-head',
    ruleLabel: 'Connect the new node and update head',
    reasonLabel: 'The old path stays reachable through the new head',
    allowedOperations: ['insertHead'],
    hints: [
      'Find the detached node.',
      'The old head becomes its successor.',
      'An empty forest has head None; adding one node makes it head and tail.',
    ],
    demo: {
      id: 'demo',
      initial: forest('a', [
        ['a', 'A', null],
        ['x', 'X', null],
      ]),
      goal: goal(['x', 'a'], 'insertHead'),
    },
    transfer: {
      id: 'transfer',
      initial: forest(null, [['k', 'K', null]]),
      goal: goal(['k'], 'insertHead'),
    },
    demoPrompt: 'Insert detached x at the head, preserving a.',
    transferPrompt:
      'The path is empty (head None). Insert k as its first beacon.',
    source,
  },
  {
    moduleId: 'linked-list',
    exerciseId: 'linked-list-insert',
    title: 'Preserve the successor',
    misconception:
      'I will replace the old next first and think about the lost road later.',
    ruleId: 'save-successor',
    reasonId: 'retain-path',
    ruleLabel: 'Save the successor before reconnecting the previous node',
    reasonLabel: 'Both references are needed to preserve the rest of the path',
    allowedOperations: ['link'],
    hints: [
      'Read the previous node’s next.',
      'Prepare the detached node’s next first.',
      'Then reconnect the previous node. For a tail, the saved successor is None.',
    ],
    demo: {
      id: 'demo',
      initial: linkedCodeInitial,
      goal: (s, e) =>
        goal(['a', 'x', 'b'], 'link')(s, e) &&
        e
          .filter((x) => x.accepted && x.operation === 'link')
          .map((x) => x.args.id)
          .join(',') === 'x,a',
    },
    transfer: {
      id: 'transfer',
      initial: forest('k', [
        ['k', 'K', null],
        ['m', 'M', null],
      ]),
      goal: (s, e) =>
        goal(['k', 'm'], 'link')(s, e) &&
        e
          .filter((x) => x.accepted && x.operation === 'link')
          .map((x) => x.args.id)
          .join(',') === 'm,k',
    },
    demoPrompt:
      'Use two links: prepare x’s successor, then connect a to x. Preserve b.',
    transferPrompt:
      'Append m after tail k. Explicitly prepare m’s next as None, then connect k.',
    source,
  },
  {
    moduleId: 'linked-list',
    exerciseId: 'linked-list-remove',
    title: 'Keep the remaining road connected',
    misconception:
      'Erasing a value deletes the node; removing head never changes head.',
    ruleId: 'bypass-node',
    reasonId: 'head-is-reference',
    ruleLabel:
      'Reconnect around a removed node; update head when removing the first',
    reasonLabel: 'Removing changes references, not just the displayed value',
    allowedOperations: ['removeAfter', 'removeHead'],
    hints: [
      'Locate the node before the one being removed.',
      'Connect the remaining road to its successor.',
      'Removing the only node must make head None.',
    ],
    demo: {
      id: 'demo',
      initial: forest('a', [
        ['a', 'A', 'b'],
        ['b', 'B', 'c'],
        ['c', 'C', null],
      ]),
      goal: goal(['a', 'c'], 'removeAfter'),
    },
    transfer: {
      id: 'transfer',
      initial: forest('k', [['k', 'K', null]]),
      goal: goal([], 'removeHead'),
    },
    demoPrompt: 'Remove b after a and preserve c.',
    transferPrompt: 'Remove the only node k. Verify head becomes None.',
    source,
  },
]
