import { lazy, Suspense, useEffect, useState } from 'react'
import { loadProgress, saveProgress } from '../../engine/gameProgress'
import { RoomLoadBoundary } from './RoomLoadBoundary'
import { TrialOfStonesRoom } from './TrialOfStonesRoom'
import { AdventureSkillHandbook } from './AdventureSkillHandbook'
import { readStackCompleted } from '../../adventureProgress'
import {
  loadTeachingProgress,
  saveTeachingProgress,
} from '../../engine/stackTeaching'

const StairwayRepairRoom = lazy(() =>
  import('./StairwayRepairRoom').then((room) => ({
    default: room.StairwayRepairRoom,
  })),
)
const ForkedPathRoom = lazy(() =>
  import('./ForkedPathRoom').then((room) => ({ default: room.ForkedPathRoom })),
)
const StackPracticeRoom = lazy(() =>
  import('./StackPracticeRoom').then((room) => ({
    default: room.StackPracticeRoom,
  })),
)

type RoomId = 'trial' | 'stairway' | 'forked' | 'practice'

export function GameStage({ onComplete }: { onComplete?: () => void }) {
  const [activeRoom, setActiveRoom] = useState<RoomId>('trial')
  const [progress, setProgress] = useState(loadProgress)
  const [teaching, setTeaching] = useState(() => {
    const saved = loadTeachingProgress()
    return { ...saved, unlocked: saved.unlocked || readStackCompleted() }
  })
  const [teachingStorageFailed, setTeachingStorageFailed] = useState(false)
  function updateTeaching(next: typeof teaching) {
    setTeaching(next)
    setTeachingStorageFailed(!saveTeachingProgress(next))
  }
  const forkedUnlocked = progress.unlockedThrough >= 3
  const stairwayUnlocked = progress.unlockedThrough >= 2
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  return (
    <main className="game-root">
      <header className="game-header">
        <p className="game-kicker">
          AlgoNavigator · A data structure adventure
        </p>
        <h1 tabIndex={-1}>Stack Ruins</h1>
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
      {teaching.unlocked && (
        <nav className="room-trail" aria-label="Extra Stack practice">
          <button
            type="button"
            aria-current={activeRoom === 'practice' ? 'step' : undefined}
            onClick={() => setActiveRoom('practice')}
          >
            04 · Teach Xiao Tuo
          </button>
        </nav>
      )}
      {teachingStorageFailed && (
        <p role="alert">
          Teaching progress is available this session, but this browser could
          not save it.
        </p>
      )}
      <RoomLoadBoundary
        key={activeRoom}
        onReturnToTrial={() => setActiveRoom('trial')}
      >
        <Suspense
          fallback={
            <p role="status" aria-live="polite">
              Loading{' '}
              {activeRoom === 'stairway'
                ? 'Stairway Repair'
                : activeRoom === 'practice'
                  ? 'Stack practice'
                  : 'Forked Path'}
              … You can return to Trial of Stones while you wait.
            </p>
          }
        >
          {activeRoom === 'trial' ? (
            <TrialOfStonesRoom
              onComplete={() => {
                setProgress((current) => ({
                  version: 1,
                  unlockedThrough: current.unlockedThrough === 3 ? 3 : 2,
                }))
                setActiveRoom('stairway')
              }}
            />
          ) : activeRoom === 'stairway' ? (
            <StairwayRepairRoom
              onComplete={() => {
                setProgress({ version: 1, unlockedThrough: 3 })
                setActiveRoom('forked')
              }}
            />
          ) : activeRoom === 'forked' ? (
            <ForkedPathRoom
              onComplete={() => {
                if (!teaching.unlocked)
                  updateTeaching({ ...teaching, unlocked: true })
                onComplete?.()
              }}
              onPractice={() => setActiveRoom('practice')}
            />
          ) : (
            <StackPracticeRoom
              mastered={teaching.mastered}
              onMastered={(id) => {
                if (!teaching.mastered.includes(id))
                  updateTeaching({
                    ...teaching,
                    mastered: [...teaching.mastered, id],
                  })
              }}
            />
          )}
        </Suspense>
      </RoomLoadBoundary>
      <p className="game-art-note">
        Prototype artwork · Final stone and guide images will replace these
        placeholders.
      </p>
      <AdventureSkillHandbook />
    </main>
  )
}
