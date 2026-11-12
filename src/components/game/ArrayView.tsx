import { motion, useReducedMotion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import type {
  ArrayState,
  ModuleAction,
  OperationEvent,
} from '../../engine/modules/structures'

export function ArrayView({
  state,
  event,
}: {
  state: ArrayState
  event?: OperationEvent
}) {
  const reduced = useReducedMotion()
  const moved =
    event?.before.kind === 'array'
      ? state.items.flatMap((item, index) => {
          const old =
            event.before.kind === 'array'
              ? event.before.items.findIndex((x) => x.id === item.id)
              : -1
          return old >= 0 && old !== index
            ? [`${item.value}: index ${old} to ${index}`]
            : []
        })
      : []
  return (
    <section className="array-display" aria-label="Array storage">
      <p>
        <strong>Length: {state.items.length}</strong> · Capacity:{' '}
        {state.capacity} · Spare positions:{' '}
        {state.capacity - state.items.length}
      </p>
      <div
        className="array-scroll"
        tabIndex={0}
        aria-label="Storage positions, scroll horizontally if needed"
      >
        <motion.div
          key={`storage-${state.capacity}`}
          className="array-slots"
          initial={reduced ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
        >
          {state.items.map((item, index) => (
            <motion.div
              layout={!reduced}
              transition={{ duration: reduced ? 0 : 0.25 }}
              className="array-slot used"
              key={item.id}
              data-item-id={item.id}
            >
              <span className="array-index">Index {index}</span>
              <strong>{item.value}</strong>
              <small>Used</small>
            </motion.div>
          ))}
          {Array.from(
            { length: state.capacity - state.items.length },
            (_, i) => (
              <div className="array-slot empty" key={`empty-${i}`}>
                <span className="array-index">
                  Index {state.items.length + i}
                </span>
                <strong>—</strong>
                <small>Empty</small>
              </div>
            ),
          )}
        </motion.div>
      </div>
      <p className="array-event" aria-live="polite">
        {event
          ? event.accepted
            ? `${event.operation}: ${event.returned === null ? 'state updated' : `returned ${JSON.stringify(event.returned)}`}. ${moved.length ? `Moved ${moved.join('; ')}.` : 'Existing positions kept their order.'}`
            : `Operation not applied: ${event.errorCode}. Storage is unchanged.`
          : 'The first item is at index 0. Empty positions are spare capacity.'}
      </p>
    </section>
  )
}
export const arrayFeedback: Record<string, string> = {
  INVALID_INDEX:
    'That index is outside the allowed positions. Counting starts at zero. Insert may also use the position just after the last item.',
  CAPACITY_FULL:
    'All storage positions are full. Increase capacity before inserting. Your items have been kept.',
  INVALID_CAPACITY: 'Choose a larger capacity, up to 16 positions.',
  EVIDENCE_LIMIT:
    'This attempt is too long. Reset it and try a shorter demonstration.',
}
export function ArrayControls({
  operations,
  onAction,
  disabled = false,
  fixedValue,
}: {
  operations: string[]
  onAction: (action: ModuleAction) => void
  disabled?: boolean
  fixedValue?: string
}) {
  const [operation, setOperation] = useState(operations[0])
  const [index, setIndex] = useState('0')
  const [capacity, setCapacity] = useState('4')
  const [value, setValue] = useState('map')
  function submit(e: FormEvent) {
    e.preventDefault()
    const args: ModuleAction['args'] =
      operation === 'grow'
        ? { capacity: Number(capacity) }
        : operation === 'traverse'
          ? {}
          : ['insert', 'set'].includes(operation)
            ? { index: Number(index), value: fixedValue ?? value }
            : { index: Number(index) }
    onAction({ operation, args })
  }
  return (
    <form className="array-controls" onSubmit={submit}>
      <fieldset disabled={disabled}>
        <legend>Demonstrate one operation</legend>
        <label>
          Operation
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            {operations.map((op) => (
              <option key={op}>{op}</option>
            ))}
          </select>
        </label>
        {!['grow', 'traverse'].includes(operation) && (
          <label>
            Index
            <input
              required
              type="number"
              step="1"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
            />
          </label>
        )}
        {operation === 'grow' && (
          <label>
            New capacity
            <input
              required
              type="number"
              step="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </label>
        )}
        {['insert', 'set'].includes(operation) && (
          <label>
            Item value
            <input
              required
              maxLength={32}
              readOnly={fixedValue !== undefined}
              value={fixedValue ?? value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
        )}
        <button type="submit">Apply operation</button>
      </fieldset>
    </form>
  )
}
