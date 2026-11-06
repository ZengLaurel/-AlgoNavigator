import { useState } from 'react'
import { ForkedPathRoom } from './ForkedPathRoom'
import { StairwayRepairRoom } from './StairwayRepairRoom'
import { TrialOfStonesRoom } from './TrialOfStonesRoom'

type RoomId = 'trial' | 'stairway' | 'forked'

export function GameStage() {
  const [activeRoom, setActiveRoom] = useState<RoomId>('trial')
  const [forkedUnlocked, setForkedUnlocked] = useState(false)
  const [stairwayUnlocked, setStairwayUnlocked] = useState(false)

  return (
    <main className="game-root">
      <header className="game-header">
        <p className="game-kicker">
          AlgoNavigator · A data structure adventure
        </p>
        <h1>Stack Ruins</h1>
        <p>Discover the secret of the stones, one step at a time.</p>
      </header>
      <nav className="room-trail" aria-label="Adventure rooms">
        <button
          type="button"
          aria-current={activeRoom === 'trial' ? 'step' : undefined}
          onClick={() => setActiveRoom('trial')}
        >
          01 · Trial of Stones
        </button>
        {stairwayUnlocked ? (
          <button
            type="button"
            aria-current={activeRoom === 'stairway' ? 'step' : undefined}
            onClick={() => setActiveRoom('stairway')}
          >
            02 · Stairway Repair
          </button>
        ) : (
          <span>02 · Stairway Repair · Coming next</span>
        )}
        {forkedUnlocked ? (
          <button
            type="button"
            aria-current={activeRoom === 'forked' ? 'step' : undefined}
            onClick={() => setActiveRoom('forked')}
          >
            03 · Forked Path
          </button>
        ) : (
          <span>03 · Forked Path · Coming later</span>
        )}
      </nav>
      {activeRoom === 'trial' ? (
        <TrialOfStonesRoom
          onComplete={() => {
            setStairwayUnlocked(true)
            setActiveRoom('stairway')
          }}
        />
      ) : activeRoom === 'stairway' ? (
        <StairwayRepairRoom
          onComplete={() => {
            setForkedUnlocked(true)
            setActiveRoom('forked')
          }}
        />
      ) : (
        <ForkedPathRoom />
      )}
      <p className="game-art-note">
        Prototype artwork · Final stone and guide images will replace these
        placeholders.
      </p>
    </main>
  )
}
