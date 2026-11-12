import type {
  ModuleId,
  ModuleState,
  NewModuleId,
} from '../../engine/modules/structures.js'

export const newModules: NewModuleId[] = ['array', 'linked-list', 'queue']
export const exerciseIds: Record<ModuleId, string[]> = {
  stack: ['build', 'backspace', 'stars', 'pairs'],
  array: ['array-index', 'array-insert', 'array-remove', 'array-grow'],
  'linked-list': [
    'linked-list-follow',
    'linked-list-head',
    'linked-list-insert',
    'linked-list-remove',
  ],
  queue: ['queue-first', 'queue-rear', 'queue-peek', 'queue-service'],
}
export const moduleCatalog = {
  stack: {
    title: 'Stack Ruins',
    implemented: true,
    route: '/#/stack',
    rule: 'Use only the top. Last In, First Out.',
  },
  array: {
    title: 'Supply Camp',
    implemented: true,
    route: '/#/array',
    rule: 'Indexes start at zero. Insertion and removal shift later items. Length and capacity differ.',
  },
  'linked-list': {
    title: 'Misty Forest',
    implemented: true,
    route: '/#/linked-list',
    rule: 'Follow next references from head to None. Preserve links and node identities.',
  },
  queue: {
    title: 'Harbor Pier',
    implemented: true,
    route: '/#/queue',
    rule: 'Join at rear, serve at front. First In, First Out. Peek leaves the queue unchanged.',
  },
} as const

export function isModuleId(id: unknown): id is ModuleId {
  return typeof id === 'string' && Object.hasOwn(moduleCatalog, id)
}
export function validTask(
  moduleId: ModuleId,
  taskId: unknown,
  exerciseId?: unknown,
): boolean {
  if (typeof taskId !== 'string') return false
  if (moduleId === 'stack')
    return (
      ['stone-trial', 'stairway-repair', 'forked-path', 'stack-teach'].includes(
        taskId,
      ) &&
      (taskId !== 'stack-teach'
        ? exerciseId === undefined
        : exerciseIds.stack.includes(String(exerciseId)))
    )
  return ['observe', 'code', 'apply', 'teach'].some(
    (stage) =>
      taskId === `${moduleId}-${stage}` &&
      (stage === 'teach'
        ? exerciseIds[moduleId].includes(String(exerciseId))
        : exerciseId === undefined),
  )
}

/** Trusted fixture registry for the new execution protocol. Further lessons register here as they ship. */
export function executionFixture(
  moduleId: NewModuleId,
  taskId: string,
  exampleId: string,
): ModuleState | null {
  if (taskId !== `${moduleId}-code` || exampleId !== 'main') return null
  if (moduleId === 'array')
    return {
      kind: 'array',
      capacity: 4,
      items: ['A', 'B', 'C'].map((value, i) => ({ id: `item-${i}`, value })),
    }
  if (moduleId === 'queue') return { kind: 'queue', waiting: [], served: [] }
  return {
    kind: 'linked-list',
    head: 'a',
    nodes: [
      { id: 'a', value: 'A', next: 'b' },
      { id: 'b', value: 'B', next: null },
      { id: 'x', value: 'X', next: null },
    ],
  }
}

export const moduleKnowledge: Record<
  ModuleId,
  Array<{ id: string; title: string; notes: string[] }>
> = {
  stack: [
    {
      id: 'top',
      title: 'Stack top',
      notes: [
        moduleCatalog.stack.rule,
        'push adds, pop removes and peek inspects the top.',
      ],
    },
  ],
  array: [
    {
      id: 'index',
      title: 'Index and value',
      notes: [
        'The first position has index 0. An index identifies a position, not its value.',
        'Example: [A, B, C] has A at index 0 and C at index 2. get(0) returns A without changing storage.',
      ],
    },
    {
      id: 'shift',
      title: 'Insertion and removal',
      notes: [
        'Insertion shifts later items right. Removal shifts them left so no hole remains.',
        'Insert X at index 1 in [A, B, C] to get [A, X, B, C]. Remove index 2 to get [A, X, C]. Replacing a value leaves the other positions unchanged.',
      ],
    },
    {
      id: 'capacity',
      title: 'Length and capacity',
      notes: [
        'Length counts used positions. Capacity counts available positions. Grow a full storage area before inserting.',
        'Example: two items in four slots have length 2 and capacity 4. Growth preserves existing order and length.',
      ],
    },
    {
      id: 'traverse',
      title: 'Traversal and Python',
      notes: [
        'Visit every used index in order.',
        'This is an array teaching model. A Python list is dynamic and its element objects need not occupy contiguous memory.',
      ],
    },
  ],
  'linked-list': [
    {
      id: 'next',
      title: 'Nodes and references',
      notes: [
        'Each node has a value and a next reference. Head identifies the first node. The last next is None.',
        'Screen position does not define next. Two nodes may have equal values but different identities.',
      ],
    },
    {
      id: 'links',
      title: 'Insertion and removal',
      notes: [
        'Preserve the successor when inserting. Reconnect the remaining path when removing. Removing the head updates head.',
        'Example: a → b becomes a → x → b by first linking x to b, then a to x. Removing x reconnects a to b; x can still exist off the path.',
        'An empty path has head None. Adding one node makes it head and tail. Removing that only node restores head None.',
      ],
    },
    {
      id: 'traverse',
      title: 'Traversal and mistakes',
      notes: [
        'Follow next to None. A repeated node means a cycle. Repair links and try again.',
        'Arrays use positions. Linked lists use references. This ID-based model is a bounded teaching interface; Python nodes normally store object references. Safe insert/remove helpers update the necessary references; link and setHead expose individual edits.',
        'Example: nodes stored as [b, a, c] can still form a → c → b. Read next rather than moving right. IDs distinguish equal values.',
      ],
    },
  ],
  queue: [
    {
      id: 'fifo',
      title: 'First In, First Out',
      notes: [
        moduleCatalog.queue.rule,
        'A stack removes the latest item. A queue serves the earliest waiting item.',
      ],
    },
    {
      id: 'ends',
      title: 'Front and rear',
      notes: [
        'enqueue joins the rear. dequeue returns and removes the front. An empty queue cannot be served.',
        'Example: A, B are waiting. Serve A; let C arrive. B remains front and C joins the rear. Serve B before C; departure history is A, B.',
        'With one boat, front and rear refer to the same boat. After it leaves, both ends are empty. A failed empty operation keeps all state unchanged.',
      ],
    },
    {
      id: 'peek',
      title: 'Peek and Python',
      notes: [
        'peek returns the front without removing it.',
        'Example: peek at [A, B] returns A and keeps [A, B] waiting. No departure is recorded; dequeue is a separate action.',
        'Python deque.append and popleft implement queue operations. A list pop(0) is not constant time. Some textbooks call enqueue/dequeue push/pop.',
      ],
    },
  ],
}
