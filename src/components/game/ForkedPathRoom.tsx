import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ASSETS } from '../../assets'
import {
  backtrack,
  createPathState,
  generateMaze,
  isPathComplete,
  moveToRoom,
  roomLabel,
  type RoomNode,
} from '../../engine/path/pathState'
import { ForkedPathMap } from './ForkedPathMap'
import { PathStackRenderer } from './PathStackRenderer'

export function ForkedPathRoom({
  generate = generateMaze,
}: {
  generate?: () => Record<string, RoomNode>
}) {
  const [state, setState] = useState(() => createPathState(generate()))
  const [moving, setMoving] = useState(false)
  const [message, setMessage] = useState(
    'The entrance is already on the stack. Choose a connected room.',
  )
  const locked = useRef(false)
  const reducedMotion = Boolean(useReducedMotion())
  const complete = isPathComplete(state)
  // Fallback also releases the lock if animation callbacks are interrupted.
  useEffect(() => {
    if (!moving) return
    const timer = window.setTimeout(
      () => {
        locked.current = false
        setMoving(false)
      },
      reducedMotion ? 0 : 450,
    )
    return () => window.clearTimeout(timer)
  }, [moving, reducedMotion])
  const move = (target?: string) => {
    if (locked.current || complete) return
    const next = target ? moveToRoom(state, target) : backtrack(state)
    if (next === state) return
    locked.current = !reducedMotion
    setMoving(!reducedMotion)
    setMessage(
      `${next.pathStack.length < state.pathStack.length ? `pop: removed the card for ${roomLabel(state.nodes[state.currentNodeId])}; returned to` : 'push: entered'} ${roomLabel(next.nodes[next.currentNodeId])}. ${next.nodes[next.currentNodeId].type === 'deadEnd' ? 'A dead end! Pop to backtrack.' : ''}`,
    )
    setState(next)
  }
  return (
    <section className="forked-room" aria-labelledby="forked-heading">
      <header className="trial-heading">
        <div>
          <p className="game-kicker">Room 03 · Explore</p>
          <h2 id="forked-heading">Forked Path</h2>
        </div>
        <span>{complete ? 'Adventure complete' : 'Find the exit'}</span>
      </header>
      <aside className="stairway-help" aria-labelledby="path-guide-heading">
        <h3 id="path-guide-heading">Your trail of room cards</h3>
        <p>
          Imagine a stack of room cards that remembers the way you came. The
          entrance card starts at the bottom. The top card is the room you are
          in now.
        </p>
        <ol>
          <li>
            Move forward into a connected room: push its card on top. That room
            is now your current room.
          </li>
          <li>
            At a dead end, there is no way forward. Use Backtrack (pop) to take
            away the card for the room you are leaving, not the room you are
            returning to. The card underneath becomes the top: you are back in
            that previous room.
          </li>
          <li>
            Back at a fork, try another connected branch. For example, entrance
            → fork → dead end becomes entrance → fork after pop. Moving into a
            different branch pushes that room onto the remaining path.
          </li>
        </ol>
        <p>
          Explored marks remember everywhere you have visited, even when a card
          is popped off your current path. You can explore those branches again.
          The entrance card cannot be popped: it keeps the start of your trail
          safe. Find the exit to finish!
        </p>
      </aside>
      <div className="forked-layout">
        <div>
          <ForkedPathMap
            state={state}
            moving={moving}
            reducedMotion={reducedMotion}
            onMove={move}
            onMoveEnd={() => {
              locked.current = false
              setMoving(false)
            }}
          />
          <p className="scene-label">
            IN = entrance · Y = fork · ↔ = corridor · × = dead end · OUT = exit
            · ✓ = explored · gold line = current path
          </p>
        </div>
        <aside className="path-sidebar" aria-label="Path stack sidebar">
          <h3>Path stack</h3>
          <p>Top = current room</p>
          <PathStackRenderer state={state} />
          <p>Current: {roomLabel(state.nodes[state.currentNodeId])}</p>
          <p>
            Explored: {state.visited.size} / {Object.keys(state.nodes).length}
          </p>
          <button
            type="button"
            disabled={moving || complete || state.pathStack.length === 1}
            onClick={() => move()}
          >
            Backtrack (pop)
          </button>
          {state.pathStack.length === 1 && (
            <p>The entrance cannot be popped.</p>
          )}
        </aside>
      </div>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {complete && (
        <div className="trial-completion" role="status">
          <h3>Stack Ruins complete!</h3>
          {ASSETS['badge-stack'].src ? (
            <img
              src={ASSETS['badge-stack'].src!}
              alt={ASSETS['badge-stack'].alt}
              width={96}
              height={96}
            />
          ) : (
            <svg
              role="img"
              aria-label="Stack explorer badge"
              width={96}
              height={96}
              viewBox="0 0 96 96"
            >
              <circle
                cx={48}
                cy={48}
                r={42}
                fill="#334155"
                stroke="#facc15"
                strokeWidth={4}
              />
              <text x={48} y={55} textAnchor="middle" fill="#facc15">
                LIFO
              </text>
            </svg>
          )}
          <p>
            You used a stack to explore, backtrack, and find the exit.
            Exploration is now frozen.
          </p>
          <button
            type="button"
            onClick={() => {
              locked.current = false
              setMoving(false)
              setState(createPathState(generate()))
              setMessage('New maze. The entrance is already on the stack.')
            }}
          >
            Replay with a new maze
          </button>
        </div>
      )}
    </section>
  )
}
