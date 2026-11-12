import { motion, useReducedMotion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import type {
  QueueState,
  ModuleAction,
  OperationEvent,
} from '../../engine/modules/structures'
export function QueueView({
  state,
  event,
}: {
  state: QueueState
  event?: OperationEvent
}) {
  const reduced = useReducedMotion()
  return (
    <section
      className="queue-display"
      aria-label="Harbor waiting and departures"
    >
      <h3>Waiting at the pier</h3>
      <p>Service ← FRONT · arrivals join REAR ←</p>
      <div className="queue-boats">
        {state.waiting.length ? (
          state.waiting.map((b, i) => (
            <motion.div
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
              key={b.id}
              className="queue-boat"
            >
              <small>
                {i === 0 ? 'FRONT' : ''}
                {i === 0 && i === state.waiting.length - 1 ? ' / ' : ''}
                {i === state.waiting.length - 1 ? 'REAR' : ''}
              </small>
              <strong>{b.value}</strong>
              <small>ID: {b.id}</small>
            </motion.div>
          ))
        ) : (
          <p>Empty queue · no front or rear</p>
        )}
      </div>
      <h3>Departure history</h3>
      <ol aria-label="Served boats">
        {state.served.map((b) => (
          <li key={b.id}>
            {b.value} <small>({b.id})</small>
          </li>
        ))}
      </ol>
      {!state.served.length && <p>No boats served yet.</p>}
      <p className="queue-event" aria-live="polite">
        {event
          ? event.accepted
            ? `${event.operation}${event.returned !== null ? ` returned ${event.returned}` : ''}. ${event.operation === 'peek' ? 'Peek keeps waiting and departures unchanged.' : event.operation === 'enqueue' ? 'Joined at rear.' : 'Departed from front.'}`
            : `Not applied: ${event.errorCode}. Waiting boats and departure history unchanged.`
          : 'Enqueue at rear; dequeue at front. FIFO: First In, First Out.'}
      </p>
    </section>
  )
}
export const queueFeedback: Record<string, string> = {
  EMPTY:
    'No boat is waiting. An empty queue cannot be peeked at or served. Let a boat arrive and try again.',
  EVIDENCE_LIMIT: 'Reset this attempt and use a shorter demonstration.',
  INVALID_VALUE: 'Use a boat name of at most 32 characters.',
}
export function QueueControls({
  operations,
  onAction,
  disabled = false,
  fixedValue,
}: {
  operations: string[]
  onAction: (a: ModuleAction) => void
  disabled?: boolean
  fixedValue?: string
}) {
  const [operation, setOperation] = useState(operations[0])
  const [value, setValue] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    onAction({
      operation,
      args:
        operation === 'enqueue' ? { value: fixedValue ?? value.trim() } : {},
    })
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={disabled}>
        <legend>Harbor operation</legend>
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
        {operation === 'enqueue' &&
          (fixedValue ? (
            <p>
              Arriving boat: <strong>{fixedValue}</strong>
            </p>
          ) : (
            <label>
              Boat name
              <input
                required
                maxLength={32}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </label>
          ))}
        <button>Apply operation</button>
      </fieldset>
    </form>
  )
}
