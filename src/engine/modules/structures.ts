export const MODULE_IDS = ['stack', 'array', 'linked-list', 'queue'] as const
export type ModuleId = (typeof MODULE_IDS)[number]
export type NewModuleId = Exclude<ModuleId, 'stack'>
export type Value = number | string
export type Item = { id: string; value: Value }
export type ArrayState = { kind: 'array'; items: Item[]; capacity: number }
export type LinkedListState = {
  kind: 'linked-list'
  head: string | null
  nodes: Array<Item & { next: string | null }>
}
export type QueueState = { kind: 'queue'; waiting: Item[]; served: Item[] }
export type ModuleState = ArrayState | LinkedListState | QueueState
export type ModuleAction = {
  operation: string
  args: Record<string, Value | null>
}
export type OperationEvent = ModuleAction & {
  sequence: number
  before: ModuleState
  after: ModuleState
  returned: Value | Value[] | null
  accepted: boolean
  errorCode: string | null
}
export const cloneState = <T>(state: T): T => JSON.parse(JSON.stringify(state))
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
export const exactKeys = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).length === keys.length &&
  keys.every((key) => Object.hasOwn(v, key))
const valueValid = (v: unknown): v is Value =>
  (typeof v === 'number' && Number.isFinite(v)) ||
  (typeof v === 'string' && v.length <= 32)
const idValid = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(v)
const itemsValid = (
  v: unknown,
  linked = false,
): v is Array<Item & { next?: unknown }> =>
  Array.isArray(v) &&
  v.length <= 16 &&
  v.every(
    (i) =>
      isRecord(i) &&
      exactKeys(i, linked ? ['id', 'value', 'next'] : ['id', 'value']) &&
      idValid(i.id) &&
      valueValid(i.value) &&
      (!linked || i.next === null || idValid(i.next)),
  ) &&
  new Set(v.map((i) => i.id)).size === v.length

export function validState(v: unknown): v is ModuleState {
  if (!isRecord(v)) return false
  if (v.kind === 'array')
    return (
      exactKeys(v, ['kind', 'items', 'capacity']) &&
      itemsValid(v.items) &&
      Number.isInteger(v.capacity) &&
      (v.capacity as number) >= v.items.length &&
      (v.capacity as number) <= 16
    )
  if (v.kind === 'queue')
    return (
      exactKeys(v, ['kind', 'waiting', 'served']) &&
      itemsValid(v.waiting) &&
      itemsValid(v.served) &&
      itemsValid([...v.waiting, ...v.served])
    )
  if (
    v.kind === 'linked-list' &&
    exactKeys(v, ['kind', 'head', 'nodes']) &&
    itemsValid(v.nodes, true)
  ) {
    const ids = new Set(v.nodes.map((n) => n.id))
    return (
      (v.head === null || ids.has(v.head as string)) &&
      v.nodes.every(
        (n) => isRecord(n) && (n.next === null || ids.has(n.next as string)),
      )
    )
  }
  return false
}

export function linkedOrder(state: LinkedListState): string[] {
  const order: string[] = []
  let id = state.head
  while (id !== null) {
    if (order.includes(id)) throw new Error('CYCLE')
    const node = state.nodes.find((n) => n.id === id)
    if (!node) throw new Error('INVALID_REFERENCE')
    order.push(id)
    id = node.next
  }
  return order
}

export function equivalent(a: unknown, b: unknown): boolean {
  const canonical = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(canonical)
      : isRecord(v)
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, canonical(v[k])]),
          )
        : v
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b))
}

/** Pure operation semantics shared by scripted lessons, evidence replay and grading. */
export function applyOperation(
  before: ModuleState,
  action: ModuleAction,
  sequence = 0,
): OperationEvent {
  let after = cloneState(before)
  let returned: Value | Value[] | null = null
  let errorCode: string | null = null
  const { operation: op, args } = action
  const fail = (code: string): never => {
    throw new Error(code)
  }
  const checkArgs = (keys: string[]) => {
    if (!exactKeys(args, keys)) fail('INVALID_ARGUMENT')
  }
  const nextId = (items: Item[]) => {
    let n = sequence
    while (items.some((i) => i.id === `new-${n}`)) n++
    return `new-${n}`
  }
  try {
    if (!validState(before)) fail('INVALID_STATE')
    if (before.kind === 'array' && after.kind === 'array') {
      if (op === 'traverse') {
        checkArgs([])
        returned = after.items.map((i) => i.value)
      } else if (op === 'grow') {
        checkArgs(['capacity'])
        if (
          !Number.isInteger(args.capacity) ||
          Number(args.capacity) <= after.capacity ||
          Number(args.capacity) > 16
        )
          fail('INVALID_CAPACITY')
        after.capacity = Number(args.capacity)
      } else {
        if (!['get', 'set', 'insert', 'remove'].includes(op))
          fail('INVALID_OPERATION')
        checkArgs(
          op === 'set' || op === 'insert' ? ['index', 'value'] : ['index'],
        )
        const index = args.index as number
        if (
          !Number.isInteger(index) ||
          index < 0 ||
          index >= after.items.length + (op === 'insert' ? 1 : 0)
        )
          fail('INVALID_INDEX')
        if ((op === 'set' || op === 'insert') && !valueValid(args.value))
          fail('INVALID_VALUE')
        if (op === 'get') returned = after.items[index].value
        if (op === 'set') after.items[index].value = args.value as Value
        if (op === 'remove') returned = after.items.splice(index, 1)[0].value
        if (op === 'insert') {
          if (after.items.length >= after.capacity) fail('CAPACITY_FULL')
          after.items.splice(index, 0, {
            id: nextId(after.items),
            value: args.value as Value,
          })
        }
      }
    } else if (after.kind === 'queue') {
      checkArgs(op === 'enqueue' ? ['value'] : [])
      if (op === 'enqueue') {
        if (!valueValid(args.value)) fail('INVALID_VALUE')
        const all = [...after.waiting, ...after.served]
        if (all.length >= 16) fail('EVIDENCE_LIMIT')
        after.waiting.push({ id: nextId(all), value: args.value as Value })
      } else if (op === 'dequeue' || op === 'peek') {
        if (!after.waiting.length) fail('EMPTY')
        returned = after.waiting[0].value
        if (op === 'dequeue') after.served.push(after.waiting.shift()!)
      } else fail('INVALID_OPERATION')
    } else if (after.kind === 'linked-list') {
      const nodes = after.nodes
      const node = (id: unknown) =>
        nodes.find((n) => n.id === id) ?? fail('INVALID_REFERENCE')
      if (op === 'visit') {
        checkArgs(['id'])
        returned = node(args.id).value
      } else if (op === 'setHead') {
        checkArgs(['id'])
        if (args.id !== null) node(args.id)
        after.head = args.id as string | null
      } else if (op === 'link') {
        checkArgs(['id', 'nextId'])
        if (args.nextId !== null) node(args.nextId)
        node(args.id).next = args.nextId as string | null
      } else if (op === 'insertHead' || op === 'insertAfter') {
        checkArgs(op === 'insertHead' ? ['id'] : ['previousId', 'id'])
        const fresh = node(args.id)
        const reachable = linkedOrder(after)
        if (reachable.includes(fresh.id) || fresh.next !== null)
          fail('ALREADY_LINKED')
        if (op === 'insertHead') {
          fresh.next = after.head
          after.head = fresh.id
        } else {
          if (!reachable.includes(String(args.previousId)))
            fail('INVALID_REFERENCE')
          const previous = node(args.previousId)
          fresh.next = previous.next
          previous.next = fresh.id
        }
      } else if (op === 'removeHead' || op === 'removeAfter') {
        checkArgs(op === 'removeHead' ? [] : ['previousId'])
        const reachable = linkedOrder(after)
        if (op === 'removeHead') {
          if (after.head === null) fail('EMPTY')
          const removed = node(after.head)
          after.head = removed.next
          returned = removed.value
          removed.next = null
        } else {
          if (!reachable.includes(String(args.previousId)))
            fail('INVALID_REFERENCE')
          const previous = node(args.previousId)
          if (previous.next === null) fail('EMPTY')
          const removed = node(previous.next)
          previous.next = removed.next
          returned = removed.value
          removed.next = null
        }
      } else fail('INVALID_OPERATION')
    }
  } catch (error) {
    errorCode = error instanceof Error ? error.message : 'INVALID_OPERATION'
    after = cloneState(before)
    returned = null
  }
  return {
    ...cloneState(action),
    sequence,
    before: cloneState(before),
    after,
    returned,
    accepted: errorCode === null,
    errorCode,
  }
}

export function replayEvidence(
  initial: ModuleState,
  final: unknown,
  events: unknown,
): events is OperationEvent[] {
  if (
    !validState(initial) ||
    !validState(final) ||
    !Array.isArray(events) ||
    events.length > 128
  )
    return false
  let current = initial
  for (const [sequence, event] of events.entries()) {
    if (
      !isRecord(event) ||
      !exactKeys(event, [
        'sequence',
        'operation',
        'args',
        'before',
        'after',
        'returned',
        'accepted',
        'errorCode',
      ]) ||
      typeof event.operation !== 'string' ||
      !isRecord(event.args)
    )
      return false
    const next = applyOperation(
      current,
      { operation: event.operation, args: event.args as ModuleAction['args'] },
      sequence,
    )
    if (!equivalent(next, event)) return false
    current = next.after
  }
  return equivalent(current, final)
}
