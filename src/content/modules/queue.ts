import {
  applyOperation,
  equivalent,
  replayEvidence,
  type QueueState,
  type ModuleState,
  type OperationEvent,
} from '../../engine/modules/structures'
import type { TeachingDefinition } from '../../engine/modules/teaching'
export const harbor = (values: string[]): QueueState => ({
  kind: 'queue',
  waiting: values.map((value, i) => ({ id: `boat-${i}`, value })),
  served: [],
})
export const queueCodeInitial = harbor([])
export const queueApplyInitial = harbor(['red', 'blue'])
export const queueCodeStarter =
  '# queue is provided and starts empty.\n# Enqueue A, enqueue B, peek at A, serve A, then enqueue C.\n# Target: waiting B, C; served A. Use queue.enqueue(value), queue.peek(), queue.dequeue().\n'
export const queueCodeHints: [string, string, string] = [
  'Label front and rear before each operation.',
  'Peek reads the front without serving it. Enqueue always joins the rear.',
  'Track both waiting boats and departure history; arrivals can happen between services.',
]
function resultIs(s: ModuleState, waiting: string[], served: string[]) {
  return (
    s.kind === 'queue' &&
    equivalent(
      s.waiting.map((x) => x.value),
      waiting,
    ) &&
    equivalent(
      s.served.map((x) => x.value),
      served,
    )
  )
}
function sequence(e: OperationEvent[], steps: [string, string | null][]) {
  return equivalent(
    e
      .filter((x) => x.accepted)
      .map((x) => [
        x.operation,
        x.operation === 'enqueue' ? x.args.value : x.returned,
      ]),
    steps,
  )
}
export const queueCodeGoal = (s: ModuleState, e: OperationEvent[]) =>
  replayEvidence(queueCodeInitial, s, e) &&
  resultIs(s, ['B', 'C'], ['A']) &&
  sequence(e, [
    ['enqueue', 'A'],
    ['enqueue', 'B'],
    ['peek', 'A'],
    ['dequeue', 'A'],
    ['enqueue', 'C'],
  ])
export const queueApplyGoal = (s: ModuleState, e: OperationEvent[]) =>
  replayEvidence(queueApplyInitial, s, e) &&
  resultIs(s, ['green'], ['red', 'blue']) &&
  sequence(e, [
    ['peek', 'red'],
    ['dequeue', 'red'],
    ['enqueue', 'green'],
    ['dequeue', 'blue'],
  ])
const script: [string, Record<string, string>, string][] = [
  [
    'enqueue',
    { value: 'A' },
    'A arrives first and joins the rear. With one boat, front and rear both identify A.',
  ],
  [
    'enqueue',
    { value: 'B' },
    'B joins behind A at the rear. A keeps its turn at the front.',
  ],
  [
    'peek',
    {},
    'Peek returns A without moving any boat or changing the departure history.',
  ],
  ['dequeue', {}, 'A leaves from the front. B is now both front and rear.'],
  [
    'enqueue',
    { value: 'C' },
    'C arrives while B is waiting. Join behind B, not before it.',
  ],
  [
    'dequeue',
    {},
    'Serve B next. Departure order A, B matches arrival order. C is still waiting.',
  ],
]
let observed = queueCodeInitial
export const queueObservation = script.map(([operation, args, caption], i) => {
  const event = applyOperation(observed, { operation, args }, i)
  observed = event.after as QueueState
  return { event, caption }
})
export const queuePredictions = [
  {
    id: 'first',
    question: 'Where does the first arriving boat join?',
    options: ['At the rear', 'At the stack top'],
    correct: 'At the rear',
  },
  {
    id: 'rear',
    question: 'Where should B join when A is waiting?',
    options: ['Before A', 'Behind A at the rear'],
    correct: 'Behind A at the rear',
  },
  {
    id: 'peek',
    question: 'What does peek return, without removing it?',
    options: ['A, with the queue unchanged', 'B, removing B'],
    correct: 'A, with the queue unchanged',
  },
  {
    id: 'serve',
    question: 'Who must leave first?',
    options: ['A, the earliest waiting boat', 'B, the latest arrival'],
    correct: 'A, the earliest waiting boat',
  },
  {
    id: 'arrival',
    question: 'C arrives after A leaves. Where does C wait?',
    options: ['Behind B', 'Before B'],
    correct: 'Behind B',
  },
  {
    id: 'next',
    question: 'Who leaves next, before C?',
    options: ['B', 'C'],
    correct: 'B',
  },
]
export interface QueueActivity extends TeachingDefinition {
  title: string
  misconception: string
  ruleLabel: string
  reasonLabel: string
  demoPrompt: string
  transferPrompt: string
  source: string
  value?: string
  transferValue?: string
}
const source =
  'Original activity. Knowledge reference: Hello Algo, queue chapter (local reference).'
export const queueActivities: QueueActivity[] = [
  {
    moduleId: 'queue',
    exerciseId: 'queue-first',
    title: 'Who boards first?',
    misconception: 'The last arrival should leave first, just like a stack!',
    ruleId: 'fifo',
    reasonId: 'arrival-order',
    ruleLabel: 'Serve the earliest waiting boat from the front',
    reasonLabel: 'First In, First Out preserves arrival order',
    allowedOperations: ['dequeue'],
    hints: [
      'Identify the first arrival.',
      'The front has waited longest.',
      'Compare queue FIFO with stack LIFO.',
    ],
    demo: {
      id: 'demo',
      initial: harbor(['A', 'B']),
      goal: (s, e) =>
        resultIs(s, ['B'], ['A']) && sequence(e, [['dequeue', 'A']]),
    },
    transfer: {
      id: 'transfer',
      initial: harbor(['K', 'L', 'M']),
      goal: (s, e) =>
        resultIs(s, ['L', 'M'], ['K']) && sequence(e, [['dequeue', 'K']]),
    },
    demoPrompt: 'Serve one boat from A, B. Keep B waiting.',
    transferPrompt: 'New arrivals K, L, M: serve only the earliest boat.',
    source,
  },
  {
    moduleId: 'queue',
    exerciseId: 'queue-rear',
    title: 'Where does a newcomer wait?',
    misconception: 'New boats can join at the front and take the next turn.',
    ruleId: 'join-rear',
    reasonId: 'no-cutting',
    ruleLabel: 'Enqueue adds at the rear',
    reasonLabel: 'Boats already waiting keep their turn',
    allowedOperations: ['enqueue'],
    hints: [
      'Find the rear label.',
      'Keep the existing waiting order.',
      'The new boat waits behind all current boats.',
    ],
    demo: {
      id: 'demo',
      initial: harbor(['A', 'B']),
      goal: (s, e) =>
        resultIs(s, ['A', 'B', 'X'], []) && sequence(e, [['enqueue', 'X']]),
    },
    transfer: {
      id: 'transfer',
      initial: harbor(['K']),
      goal: (s, e) =>
        resultIs(s, ['K', 'N'], []) && sequence(e, [['enqueue', 'N']]),
    },
    value: 'X',
    transferValue: 'N',
    demoPrompt: 'Let X arrive behind A and B.',
    transferPrompt: 'Let N arrive while K is waiting. Preserve K’s turn.',
    source,
  },
  {
    moduleId: 'queue',
    exerciseId: 'queue-peek',
    title: 'Look without letting a boat leave',
    misconception: 'Peeking removes the front boat too!',
    ruleId: 'peek-only',
    reasonId: 'no-departure',
    ruleLabel: 'Peek reads the front without removing it',
    reasonLabel: 'Waiting order and departure history remain unchanged',
    allowedOperations: ['peek'],
    hints: [
      'Compare the waiting boats before and after.',
      'Read the return value.',
      'Peeking at one boat still leaves one boat waiting.',
    ],
    demo: {
      id: 'demo',
      initial: harbor(['A', 'B']),
      goal: (s, e) =>
        resultIs(s, ['A', 'B'], []) && sequence(e, [['peek', 'A']]),
    },
    transfer: {
      id: 'transfer',
      initial: harbor(['K']),
      goal: (s, e) => resultIs(s, ['K'], []) && sequence(e, [['peek', 'K']]),
    },
    demoPrompt: 'Peek once at A. Both A and B must stay.',
    transferPrompt: 'Only K is waiting. Peek once; K must not depart.',
    source,
  },
  {
    moduleId: 'queue',
    exerciseId: 'queue-service',
    title: 'New arrivals between services',
    misconception:
      'After serving one boat, the newest arrival should jump ahead. Even an empty queue can be served!',
    ruleId: 'interleave-fifo',
    reasonId: 'respect-waiters',
    ruleLabel:
      'Interleaved arrivals still join the rear; an empty queue cannot be served',
    reasonLabel:
      'Each service needs a real front and preserves earlier waiting turns',
    allowedOperations: ['enqueue', 'dequeue', 'peek'],
    hints: [
      'Track departures separately from waiting boats.',
      'An empty dequeue reports EMPTY and preserves state.',
      'After a new arrival, check which boat has been waiting longest.',
    ],
    demo: {
      id: 'demo',
      initial: harbor(['A', 'B']),
      goal: (s, e) =>
        resultIs(s, ['C'], ['A', 'B']) &&
        sequence(e, [
          ['dequeue', 'A'],
          ['enqueue', 'C'],
          ['dequeue', 'B'],
        ]),
    },
    transfer: {
      id: 'transfer',
      initial: harbor([]),
      goal: (s, e) =>
        resultIs(s, ['L'], ['K']) &&
        sequence(e, [
          ['enqueue', 'K'],
          ['peek', 'K'],
          ['dequeue', 'K'],
          ['enqueue', 'L'],
        ]),
    },
    demoPrompt: 'Serve A; let C arrive; then serve B. Keep C waiting.',
    transferPrompt:
      'Start empty. Let K arrive, peek at K, serve K, then let L arrive. You may test an empty dequeue first.',
    source,
  },
]
