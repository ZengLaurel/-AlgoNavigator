import { useEffect, useState, useId, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  linkedOrder,
  type ArrayState,
  type LinkedListState,
  type QueueState,
  type OperationEvent,
  type Value,
} from '../../engine/modules/structures'
import './StructureStory.css'

type Phase = 0 | 1 | 2
const phases = ['1 · Before', '2 · Watch the move', '3 · After']
function StoryPlayer({
  event,
  title,
  notes,
  children,
}: {
  event?: OperationEvent
  title: string
  notes: [string, string, string]
  children: (phase: Phase) => ReactNode
}) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(event?.accepted && !reduced ? 0 : 2)
  const [playing, setPlaying] = useState(Boolean(event?.accepted && !reduced))
  useEffect(() => {
    if (!playing || phase === 2) return
    const timer = setTimeout(
      () => setPhase((p) => Math.min(2, p + 1) as Phase),
      1100,
    )
    return () => clearTimeout(timer)
  }, [playing, phase])
  return (
    <section className="structure-story" aria-label={title}>
      <header>
        <span className="story-eyebrow">Little moves, big discoveries</span>
        <h3>{title}</h3>
      </header>
      <div
        className="story-canvas"
        tabIndex={0}
        aria-label="Animated scene; scroll sideways if needed"
      >
        {children(phase)}
      </div>
      <p className="story-narration" aria-live="polite">
        <span className="story-guide-dot" aria-hidden="true" /> {notes[phase]}
      </p>
      {event?.accepted && (
        <div className="story-controls" aria-label="Slow motion controls">
          {phases.map((label, i) => (
            <button
              key={label}
              aria-pressed={phase === i}
              onClick={() => {
                setPlaying(false)
                setPhase(i as Phase)
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              if (playing && phase < 2) {
                setPlaying(false)
              } else {
                setPhase(0)
                setPlaying(true)
              }
            }}
          >
            {playing && phase < 2 ? 'Pause this move' : 'Replay this move'}
          </button>
        </div>
      )}
    </section>
  )
}
const storyKey = (event?: OperationEvent) =>
  event
    ? JSON.stringify([
        event.sequence,
        event.operation,
        event.args,
        event.before,
        event.after,
        event.accepted,
      ])
    : 'initial'
const color = (v: Value) =>
  ({
    red: '#de8267',
    blue: '#7baed2',
    green: '#8cbd83',
    A: '#e8b666',
    B: '#b3a3d5',
    C: '#7ec4bb',
    X: '#eea07c',
  })[String(v)] ?? '#9dc3ac'
function Crate({ value }: { value: Value }) {
  return (
    <g>
      <path
        d="M-35-28 L25-28 38-17 38 32-35 32Z"
        fill="#78503a"
        stroke="#422f29"
        strokeWidth="3"
      />
      <path
        d="M-35-28 25-28 12-39-46-39Z"
        fill="#d3ad73"
        stroke="#664b36"
        strokeWidth="2"
      />
      <path d="M-46-39-35-28-35 32-46 19Z" fill="#9d744c" />
      <rect
        x="-31"
        y="-23"
        width="64"
        height="48"
        rx="4"
        fill={color(value)}
        stroke="#e8cf99"
        strokeWidth="3"
      />
      <path d="M-35-18H38 M-35 21H38" stroke="#9f784e" strokeWidth="5" />
      <text
        textAnchor="middle"
        x="2"
        y="10"
        fill="#26372f"
        fontSize={String(value).length > 5 ? 12 : 19}
        fontWeight="800"
      >
        {String(value)}
      </text>
    </g>
  )
}
function Boat({ value, small = false }: { value: Value; small?: boolean }) {
  return (
    <g transform={small ? 'scale(.6)' : ''}>
      <path
        d="M-43 5H44L28 32H-26Z"
        fill={color(value)}
        stroke="#304b61"
        strokeWidth="3"
      />
      <path
        d="M0 4V-50L30-9H5"
        fill="#fff1c7"
        stroke="#845e3d"
        strokeWidth="3"
      />
      <path d="M-28 14H31" stroke="#f9dc9c" strokeWidth="4" />
      <text
        textAnchor="middle"
        y="24"
        x="0"
        fontSize={String(value).length > 5 ? 11 : 17}
        fontWeight="800"
        fill="#243f55"
      >
        {String(value)}
      </text>
    </g>
  )
}
function Backdrop({
  kind,
  width,
  height,
}: {
  kind: 'camp' | 'forest' | 'harbor'
  width: number
  height: number
}) {
  return (
    <g aria-hidden="true">
      <rect
        width={width}
        height={height}
        rx="20"
        fill={
          kind === 'harbor'
            ? '#16394e'
            : kind === 'forest'
              ? '#163d38'
              : '#304237'
        }
      />
      <circle cx={width - 90} cy="50" r="25" fill="#f7dfa1" opacity=".65" />
      {kind !== 'harbor' &&
        [20, width - 130, width - 45].map((x, i) => (
          <g key={x} transform={`translate(${x},${45 + i * 19})`}>
            <path
              d="M0 0 33 55H-30Z M0 27 45 88H-42Z"
              fill={kind === 'forest' ? '#2b6652' : '#47674c'}
            />
            <path d="M0 76V136" stroke="#8d7650" strokeWidth="8" />
          </g>
        ))}
      {kind === 'harbor' ? (
        <>
          <rect y="226" width={width} height={height - 226} fill="#215e75" />
          {[247, 281, 317, 350].map((y) => (
            <path
              key={y}
              d={`M0 ${y} Q35 ${y - 10} 70 ${y} ${Array.from({ length: Math.max(0, Math.floor(width / 70) - 1) }, (_, i) => `T${(i + 2) * 70} ${y}`).join(' ')}`}
              fill="none"
              stroke="#74b6bf"
              opacity=".32"
            />
          ))}
        </>
      ) : (
        <path
          d={`M0 ${height - 42} Q${width / 2} ${height - 95} ${width} ${height - 42}V${height}H0Z`}
          fill="#42614a"
        />
      )}
    </g>
  )
}

export function ArrayStory({
  state,
  event,
}: {
  state: ArrayState
  event?: OperationEvent
}) {
  const before = event?.before.kind === 'array' ? event.before : state
  const op = event?.accepted ? event.operation : ''
  const index = Number(event?.args.index ?? -1)
  const target = before.items[index]
  const title =
    op === 'insert'
      ? 'Make a place for a new supply'
      : op === 'remove'
        ? 'Take a box, then close the gap'
        : op === 'grow'
          ? 'Move into a bigger store'
          : op === 'set'
            ? 'Change what is in one box'
            : op === 'get'
              ? 'Find a box by its place'
              : 'The numbered supply shelf'
  const notes: [string, string, string] =
    op === 'insert'
      ? [
          'The new box needs a place. Keep every old box.',
          'Slide the later boxes one place right. Now there is a gap.',
          'Lower the new box into the gap. Nobody lost their supplies.',
        ]
      : op === 'remove'
        ? [
            'Choose the box at this place.',
            'Lift that box away. The others have not closed the gap yet.',
            'Slide the later boxes left. The shelf has no empty gap.',
          ]
        : op === 'grow'
          ? [
              'This shelf has a limited number of places.',
              'Lift the supplies. A bigger shelf is ready below.',
              'Put them down in the same order. More empty places, same supplies.',
            ]
          : op === 'set'
            ? [
                'Find the numbered place.',
                'Open this box and change its contents. Other boxes stay still.',
                'The box is in the same place; only its value changed.',
              ]
            : op === 'get'
              ? [
                  'Read the place labels. The first place is 0.',
                  'The lantern points at the requested box. Just look inside.',
                  'Reading does not remove a box or move its neighbours.',
                ]
              : op === 'traverse'
                ? [
                    'Start at place 0.',
                    'Follow the lantern across every used place. Skip empty spaces.',
                    'All supplies have been checked in order.',
                  ]
                : [
                    'Each supply has a numbered place. The first label is 0.',
                    'Use a place label to find a supply.',
                    'A row of numbered places: 0, 1, 2… Empty places are spare room.',
                  ]
  const width = Math.max(
    480,
    80 + Math.max(state.capacity, before.capacity) * 96,
  )
  const reduced = useReducedMotion()
  return (
    <StoryPlayer
      key={storyKey(event)}
      event={event}
      title={title}
      notes={
        event && !event.accepted
          ? [
              'The move could not happen.',
              'Your supplies are safe.',
              'Nothing was changed. Check the hint, then try again.',
            ]
          : notes
      }
    >
      {(phase) => {
        const active = phase === 0 ? before : state
        const growing = op === 'grow'
        const y = growing ? (phase === 0 ? 145 : phase === 1 ? 205 : 295) : 187
        const items =
          op === 'insert'
            ? state.items
            : op === 'remove'
              ? before.items
              : active.items
        return (
          <svg
            className="story-svg"
            style={{ minWidth: Math.max(360, width > 650 ? width : 0) }}
            viewBox={`0 0 ${width} ${growing ? 410 : 320}`}
            role="img"
            aria-label={`Supply boxes, ${phases[phase]}`}
          >
            <Backdrop kind="camp" width={width} height={growing ? 410 : 320} />
            <text x="35" y="40" className="story-sign">
              SUPPLY CAMP · EVERY PLACE HAS A NUMBER
            </text>
            {growing && (
              <g opacity={phase === 0 ? 1 : 0.3}>
                <rect
                  x="22"
                  y="180"
                  width={before.capacity * 96 + 20}
                  height="15"
                  rx="4"
                  fill="#bd9361"
                />
                <text x="35" y="105" className="story-label">
                  Old shelf · {before.capacity} places
                </text>
              </g>
            )}
            <g>
              {Array.from(
                {
                  length:
                    growing && phase === 0 ? before.capacity : state.capacity,
                },
                (_, i) => (
                  <g
                    key={i}
                    transform={`translate(${65 + i * 96},${growing ? (phase === 0 ? 145 : 295) : 187})`}
                  >
                    <rect
                      x="-43"
                      y="34"
                      width="87"
                      height="12"
                      rx="3"
                      fill="#cba879"
                    />
                    <rect
                      x="-43"
                      y="-38"
                      width="87"
                      height="72"
                      rx="4"
                      fill="none"
                      stroke="#d6bd87"
                      strokeDasharray="4 5"
                      opacity=".7"
                    />
                    <text textAnchor="middle" y="70" className="story-label">
                      {i}
                    </text>
                  </g>
                ),
              )}
            </g>
            {growing && phase > 0 && (
              <text x="35" y="385" className="story-label">
                Bigger shelf · {state.capacity} places
              </text>
            )}
            {items.map((item) => {
              const finalIndex = state.items.findIndex((x) => x.id === item.id)
              const oldIndex = before.items.findIndex((x) => x.id === item.id)
              const arriving = op === 'insert' && oldIndex < 0
              const leaving = op === 'remove' && item.id === target?.id
              const position =
                phase === 0
                  ? arriving
                    ? index
                    : oldIndex
                  : phase === 1 && op === 'remove'
                    ? oldIndex
                    : finalIndex
              return (
                <motion.g
                  key={item.id}
                  data-story-item={item.id}
                  data-place={position}
                  aria-hidden={
                    (arriving && phase === 0) || (leaving && phase === 2)
                  }
                  initial={false}
                  animate={{
                    x: 65 + Math.max(0, position) * 96,
                    y:
                      leaving && phase > 0
                        ? 80
                        : arriving && phase < 2
                          ? 88
                          : y,
                    opacity:
                      (arriving && phase === 0) || (leaving && phase === 2)
                        ? 0
                        : leaving && phase === 1
                          ? 0.5
                          : 1,
                  }}
                  transition={{ duration: reduced ? 0 : 0.8 }}
                >
                  <Crate value={item.value} />
                </motion.g>
              )
            })}
            {['get', 'set', 'traverse'].includes(op) && phase > 0 && (
              <g>
                <motion.circle
                  key={storyKey(event)}
                  cx={65 + Math.max(0, index) * 96}
                  cy="187"
                  r="48"
                  fill="#ffe69b"
                  opacity=".19"
                  animate={
                    op === 'traverse' && !reduced
                      ? { cx: before.items.map((_, i) => 65 + i * 96) }
                      : {}
                  }
                  transition={{ duration: 1 }}
                />
                <text x="35" y="90" className="story-label">
                  {op === 'get'
                    ? `Look inside: ${event?.returned}`
                    : op === 'set'
                      ? 'Same place · new contents'
                      : 'Check each used place →'}
                </text>
              </g>
            )}
            {!growing && (
              <text x="35" y="290" className="story-label">
                Place 0 is first. Boxes move; the place labels stay.
              </text>
            )}
          </svg>
        )
      }}
    </StoryPlayer>
  )
}

const nodePoint = (i: number) => ({
  x: 140 + (i % 2) * 260,
  y: 150 + Math.floor(i / 2) * 170,
})
const rope = (from: number, to: number) => {
  const a = nodePoint(from),
    b = nodePoint(to)
  return `M${a.x + 34},${a.y} C${a.x + 105},${a.y - 72} ${b.x - 105},${b.y - 72} ${b.x - 38},${b.y}`
}
export function LinkedStory({
  state,
  event,
}: {
  state: LinkedListState
  event?: OperationEvent
}) {
  const reduced = useReducedMotion()
  const before = event?.before.kind === 'linked-list' ? event.before : state
  const op = event?.accepted ? event.operation : ''
  let visitOnTrail = true
  if (op === 'visit') {
    try {
      visitOnTrail = linkedOrder(before).includes(String(event?.args.id))
    } catch {
      visitOnTrail = false
    }
  }
  const notes: [string, string, string] =
    op === 'visit'
      ? [
          'Find the first beacon by the HEAD sign.',
          'Follow the labelled rope to the beacon you want to read.',
          'Look at its mark. The beacon and its ropes stay in place.',
        ]
      : op === 'removeHead'
        ? [
            'The HEAD sign points to the first beacon.',
            'Move HEAD to that beacon’s next friend.',
            'The old first beacon is off the trail. If none remain, HEAD points to None.',
          ]
        : op.startsWith('remove')
          ? [
              'Keep the trail after the beacon we are removing.',
              'Connect the previous friend directly to the next one.',
              'The trail skips the removed beacon. Its stone still exists off the trail.',
            ]
          : op === 'insertHead'
            ? [
                'A new beacon is waiting off the trail.',
                'Tie its rope to the old first beacon, then move HEAD to it.',
                'Start from the new HEAD. The old trail is still connected.',
              ]
            : op === 'insertAfter'
              ? [
                  'Remember the rope to the next friend.',
                  'The new friend keeps that rope; the previous friend connects to the newcomer.',
                  'Follow both ropes. The friends after the new beacon are still reachable.',
                ]
              : op === 'link'
                ? [
                    'Find the stone whose rope will change.',
                    'The faded rope is the old route. Tie the glowing rope to the new friend.',
                    'Follow the new rope. Have we kept the rest of the trail?',
                  ]
                : op === 'setHead'
                  ? [
                      'HEAD is the sign that starts the trail.',
                      'Move the sign to the chosen beacon.',
                      'The stones did not move. The starting reference changed.',
                    ]
                  : [
                      'Every beacon is a stone with its own name.',
                      'Ropes tell you who comes next.',
                      'Follow the ropes, not the order of the pictures. None means the trail ends.',
                    ]
  const markerId = `story-arrow-${useId().replaceAll(':', '')}`
  const height = 145 + Math.ceil(state.nodes.length / 2) * 170
  return (
    <StoryPlayer
      key={storyKey(event)}
      event={event}
      title="Follow the glowing forest ropes"
      notes={
        op === 'visit' && !visitOnTrail
          ? [
              'This beacon is waiting off the HEAD trail.',
              'You can read its mark, but no HEAD rope leads here yet.',
              'Reading a beacon does not connect it. Its ropes still need a place on the trail.',
            ]
          : notes
      }
    >
      {(phase) => {
        const current =
          phase === 0
            ? before
            : phase === 1 && ['insertHead', 'insertAfter'].includes(op)
              ? {
                  ...state,
                  head: before.head,
                  nodes: state.nodes.map((n) =>
                    n.id === event?.args.id
                      ? n
                      : (before.nodes.find((old) => old.id === n.id) ?? n),
                  ),
                }
              : state
        let order: string[] = []
        let cycle = false
        try {
          order = linkedOrder(current)
        } catch {
          cycle = true
        }
        const target = event?.args.id
        const headIndex = state.nodes.findIndex((n) => n.id === current.head)
        let visitTrail: string[] = []
        try {
          visitTrail = linkedOrder(before)
        } catch {
          /* An invalid trail cannot guide a walk. */
        }
        const trailIndex = visitTrail.indexOf(String(target))
        const targetSlot = state.nodes.findIndex((n) => n.id === target)
        const previousSlot = state.nodes.findIndex(
          (n) => n.id === visitTrail[trailIndex - 1],
        )
        const visitEnd = nodePoint(Math.max(0, targetSlot))
        const visitStart =
          previousSlot >= 0
            ? nodePoint(previousSlot)
            : { ...visitEnd, y: visitEnd.y - 83 }
        return (
          <svg
            className="story-svg"
            style={{ minWidth: 360 }}
            viewBox={`0 0 600 ${height}`}
            role="img"
            aria-label={`Forest beacons and next ropes, ${phases[phase]}`}
          >
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0 0 10 5 0 10Z" fill="#f8db87" />
              </marker>
            </defs>
            <Backdrop kind="forest" width={600} height={height} />
            <text x="30" y="38" className="story-sign">
              MISTY FOREST · FOLLOW THE ROPES
            </text>
            {phase === 1 &&
              op !== 'visit' &&
              before.nodes.map((n, i) => {
                const j = state.nodes.findIndex((x) => x.id === n.next)
                return j >= 0 && n.next !== current.nodes[i]?.next ? (
                  <path
                    key={`old-${n.id}`}
                    d={rope(i, j)}
                    fill="none"
                    stroke="#df9681"
                    strokeWidth="4"
                    strokeDasharray="8 7"
                    opacity=".45"
                  />
                ) : null
              })}
            {current.nodes.map((n, i) => {
              const j = state.nodes.findIndex((x) => x.id === n.next)
              const changed =
                phase > 0 &&
                before.nodes.find((x) => x.id === n.id)?.next !== n.next
              return j >= 0 ? (
                <motion.path
                  key={`${n.id}-${n.next}`}
                  data-from={n.id}
                  data-to={n.next}
                  aria-label={`Rope from ${n.id} to ${n.next}`}
                  d={rope(i, j)}
                  fill="none"
                  stroke={changed ? '#83f0d8' : '#f8db87'}
                  strokeWidth={changed ? 6 : 4}
                  markerEnd={`url(#${markerId})`}
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
              ) : (
                <g key={n.id}>
                  <path
                    d={`M${nodePoint(i).x + 34},${nodePoint(i).y}h60`}
                    stroke="#f8db87"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={nodePoint(i).x + 48}
                    y={nodePoint(i).y - 12}
                    className="story-small"
                  >
                    None
                  </text>
                </g>
              )
            })}
            {headIndex >= 0 ? (
              <motion.g
                data-head={current.head}
                initial={false}
                animate={{
                  x: nodePoint(headIndex).x,
                  y: nodePoint(headIndex).y - 83,
                }}
                transition={{ duration: reduced ? 0 : 0.8 }}
              >
                <rect
                  x="-39"
                  y="-20"
                  width="78"
                  height="28"
                  rx="6"
                  fill="#b7dbe2"
                />
                <text textAnchor="middle" fill="#1c454a" fontWeight="900">
                  HEAD ↓
                </text>
              </motion.g>
            ) : (
              <text data-head="None" x="30" y="78" className="story-label">
                HEAD → None · empty trail
              </text>
            )}
            {state.nodes.map((n, i) => {
              const p = nodePoint(i),
                lit = phase > 0 && op === 'visit' && target === n.id
              return (
                <g
                  key={n.id}
                  data-story-node={n.id}
                  transform={`translate(${p.x},${p.y})`}
                >
                  <ellipse
                    cy="52"
                    rx="54"
                    ry="15"
                    fill="#091f22"
                    opacity=".45"
                  />
                  <path
                    d="M-40 42-33-37-12-54 27-48 41-20 43 42Z"
                    fill={lit ? '#e5d888' : '#a3b9a2'}
                    stroke="#4f7264"
                    strokeWidth="4"
                  />
                  <path
                    d="M-30-30-8-43 21-38M-28 29 12 32"
                    stroke="#d9e1ba"
                    strokeWidth="4"
                  />
                  <text
                    textAnchor="middle"
                    y="-12"
                    fill="#24483e"
                    fontSize="24"
                    fontWeight="900"
                  >
                    {n.id}
                  </text>
                  <text textAnchor="middle" y="18" fill="#24483e" fontSize="16">
                    {n.value}
                  </text>
                  <text textAnchor="middle" y="83" className="story-small">
                    {cycle
                      ? 'Check the loop'
                      : order.includes(n.id)
                        ? 'On the trail'
                        : 'Waiting off the trail'}
                  </text>
                  {lit && (
                    <motion.circle
                      r="9"
                      cy="-64"
                      fill="#fff6b3"
                      initial={reduced ? false : { scale: 0.3 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </g>
              )
            })}
            {op === 'visit' && phase > 0 && targetSlot >= 0 && (
              <motion.circle
                key={storyKey(event)}
                data-visit-target={String(target)}
                r="9"
                fill="#fff5a0"
                stroke="#d7e8ac"
                strokeWidth="3"
                initial={
                  reduced || trailIndex < 0
                    ? false
                    : { cx: visitStart.x, cy: visitStart.y }
                }
                animate={{
                  cx:
                    !reduced && phase === 1 && trailIndex >= 0
                      ? [
                          visitStart.x,
                          (visitStart.x + visitEnd.x) / 2,
                          visitEnd.x,
                        ]
                      : visitEnd.x,
                  cy:
                    !reduced && phase === 1 && trailIndex >= 0
                      ? [
                          visitStart.y,
                          previousSlot >= 0
                            ? Math.min(visitStart.y, visitEnd.y) - 72
                            : (visitStart.y + visitEnd.y - 64) / 2,
                          visitEnd.y - 64,
                        ]
                      : visitEnd.y - 64,
                }}
                transition={{ duration: reduced ? 0 : 0.9 }}
              />
            )}
            <text x="30" y={height - 37} className="story-label">
              {cycle
                ? 'A rope makes a loop! Repair it to reach None.'
                : 'Same mark, different friends. Follow the names and ropes.'}
            </text>
          </svg>
        )
      }}
    </StoryPlayer>
  )
}

export function QueueStory({
  state,
  event,
}: {
  state: QueueState
  event?: OperationEvent
}) {
  const reduced = useReducedMotion()
  const before = event?.before.kind === 'queue' ? event.before : state
  const op = event?.accepted ? event.operation : ''
  const notes: [string, string, string] =
    op === 'enqueue'
      ? [
          'The boats already waiting keep their turns.',
          'A new boat sails in from the right, behind everyone waiting.',
          'The newcomer is at the REAR. The first boat is still first.',
        ]
      : op === 'dequeue'
        ? [
            'Find the FRONT: this boat has waited longest.',
            'Only that boat sails out. The others keep waiting.',
            'The next waiting boat becomes FRONT. Record who left.',
          ]
        : op === 'peek'
          ? [
              'Look at the first waiting boat.',
              'The lantern looks at it. No boat is leaving!',
              'Same waiting boats, same departure history. Peek only looks.',
            ]
          : [
              'The harbor serves boats in arrival order.',
              'New boats join the back; the first waiting boat leaves first.',
              'FRONT leaves first. REAR is where newcomers join.',
            ]
  const width = Math.max(
    520,
    230 + Math.max(before.waiting.length, state.waiting.length) * 130,
    390 + state.served.length * 83,
  )
  return (
    <StoryPlayer
      key={storyKey(event)}
      event={event}
      title="Fair turns at the little harbor"
      notes={
        event && !event.accepted
          ? [
              event.errorCode === 'EMPTY'
                ? 'No boat is waiting.'
                : 'This move could not happen.',
              'No waiting boat or departure was changed.',
              'Check the hint, then try again.',
            ]
          : notes
      }
    >
      {(phase) => {
        const departing = op === 'dequeue' && phase === 1
        const waiting =
          op === 'enqueue'
            ? state.waiting
            : phase < 2
              ? before.waiting
              : state.waiting
        const served = phase === 2 ? state.served : before.served
        const visibleCount =
          op === 'enqueue' && phase === 0
            ? before.waiting.length
            : waiting.length
        return (
          <svg
            className="story-svg"
            style={{ minWidth: Math.max(360, width > 650 ? width : 0) }}
            viewBox={`0 0 ${width} 410`}
            role="img"
            aria-label={`Boats at the harbor, ${phases[phase]}`}
          >
            <Backdrop kind="harbor" width={width} height={410} />
            <text x="30" y="38" className="story-sign">
              HARBOR PIER · EVERY BOAT GETS ITS TURN
            </text>
            <rect
              x="94"
              y="225"
              width={width - 124}
              height="17"
              rx="4"
              fill="#d3ac78"
            />
            <path
              d={`M110 240V265M${width - 50} 240V265`}
              stroke="#826344"
              strokeWidth="13"
            />
            <text x="25" y="111" className="story-label">
              SAIL OUT
            </text>
            <path
              d="M105 139H34L48 128M34 139 48 150"
              fill="none"
              stroke="#b4e8e3"
              strokeWidth="4"
            />
            {waiting.map((b, i) => {
              const oldIndex = before.waiting.findIndex((x) => x.id === b.id)
              const arriving = op === 'enqueue' && oldIndex < 0
              return (
                <motion.g
                  key={b.id}
                  data-story-boat={b.id}
                  aria-hidden={arriving && phase === 0}
                  initial={false}
                  animate={{
                    x:
                      arriving && phase === 0
                        ? width - 55
                        : departing && i === 0
                          ? 48
                          : 175 + i * 130,
                    y:
                      arriving && phase < 2
                        ? 105
                        : departing && i === 0
                          ? 290
                          : 198,
                    opacity:
                      arriving && phase === 0
                        ? 0
                        : departing && i === 0
                          ? 0.65
                          : 1,
                  }}
                  transition={{ duration: reduced ? 0 : 0.85 }}
                >
                  <Boat value={b.value} />
                  {i === 0 && !(arriving && phase === 0) && (
                    <text textAnchor="middle" y="-72" className="story-label">
                      FRONT
                    </text>
                  )}
                  {i === visibleCount - 1 && !(arriving && phase === 0) && (
                    <text textAnchor="middle" y="66" className="story-label">
                      {arriving && phase === 1 ? 'New arrival ↓' : 'REAR'}
                    </text>
                  )}
                </motion.g>
              )
            })}
            {op === 'peek' && phase > 0 && waiting.length > 0 && (
              <g>
                <path d="M175 93 125 225H225Z" fill="#fff5b3" opacity=".18" />
                <circle cx="175" cy="85" r="14" fill="#ffdc8a" />
                <text x="250" y="100" className="story-label">
                  Just looking: {event?.returned}
                </text>
              </g>
            )}
            {!visibleCount && (
              <text x="150" y="177" className="story-label">
                No waiting boat · no FRONT or REAR
              </text>
            )}
            <text x="35" y="343" className="story-label">
              Already sailed out, in order:
            </text>
            {served.map((b, i) => (
              <g
                key={b.id}
                data-served-boat={b.id}
                transform={`translate(${325 + i * 83},360)`}
              >
                <Boat value={b.value} small />
                <text textAnchor="middle" y="39" className="story-small">
                  {i + 1}
                </text>
              </g>
            ))}
            {!served.length && (
              <text x="330" y="359" className="story-small">
                Nobody yet
              </text>
            )}
          </svg>
        )
      }}
    </StoryPlayer>
  )
}
