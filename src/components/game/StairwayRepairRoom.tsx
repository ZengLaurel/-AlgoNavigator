import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ASSETS } from '../../assets'
import { CodeEditorPanel } from '../CodeEditorPanel'
import { TutorChatPanel } from '../TutorChatPanel'
import { PyodideProvider } from '../../engine/pyodide/PyodideProvider'
import type { ExecResult } from '../../engine/pyodide/types'
import { usePyodide } from '../../engine/pyodide/pyodideContext'
import {
  checkStairwayRepair,
  getStairwayFeedback,
} from '../../engine/structures/stairwayCheck'
import {
  buildSteps,
  functionExamples,
  hints,
  instructions,
  starterCode,
  targetPattern,
} from '../../content/stairwayRepairExercise'
import { MagicStairs } from './MagicStairs'
import { RuinsDoor } from './RuinsDoor'
import { RuinsSwitch } from './RuinsSwitch'
import { Sprite } from './Sprite'
import { StoneBlock } from './StoneBlock'
import { StoneStackRenderer } from './StoneStackRenderer'

function TargetPattern() {
  return (
    <svg
      role="img"
      aria-label="Target pattern"
      width={targetPattern.length * 44 + 8}
      height={32}
      viewBox={`0 0 ${targetPattern.length * 44 + 8} 32`}
    >
      {targetPattern.map((glyph, index) => (
        <g key={glyph + index} transform={`translate(${index * 44 + 4}, 0)`}>
          <StoneBlock
            glyph={glyph}
            width={36}
            height={28}
            highlighted={false}
          />
        </g>
      ))}
    </svg>
  )
}

/** Exported separately so tests can wrap it in a fake PyodideContext
 * instead of the real Worker-backed PyodideProvider. */
export function StairwayRepairContent({
  onComplete,
}: {
  onComplete?: () => void
}) {
  const reducedMotion = Boolean(useReducedMotion())
  const [result, setResult] = useState<ExecResult | null>(null)
  const [completed, setCompleted] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [hintCount, setHintCount] = useState(0)
  const [currentCode, setCurrentCode] = useState(starterCode)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorStarted, setTutorStarted] = useState(false)
  const { status } = usePyodide()
  const busy = status === 'loading' || status === 'running'

  const handleResult = useCallback((nextResult: ExecResult) => {
    setResult(nextResult)
    if (
      !nextResult.error &&
      checkStairwayRepair(nextResult.finalState, targetPattern)
    ) {
      setCompleted(true)
    }
  }, [])

  const replay = () => {
    setResult(null)
    setCompleted(false)
    setHintCount(0)
    setCurrentCode(starterCode)
    setAttempt((current) => current + 1)
  }

  const liveState = result?.finalState ?? { elements: [] }
  const spritePose = result?.error ? 'thinking' : completed ? 'happy' : 'idle'

  return (
    <section className="stairway-room" aria-labelledby="stairway-heading">
      <header className="trial-heading">
        <div>
          <p className="game-kicker">Room 02 · Build</p>
          <h2 id="stairway-heading">Stairway Repair</h2>
        </div>
        <span className="trial-status">
          {completed ? 'Trial complete' : 'Match the pattern'}
        </span>
      </header>

      <p className="trial-intro">
        The stairway only answers to one pattern. Edit the code so your stack
        matches the target exactly, bottom to top, then press Run.
      </p>

      <div className="stairway-target">
        <img
          src={ASSETS['quest-scroll'].src!}
          width={48}
          height={48}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <span className="scene-label">Target pattern (bottom to top)</span>
        <TargetPattern />
        <p
          className="stairway-tokens"
          aria-label="Target code names, bottom to top"
        >
          {targetPattern.map((glyph, index) => (
            <span key={glyph}>
              {index > 0 && <span aria-hidden="true"> → </span>}
              <code>{glyph}</code>
            </span>
          ))}
        </p>
      </div>

      <div className="stairway-scene" aria-label="Stairway chamber">
        <div className="scene-guide">
          <motion.div
            animate={completed ? { y: -36 } : { y: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 160, damping: 20 }
            }
          >
            <Sprite pose={spritePose} />
          </motion.div>
        </div>
        <div className="scene-gate">
          {completed && (
            <img
              className="stairway-glow"
              src={ASSETS['fx-magic-glow'].src!}
              alt=""
              aria-hidden="true"
            />
          )}
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
          {completed && !reducedMotion && (
            <motion.img
              className="stairway-dust"
              src={ASSETS['fx-dust'].src!}
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0.6, y: 0 }}
              animate={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </div>
      </div>

      <aside className="stairway-help" aria-labelledby="stack-basics-heading">
        <h3 id="stack-basics-heading">
          <img
            src={ASSETS['magic-code-book'].src!}
            width={48}
            height={48}
            alt=""
            aria-hidden="true"
          />{' '}
          Meet your stone stack
        </h3>
        <p>
          A stack is like a stone tower: you can only add or take away stones at
          the top. The top is the last stone you put on, not the bottom stone.
          To reach a stone below it, first take off the stones above it.
        </p>
        <h4>Build the target, one line at a time</h4>
        <p>
          Python reads your lines from top to bottom. Each line uses the tower
          left by the line before it. Read these steps in order:
        </p>
        <ol>
          {buildSteps.map((step) => (
            <li key={step.code}>
              <code>{step.code}</code>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <p>{instructions}</p>
      </aside>

      <aside
        className="stairway-help"
        aria-labelledby="stack-functions-heading"
      >
        <h3 id="stack-functions-heading">Function guide — separate examples</h3>
        <p>
          These are examples to read, not extra lines for your solution. Each
          example starts with its own tower, using base = 1, moon = 2, star = 3.
          Do not add all of them after your build code: pop would remove the
          star you need!
        </p>
        <ul>
          {functionExamples.map((example) => (
            <li key={example.name}>
              <h4>{example.name}</h4>
              <code>{example.code}</code>
              <p>{example.text}</p>
            </li>
          ))}
        </ul>
        <p>
          An empty tower has no top stone. Calling <code>stack.pop()</code> or{' '}
          <code>stack.peek()</code> on it stops the program with an{' '}
          <code>IndexError</code>. Push a stone first, before trying to take or
          look at one.
        </p>
      </aside>

      <aside className="stairway-help" aria-labelledby="stairway-help-heading">
        <h3 id="stairway-help-heading">Build your solution</h3>
        <p>
          Need a nudge? Open one hint at a time. Your code stays yours to edit.
        </p>
        <button
          type="button"
          aria-controls="stairway-hints"
          disabled={hintCount === hints.length}
          onClick={() =>
            setHintCount((count) => Math.min(count + 1, hints.length))
          }
        >
          {hintCount === hints.length
            ? 'All hints shown'
            : `Show hint ${hintCount + 1} of ${hints.length}`}
        </button>
        <ol id="stairway-hints" aria-live="polite">
          {hints.slice(0, hintCount).map((hint) => (
            <li key={hint.text}>
              <p>{hint.text}</p>
              {hint.code && (
                <pre>
                  <code>{hint.code}</code>
                </pre>
              )}
            </li>
          ))}
        </ol>
      </aside>

      <CodeEditorPanel
        key={attempt}
        starterCode={starterCode}
        onResult={handleResult}
        onCodeChange={setCurrentCode}
      />

      <div className="stairway-live">
        <span className="scene-label">
          {busy
            ? result
              ? 'Your stack — previous run result; waiting for this run'
              : 'Your stack — waiting for the first run result'
            : result?.error
              ? 'Your stack — no valid result from this run'
              : result
                ? 'Your stack — this run result'
                : 'Your stack — not run yet'}
        </span>
        <StoneStackRenderer
          state={liveState}
          slotCount={targetPattern.length}
        />
      </div>

      {!busy && result && !result.error && (
        <p className="stairway-feedback" aria-live="polite">
          {getStairwayFeedback(result.finalState, targetPattern)}
        </p>
      )}

      {!busy && result?.error && (
        <p className="error-message" role="alert">
          {result.error}
        </p>
      )}

      <aside className="stairway-help" aria-label="Stack tutor">
        <button
          type="button"
          aria-expanded={tutorOpen}
          aria-controls="stairway-tutor"
          onClick={() => {
            setTutorStarted(true)
            setTutorOpen((open) => !open)
          }}
        >
          {tutorOpen ? 'Hide the tutor' : 'Ask the stack tutor'}
        </button>
        <div id="stairway-tutor" hidden={!tutorOpen}>
          {tutorStarted && (
            <TutorChatPanel
              key={attempt}
              context={{
                currentCode,
                lastRunResult: result,
                hintsUsedThisExercise: hintCount,
                gameState: JSON.stringify({
                  room: 'Stairway Repair',
                  order: 'bottom to top',
                  target: targetPattern,
                  stack: result?.finalState?.elements ?? null,
                  completed,
                  running: busy,
                  note: busy
                    ? 'Last result is from a previous run.'
                    : undefined,
                }),
              }}
            />
          )}
        </div>
      </aside>

      {completed && (
        <div className="trial-completion" role="status">
          <h3>
            <img
              src={ASSETS['fx-sparkle'].src!}
              width={32}
              height={32}
              alt=""
              aria-hidden="true"
            />{' '}
            Stairway repaired!
          </h3>
          <p>
            Your stack matched the pattern. The path to the final room is open.
          </p>
          {onComplete && (
            <button type="button" onClick={onComplete}>
              Continue to Forked Path →
            </button>
          )}
          <button type="button" onClick={replay}>
            Replay the trial
          </button>
        </div>
      )}
    </section>
  )
}

/** Stairway Repair (SPEC §11.5.2) owns its own PyodideProvider.
 * The editor loads on room entry; the Python Worker/runtime starts on Run. */
export function StairwayRepairRoom({
  onComplete,
}: {
  onComplete?: () => void
}) {
  return (
    <PyodideProvider>
      <StairwayRepairContent onComplete={onComplete} />
    </PyodideProvider>
  )
}
