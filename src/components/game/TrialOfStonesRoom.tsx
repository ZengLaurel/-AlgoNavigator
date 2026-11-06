import { useCallback, useState } from 'react'
import { AnimationStage } from '../AnimationStage'
import { trialOfStonesSteps } from '../../content/trialOfStonesSteps'
import { MagicStairs } from './MagicStairs'
import { RuinsDoor } from './RuinsDoor'
import { RuinsSwitch } from './RuinsSwitch'
import { Sprite } from './Sprite'
import { StoneStackRenderer } from './StoneStackRenderer'

export function TrialOfStonesRoom() {
  const [completed, setCompleted] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const handleFrameChange = useCallback((_frame: number, atEnd: boolean) => {
    if (atEnd) setCompleted(true)
  }, [])

  return (
    <section className="stone-trial" aria-labelledby="trial-heading">
      <header className="trial-heading">
        <div>
          <p className="game-kicker">Room 01 · Discover</p>
          <h2 id="trial-heading">Trial of Stones</h2>
        </div>
        <span className="trial-status">
          {completed ? 'Trial complete' : 'Watch the stones'}
        </span>
      </header>

      <p className="trial-intro">
        The ruins hold a secret: stones can only leave from the top. Watch their
        order to awaken the ancient gate.
      </p>

      <AnimationStage
        key={attempt}
        steps={trialOfStonesSteps}
        onFrameChange={handleFrameChange}
        render={(state, maxSlotCount) => (
          <div className="ruins-scene" aria-label="Ruins hall">
            <div className="ruins-arch ruins-arch-left" aria-hidden="true" />
            <div className="ruins-arch ruins-arch-right" aria-hidden="true" />
            <div className="ruins-floor" aria-hidden="true" />
            <span className="scene-inscription" aria-hidden="true">
              I · II · III
            </span>
            <div className="stone-pedestal">
              <span className="scene-label">The stone stack</span>
              <StoneStackRenderer state={state} slotCount={maxSlotCount} />
              <span className="pedestal-base" aria-hidden="true" />
            </div>
            <div className="scene-guide">
              <Sprite pose={completed ? 'happy' : 'guide'} />
            </div>
            <div className="scene-gate">
              <RuinsDoor opened={completed} />
              <span className="scene-label">
                {completed ? 'Gate awakened' : 'Ancient gate'}
              </span>
            </div>
            <div className="scene-switch">
              <RuinsSwitch active={completed} />
            </div>
            <div className="scene-stairs">
              <MagicStairs visible={completed} />
            </div>
          </div>
        )}
      />

      <aside className="guide-dialogue" aria-label="Guide's message">
        <span className="guide-name">Your ruins guide</span>
        <p>
          {completed
            ? 'You found the secret! Last in, first out. The star went on last, so it came off first.'
            : 'Press Play, or use Step forward to explore at your own pace. Which stone will leave first?'}
        </p>
      </aside>

      {completed && (
        <div className="trial-completion" role="status">
          <h3>Secret discovered: Last In, First Out</h3>
          <p>
            You have completed the first room. Stairway Repair is the next room
            planned for development; it is not playable yet.
          </p>
          <button
            type="button"
            onClick={() => {
              setCompleted(false)
              setAttempt((current) => current + 1)
            }}
          >
            Replay the trial
          </button>
        </div>
      )}
    </section>
  )
}
