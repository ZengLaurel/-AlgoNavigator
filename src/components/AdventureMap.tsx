import { useRef } from 'react'
import { GemNodeButton } from './map/GemNodeButton'
import worldMapBackground from '../assets/images/world-map-bg.jpg'
import { MAP_NODES, type MapNode } from '../config/mapNodes'

const structureNames: Record<MapNode['type'], string> = {
  array: 'Array',
  'linked-list': 'Linked List',
  stack: 'Stack',
  queue: 'Queue',
}

function GemIcon() {
  return (
    <svg viewBox="0 0 64 80" fill="none" aria-hidden="true">
      <path
        d="M32 3 59 30 49 58 32 77 15 58 5 30Z"
        fill="#206d9b"
        stroke="#f6dda3"
        strokeWidth="2"
      />
      <path d="M32 3 17 30h30Z" fill="#a0f9ff" />
      <path d="m5 30 12 0 15 47-17-19Z" fill="#258eb5" />
      <path d="m59 30-12 0-15 47 17-19Z" fill="#125880" />
      <path d="M17 30h30L32 77Z" fill="#49dded" />
      <path
        d="M32 3v27m-27 0h54M17 30l15 47 15-47"
        stroke="#d3ffff"
        strokeWidth="1.4"
      />
      <path
        d="m32 15 3 12 9 3-9 3-3 12-3-12-9-3 9-3Z"
        fill="#ecffff"
        opacity=".85"
      />
    </svg>
  )
}

export interface AdventureMapProps {
  stackCompleted: boolean
  completedModules?: number
}

export function AdventureMap({
  stackCompleted,
  completedModules,
}: AdventureMapProps) {
  const lockedDialog = useRef<HTMLDialogElement>(null)
  const count = completedModules ?? (stackCompleted ? 1 : 0)

  return (
    <main className="adventure-map" aria-labelledby="map-title">
      <header className="map-toolbar">
        <div className="map-heading">
          <a href="#/" className="map-brand">
            ✦ AlgoNavigator
          </a>
          <h1 id="map-title" tabIndex={-1}>
            World Adventure Map
          </h1>
        </div>
        <div
          className="map-progress"
          aria-label={`Adventure progress: ${count} / 4 data gems`}
        >
          <span className="progress-gem">
            <GemIcon />
          </span>
          <span>
            Adventure progress <strong>{count} / 4</strong> data gems
          </span>
          <progress value={count} max={4} aria-label="Data gems collected" />
        </div>
      </header>

      <div className="map-viewport">
        <section className="map-board" aria-label="Knowledge regions">
          <img
            className="map-background"
            src={worldMapBackground}
            alt="An illustrated board-game world with Supply Camp, Misty Forest, underground ruins, and Harbor Pier connected by glowing trails."
            width={1536}
            height={1024}
            fetchPriority="high"
          />
          <nav className="map-nodes" aria-label="Choose a knowledge region">
            {MAP_NODES.map((node) => (
              <GemNodeButton
                key={node.id}
                node={node}
                label={structureNames[node.type]}
                onLockedClick={() => lockedDialog.current?.showModal()}
              />
            ))}
          </nav>
        </section>
      </div>
      <p className="map-caption">Choose a scroll to follow your curiosity.</p>
      <dialog
        ref={lockedDialog}
        className="map-locked-dialog"
        aria-labelledby="map-locked-title"
        aria-describedby="map-locked-message"
      >
        <span className="map-locked-emblem" aria-hidden="true">
          ✦
        </span>
        <h2 id="map-locked-title">Level Locked</h2>
        <p id="map-locked-message">
          This level is not unlocked yet. Explore another topic first!
        </p>
        <form method="dialog">
          <button type="submit">Back to Map</button>
        </form>
      </dialog>
    </main>
  )
}
