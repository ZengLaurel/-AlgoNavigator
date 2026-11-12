import { useCallback, useEffect, useRef, useState } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { useReducedMotion } from 'framer-motion'
import { ModuleStage } from './ModuleStage'
import { ModuleTutor } from './ModuleTutor'
import { Sprite } from './Sprite'
import { ArrayView, ArrayControls, arrayFeedback } from './ArrayView'
import { SnapshotPlayback } from '../AnimationStage'
import { PyodideProvider } from '../../engine/pyodide/PyodideProvider'
import { usePyodide } from '../../engine/pyodide/pyodideContext'
import { useModuleProgressStore } from '../../engine/modules/progressContext'
import {
  applyOperation,
  cloneState,
  type ArrayState,
  type ModuleAction,
  type OperationEvent,
} from '../../engine/modules/structures'
import {
  newTeachingSession,
  reduceTeaching,
  type TeachingEvent,
} from '../../engine/modules/teaching'
import type { ModuleRunResult } from '../../engine/pyodide/moduleExecution'
import {
  arrayActivities,
  arrayApplyGoal,
  arrayApplyInitial,
  arrayCodeGoal,
  arrayCodeHints,
  arrayCodeInitial,
  arrayCodeStarter,
  arrayObservation,
  arrayPredictions,
  type ArrayActivity,
} from '../../content/modules/array'
import './ArrayGame.css'

function ArrayCoach({
  task,
  phase,
  state,
  events = [],
  exerciseId,
  exampleId = 'main',
  code = '',
  result,
  hints = 0,
}: {
  task: string
  phase: string
  state: ArrayState
  events?: OperationEvent[]
  exerciseId?: string
  exampleId?: string
  code?: string
  result?: ModuleRunResult | null
  hints?: number
}) {
  return (
    <details className="array-coach">
      <summary>Ask the tutor or talk with Xiao Tuo</summary>
      {code.length > 2000 && (
        <p>
          Your program is too long to send as chat context. Ask about a short
          part instead.
        </p>
      )}
      <ModuleTutor
        context={{
          moduleId: 'array',
          taskId: `array-${task}`,
          phase,
          exerciseId,
          exampleId,
          stateSummary: JSON.stringify({
            values: state.items.map((i) => i.value),
            length: state.items.length,
            capacity: state.capacity,
          }),
          lastActions: events
            .slice(-8)
            .map(
              (e) =>
                `${e.operation} ${JSON.stringify(e.args)} ${e.accepted ? 'accepted' : e.errorCode}`,
            ),
          currentCode: code.length <= 2000 ? code : '',
          lastRunResult: result
            ? { stdout: result.stdout, error: result.error?.message ?? null }
            : null,
          hintsUsedThisExercise: hints,
        }}
      />
    </details>
  )
}
function HintList({
  hints,
  count,
  reveal,
}: {
  hints: string[]
  count: number
  reveal: () => void
}) {
  return (
    <section aria-label="Progressive hints">
      <button disabled={count >= 3} onClick={reveal}>
        {count >= 3 ? 'All three hints shown' : `Show hint ${count + 1} of 3`}
      </button>
      <ol>
        {hints.slice(0, count).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ol>
    </section>
  )
}
function ReviewKnowledge() {
  return (
    <button
      className="array-secondary"
      onClick={() => {
        const node = document.getElementById('array-shift')
        const book = node?.closest('details')
        if (book) book.open = true
        if (node) {
          node.tabIndex = -1
          node.focus()
        }
      }}
    >
      Review the knowledge handbook
    </button>
  )
}
export function ArrayGame() {
  return (
    <div className="array-adventure">
      <ModuleStage
        moduleId="array"
        tutor={null}
        renderRoom={(room, actions) =>
          room === 1 ? (
            <ArrayObserve onComplete={actions.advance} />
          ) : room === 2 ? (
            <PyodideProvider>
              <ArrayPythonRoom onComplete={actions.advance} />
            </PyodideProvider>
          ) : room === 3 ? (
            <ArrayApplication onComplete={actions.complete} />
          ) : (
            <ArrayPractice onMastered={actions.master} />
          )
        }
      />
    </div>
  )
}
export function ArrayObserve({ onComplete }: { onComplete: () => void }) {
  const [frame, setFrame] = useState(0)
  const [seen, setSeen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const onFrame = useCallback((index: number, last: boolean) => {
    setFrame(index)
    if (last) setSeen(true)
  }, [])
  const prediction =
    arrayPredictions[Math.min(frame, arrayPredictions.length - 1)]
  const ready =
    seen && arrayPredictions.every((p) => answers[p.id] === p.correct)
  return (
    <section aria-label="Array observation">
      <p className="array-kicker">Room 01 · Observe and predict</p>
      <h2>Camp storage slots</h2>
      <p>
        Imagine labelled supply boxes in a row. An index finds a position. Watch
        how later supplies move when a new item needs room.
      </p>
      <div className="array-guide">
        <Sprite pose="guide" />
        <p>
          Predict first, then step forward to test your idea. You can always
          return to an earlier frame.
        </p>
      </div>
      <fieldset>
        <legend>{prediction.question}</legend>
        {prediction.options.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={prediction.id}
              checked={answers[prediction.id] === option}
              onChange={() =>
                setAnswers((a) => ({ ...a, [prediction.id]: option }))
              }
            />
            {option}
          </label>
        ))}
      </fieldset>
      {answers[prediction.id] && (
        <p role="status">
          {answers[prediction.id] === prediction.correct
            ? 'Good prediction. Check it in the animation.'
            : 'Try that idea against the next frame. You can revise your prediction.'}
        </p>
      )}
      <SnapshotPlayback
        frames={[
          arrayCodeInitial,
          ...arrayObservation.map((s) => s.event.after as ArrayState),
        ]}
        captions={[
          'Starting with A, B, C and one spare position.',
          ...arrayObservation.map((s) => s.caption),
        ]}
        render={(state) => (
          <ArrayView
            state={state}
            event={frame > 0 ? arrayObservation[frame - 1].event : undefined}
          />
        )}
        onFrameChange={onFrame}
      />
      <p>
        Predictions checked:{' '}
        {arrayPredictions.filter((p) => answers[p.id] === p.correct).length} /
        6. First index = 0. Insertion shifts right; removal shifts left.
        Capacity may exceed length.
      </p>
      <button disabled={!ready} onClick={onComplete}>
        Continue to Supply Sorting
      </button>
      <ReviewKnowledge />
      <ArrayCoach
        task="observe"
        phase="observe"
        state={
          frame
            ? (arrayObservation[frame - 1].event.after as ArrayState)
            : arrayCodeInitial
        }
      />
    </section>
  )
}

export function ArrayPythonRoom({ onComplete }: { onComplete: () => void }) {
  const { status, runModule, cancelModule } = usePyodide()
  const [code, setCode] = useState(arrayCodeStarter)
  const [result, setResult] = useState<ModuleRunResult | null>(null)
  const [hints, setHints] = useState(0)
  const [sessionId] = useState(() => crypto.randomUUID())
  const parent = useRef<HTMLDivElement>(null)
  const editor = useRef<EditorView | null>(null)
  const alive = useRef(true)
  const revision = useRef(0)
  const busy = status === 'loading' || status === 'running'
  useEffect(() => {
    alive.current = true
    const view = new EditorView({
      parent: parent.current!,
      state: EditorState.create({
        doc: arrayCodeStarter,
        extensions: [
          basicSetup,
          python(),
          keymap.of([...defaultKeymap, indentWithTab]),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) {
              revision.current++
              setCode(u.state.doc.toString())
              setResult(null)
            }
          }),
        ],
      }),
    })
    editor.current = view
    return () => {
      alive.current = false
      cancelModule?.()
      view.destroy()
      editor.current = null
    }
  }, [cancelModule])
  async function run() {
    if (!runModule || busy) return
    setResult(null)
    const submittedRevision = revision.current
    const next = await runModule({
      moduleId: 'array',
      taskId: 'array-code',
      exampleId: 'main',
      sessionId,
      code,
    })
    if (
      alive.current &&
      submittedRevision === revision.current &&
      next.error?.code !== 'CANCELLED'
    )
      setResult(next)
  }
  const state =
    result?.finalState?.kind === 'array' ? result.finalState : arrayCodeInitial
  const solved = Boolean(
    result &&
    !result.error &&
    result.finalState &&
    arrayCodeGoal(result.finalState, result.events),
  )
  return (
    <section aria-label="Array Python task">
      <p className="array-kicker">Room 02 · Python</p>
      <h2>Supply Sorting</h2>
      <p>
        Start with A, B, C (capacity 4). Insert X at index 1, replace the
        original C with D, then remove B. Target: <strong>A, X, D</strong>.
      </p>
      <details>
        <summary>Python method guide</summary>
        <p>
          The <code>array</code> object is already provided. Do not replace it.
          Each Run starts from the original storage.
        </p>
        <p>
          <code>array.get(index)</code> reads a value.{' '}
          <code>array.set(index, value)</code> replaces it.{' '}
          <code>array.insert(index, value)</code> creates space.{' '}
          <code>array.remove(index)</code> removes and returns a value.{' '}
          <code>array.traverse()</code> returns all used values.{' '}
          <code>array.grow(capacity)</code> increases storage.
        </p>
        <p>
          For a separate example: <code>array.get(0)</code> reads the first
          value. Remember that insertion changes later indexes.
        </p>
      </details>
      <h3>Python program</h3>
      <div
        ref={parent}
        className="code-editor"
        aria-label="Array Python editor"
      />
      <div className="array-buttons">
        <button disabled={busy || !runModule} onClick={() => void run()}>
          Run
        </button>
        <button
          disabled={busy}
          onClick={() => {
            editor.current?.dispatch({
              changes: {
                from: 0,
                to: editor.current.state.doc.length,
                insert: arrayCodeStarter,
              },
            })
            setResult(null)
          }}
        >
          Reset code
        </button>
      </div>
      <p role="status">
        {busy
          ? status === 'loading'
            ? 'Loading Python…'
            : 'Running Python…'
          : result?.error
            ? result.error.message
            : solved
              ? 'Target matched with a verified operation history.'
              : result
                ? 'Your program ran. Compare its items and operations with the target.'
                : 'Ready when you are. Your code runs on this device.'}
      </p>
      {result?.stdout && <pre aria-label="Program output">{result.stdout}</pre>}
      <ArrayView state={state} event={result?.events.at(-1)} />
      {result && !result.error && (
        <details>
          <summary>Replay my program operations</summary>
          <SnapshotPlayback
            key={result.requestId}
            frames={[
              arrayCodeInitial,
              ...result.events.map((e) => e.after as ArrayState),
            ]}
            captions={[
              'Before this run',
              ...result.events.map(
                (e) => `${e.operation}: ${JSON.stringify(e.args)}`,
              ),
            ]}
            render={(s) => <ArrayView state={s} />}
          />
        </details>
      )}
      <HintList
        hints={arrayCodeHints}
        count={hints}
        reveal={() => setHints((h) => Math.min(3, h + 1))}
      />
      <ReviewKnowledge />
      <button disabled={!solved || busy} onClick={onComplete}>
        Continue to Camp Packing
      </button>
      <ArrayCoach
        task="code"
        phase="code"
        state={state}
        events={result?.events}
        code={code}
        result={result}
        hints={hints}
      />
    </section>
  )
}

function useArrayActions(initial: ArrayState) {
  const [state, setState] = useState(() => cloneState(initial))
  const [events, setEvents] = useState<OperationEvent[]>([])
  const [feedback, setFeedback] = useState('')
  const [locked, setLocked] = useState(false)
  const reduced = useReducedMotion()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  function act(action: ModuleAction) {
    if (locked) return
    if (events.length >= 128) {
      setFeedback(arrayFeedback.EVIDENCE_LIMIT)
      return
    }
    const step = applyOperation(state, action, events.length)
    setState(step.after as ArrayState)
    setEvents((e) => [...e, step])
    setFeedback(
      step.accepted
        ? `${action.operation} applied. Inspect the updated storage.`
        : (arrayFeedback[step.errorCode!] ??
            'Check the operation and try again.'),
    )
    if (step.accepted && !reduced) {
      setLocked(true)
      timer.current = setTimeout(() => setLocked(false), 280)
    }
  }
  function reset() {
    clearTimeout(timer.current)
    setLocked(false)
    setState(cloneState(initial))
    setEvents([])
    setFeedback('Attempt reset. Your saved progress is kept.')
  }
  return { state, events, act, reset, feedback, locked, setFeedback }
}
export function ArrayApplication({ onComplete }: { onComplete: () => void }) {
  const { state, events, act, reset, feedback, locked, setFeedback } =
    useArrayActions(arrayApplyInitial)
  const [hints, setHints] = useState(0)
  const [complete, setComplete] = useState(false)
  const solved = arrayApplyGoal(state, events)
  return (
    <section aria-label="Array application challenge">
      <p className="array-kicker">Room 03 · Independent challenge</p>
      <h2>Camp Packing</h2>
      <p>
        Our storage contains rope, food and lamp, with no spare space. Grow
        capacity to 5. Place map at index 1, remove food, then inspect every
        used position with traverse. Target order:{' '}
        <strong>rope, map, lamp</strong>.
      </p>
      <ArrayView state={state} event={events.at(-1)} />
      <ArrayControls
        operations={['insert', 'remove', 'grow', 'traverse']}
        disabled={locked || complete}
        onAction={act}
      />
      <p role="status">{feedback}</p>
      <button
        disabled={locked}
        onClick={() => {
          reset()
          setComplete(false)
        }}
      >
        Reset challenge
      </button>
      <HintList
        hints={[
          'Check whether the storage is full.',
          'Keep the supplies that are not being removed in their original order.',
          'When you think you are done, traverse the used positions to check your result.',
        ]}
        count={hints}
        reveal={() => setHints((h) => Math.min(3, h + 1))}
      />
      <button
        disabled={locked || complete}
        onClick={() => {
          if (solved) {
            setComplete(true)
            onComplete()
          } else
            setFeedback(
              'Keep checking the capacity, target order and required operations. Finish with a traversal of the correct storage.',
            )
        }}
      >
        Check and complete camp
      </button>
      {complete && (
        <div role="status">
          <Sprite pose="happy" />
          <h3>Array data gem earned!</h3>
          <p>
            You kept the order and made room. Open 4 · Teach Xiao Tuo to help
            our little learner.
          </p>
        </div>
      )}
      <ReviewKnowledge />
      <ArrayCoach
        task="apply"
        phase="apply"
        state={state}
        events={events}
        hints={hints}
      />
    </section>
  )
}

export function ArrayPractice({
  onMastered,
}: {
  onMastered: (id: string) => void
}) {
  const [selected, setSelected] = useState(0)
  const store = useModuleProgressStore()
  const mastered = store.read().modules.array.mastered
  return (
    <section aria-label="Array teaching bank">
      <p className="array-kicker">Room 04 · Teach to learn</p>
      <h2>Teach Xiao Tuo — Array practice bank</h2>
      <p>
        You are the teacher. Test Xiao Tuo's guess, explain the rule and guide a
        fresh example. {mastered.length} / 4 activities taught. These activities
        work without AI chat.
      </p>
      <nav aria-label="Array activities">
        {arrayActivities.map((activity, index) => (
          <button
            key={activity.exerciseId}
            aria-current={selected === index ? 'step' : undefined}
            onClick={() => setSelected(index)}
          >
            {activity.title}
            {mastered.includes(activity.exerciseId) ? ' · taught' : ''}
          </button>
        ))}
      </nav>
      <ArrayTeachingActivity
        key={arrayActivities[selected].exerciseId}
        activity={arrayActivities[selected]}
        onMastered={onMastered}
      />
    </section>
  )
}
export function ArrayTeachingActivity({
  activity,
  onMastered,
}: {
  activity: ArrayActivity
  onMastered: (id: string) => void
}) {
  const [session, setSession] = useState(() => newTeachingSession(activity))
  const [rule, setRule] = useState('')
  const [reason, setReason] = useState('')
  const [reflection, setReflection] = useState('')
  const [feedback, setFeedback] = useState('')
  const [locked, setLocked] = useState(false)
  const reduced = useReducedMotion()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  function send(event: TeachingEvent) {
    if (locked && event.type !== 'hint') return
    const next = reduceTeaching(activity, session, event)
    if (event.type === 'operate') {
      const step = next.events.at(-1)
      setFeedback(
        step && !step.accepted
          ? (arrayFeedback[step.errorCode!] ??
              'Check that operation and try again.')
          : 'Inspect what changed, then explain it to Xiao Tuo.',
      )
      if (step?.accepted && !reduced) {
        setLocked(true)
        timer.current = setTimeout(() => setLocked(false), 280)
      }
    } else if (event.type === 'submit-demo' || event.type === 'submit-transfer')
      setFeedback(
        next.phase === session.phase
          ? 'The demonstration is not complete yet. Compare the requested result and your observations.'
          : 'Your operation evidence passed. Continue with the teaching step.',
      )
    else if (event.type === 'rule')
      setFeedback(
        next.phase === 'correct-rule'
          ? 'Those choices do not yet explain this task. Review the principle and try again.'
          : 'Xiao Tuo understands your correction. Now test it with new data.',
      )
    else setFeedback('')
    if (next.phase === 'learned' && session.phase !== 'learned')
      onMastered(activity.exerciseId)
    setSession(next)
  }
  const transferring = ['transfer', 'learned'].includes(session.phase)
  const state = session.state as ArrayState
  return (
    <article>
      <h3>{activity.title}</h3>
      <p className="array-source">{activity.source}</p>
      <div className="array-guide">
        <Sprite
          pose={
            session.phase === 'learned'
              ? 'happy'
              : session.phase === 'transfer'
                ? 'thinking'
                : 'guide'
          }
        />
        <p>
          {session.phase === 'intro' || session.phase === 'demonstrate'
            ? `Xiao Tuo's mistaken guess: “${activity.misconception}”`
            : session.phase === 'learned'
              ? `Aha! ${activity.ruleLabel}. ${activity.reasonLabel}. Your new example helped me check it!`
              : session.phase === 'transfer-ready'
                ? `Xiao Tuo: ${activity.ruleLabel}. ${activity.reasonLabel}. I understand this correction; a fresh example is still needed to verify it.`
                : 'Xiao Tuo: I am listening to your explanation.'}
        </p>
      </div>
      <p>
        <strong>{transferring ? 'Fresh example: ' : 'Demonstration: '}</strong>
        {transferring ? activity.transferPrompt : activity.demoPrompt}
      </p>
      <ArrayView state={state} event={session.events.at(-1)} />
      {session.phase === 'intro' && (
        <button onClick={() => send({ type: 'start' })}>Start teaching</button>
      )}
      {['demonstrate', 'transfer'].includes(session.phase) && (
        <>
          <ArrayControls
            key={transferring ? 'transfer' : 'demo'}
            operations={activity.allowedOperations}
            fixedValue={transferring ? activity.transferValue : activity.value}
            disabled={locked}
            onAction={(action) => send({ type: 'operate', action })}
          />
          <button
            disabled={locked}
            onClick={() =>
              send({ type: transferring ? 'submit-transfer' : 'submit-demo' })
            }
          >
            {transferring ? 'Check fresh example' : 'Check demonstration'}
          </button>
        </>
      )}
      {session.phase === 'correct-rule' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send({ type: 'rule', ruleId: rule, reasonId: reason })
          }}
        >
          <label>
            Rule to teach
            <select
              required
              value={rule}
              onChange={(e) => setRule(e.target.value)}
            >
              <option value="">Choose a rule</option>
              <option value="wrong">Positions and order do not matter</option>
              <option value={activity.ruleId}>{activity.ruleLabel}</option>
            </select>
          </label>
          <label>
            Why this rule works
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Choose a reason</option>
              <option value={activity.reasonId}>{activity.reasonLabel}</option>
              <option value="wrong">
                The picture alone decides the result
              </option>
            </select>
          </label>
          <label>
            Your explanation (optional, not automatically graded)
            <textarea
              maxLength={500}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </label>
          <button>Teach the rule</button>
        </form>
      )}
      {session.phase === 'transfer-ready' && (
        <button onClick={() => send({ type: 'start-transfer' })}>
          Try a fresh example
        </button>
      )}
      {session.phase === 'learned' && (
        <p role="status">
          <strong>Xiao Tuo learned this activity through your teaching!</strong>
        </p>
      )}
      <p role="status">{feedback}</p>
      <HintList
        hints={activity.hints}
        count={session.hintLevel}
        reveal={() => send({ type: 'hint' })}
      />
      <button
        disabled={locked}
        onClick={() => {
          send({ type: 'reset' })
          setRule('')
          setReason('')
          setReflection('')
        }}
      >
        Reset current attempt
      </button>
      <button
        disabled={locked}
        onClick={() => {
          send({ type: 'replay' })
          setRule('')
          setReason('')
          setReflection('')
        }}
      >
        Replay from demonstration
      </button>
      <ReviewKnowledge />
      <ArrayCoach
        task="teach"
        exerciseId={activity.exerciseId}
        exampleId={transferring ? 'transfer' : 'demo'}
        phase={session.phase}
        state={state}
        events={session.events}
        hints={session.hintLevel}
      />
    </article>
  )
}
