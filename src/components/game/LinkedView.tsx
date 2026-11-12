import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  linkedOrder,
  type LinkedListState,
  type ModuleAction,
  type OperationEvent,
} from '../../engine/modules/structures'
export function LinkedView({
  state,
  event,
}: {
  state: LinkedListState
  event?: OperationEvent
}) {
  const reduced = useReducedMotion()
  let order: string[] = []
  let error = ''
  try {
    order = linkedOrder(state)
  } catch (e) {
    error = e instanceof Error ? e.message : 'INVALID_REFERENCE'
  }
  const visited =
    event?.accepted && event.operation === 'visit' ? event.args.id : null
  return (
    <section className="linked-display" aria-label="Linked beacon references">
      <p>
        <strong>head → {state.head ?? 'None'}</strong>
      </p>
      <p aria-live="polite">
        {error
          ? `${error}: the path cannot terminate. Repair next or head; all nodes are still available.`
          : `Path: ${[...order, 'None'].join(' → ')}`}
      </p>
      <p>
        Nodes below stay in storage order. Follow their labelled arrows, not
        their neighbours.
      </p>
      <div className="linked-nodes">
        {state.nodes.map((n) => (
          <motion.div
            key={n.id}
            className={`linked-node ${n.id === visited ? 'current' : ''}`}
            animate={{ scale: !reduced && n.id === visited ? 1.04 : 1 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            <small>
              Node ID: {n.id}
              {n.id === state.head ? ' · HEAD' : ''}
              {n.id === visited ? ' · CURRENT' : ''}
            </small>
            <strong>{n.value}</strong>
            <motion.span
              key={n.next}
              initial={reduced ? false : { opacity: 0.2 }}
              animate={{ opacity: 1 }}
            >
              next → {n.next ?? 'None'}
            </motion.span>
            <small>
              {error
                ? 'Path unresolved: repair the cycle'
                : order.includes(n.id)
                  ? 'On head path'
                  : 'Off head path'}
            </small>
          </motion.div>
        ))}
      </div>
      <p className="linked-event" aria-live="polite">
        {event
          ? event.accepted
            ? `${event.operation} ${JSON.stringify(event.args)}${event.returned !== null ? ` returned ${event.returned}` : ''}`
            : `Not applied: ${event.errorCode}. References unchanged.`
          : 'Inspect node IDs, values and next references.'}
      </p>
    </section>
  )
}
export const linkedFeedback: Record<string, string> = {
  INVALID_REFERENCE:
    'That node ID does not exist or is not reachable where required. Check the labelled references.',
  ALREADY_LINKED:
    'Choose a detached node with next None. Preserve the existing path.',
  CYCLE:
    'A node repeats on the path. Repair a link with link or setHead, then try again.',
  EMPTY: 'There is no node to remove here. Check head and next.',
  EVIDENCE_LIMIT: 'Reset this attempt and use a shorter demonstration.',
}
export function LinkedControls({
  operations,
  onAction,
  disabled = false,
}: {
  operations: string[]
  onAction: (a: ModuleAction) => void
  disabled?: boolean
  fixedValue?: string
}) {
  const [operation, setOperation] = useState(operations[0])
  const [id, setId] = useState('')
  const [next, setNext] = useState('')
  const [previous, setPrevious] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    const args: ModuleAction['args'] = {}
    if (
      ['visit', 'link', 'insertHead', 'insertAfter', 'setHead'].includes(
        operation,
      )
    )
      args.id = id.trim() === 'None' ? null : id.trim()
    if (operation === 'link')
      args.nextId = next.trim() === 'None' ? null : next.trim()
    if (['insertAfter', 'removeAfter'].includes(operation))
      args.previousId = previous.trim()
    onAction({ operation, args })
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={disabled}>
        <legend>Beacon operation</legend>
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
        {['visit', 'link', 'insertHead', 'insertAfter', 'setHead'].includes(
          operation,
        ) && (
          <label>
            Node ID
            <input
              required
              value={id}
              maxLength={40}
              onChange={(e) => setId(e.target.value)}
              placeholder="a (or None for setHead)"
            />
          </label>
        )}
        {operation === 'link' && (
          <label>
            Next ID
            <input
              required
              value={next}
              maxLength={40}
              onChange={(e) => setNext(e.target.value)}
              placeholder="b or None"
            />
          </label>
        )}
        {['insertAfter', 'removeAfter'].includes(operation) && (
          <label>
            Previous ID
            <input
              required
              value={previous}
              maxLength={40}
              onChange={(e) => setPrevious(e.target.value)}
            />
          </label>
        )}
        <button>Apply operation</button>
      </fieldset>
    </form>
  )
}
