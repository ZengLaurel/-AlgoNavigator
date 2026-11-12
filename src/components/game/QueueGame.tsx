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
import { QueueView, QueueControls, queueFeedback } from './QueueView'
import { SnapshotPlayback } from '../AnimationStage'
import { PyodideProvider } from '../../engine/pyodide/PyodideProvider'
import { usePyodide } from '../../engine/pyodide/pyodideContext'
import { useModuleProgressStore } from '../../engine/modules/progressContext'
import {
  applyOperation,
  cloneState,
  type QueueState,
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
  queueActivities,
  queueApplyGoal,
  queueApplyInitial,
  queueCodeGoal,
  queueCodeHints,
  queueCodeInitial,
  queueCodeStarter,
  queueObservation,
  queuePredictions,
  type QueueActivity,
} from '../../content/modules/queue'
import './QueueGame.css'

function QueueCoach({
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
  state: QueueState
  events?: OperationEvent[]
  exerciseId?: string
  exampleId?: string
  code?: string
  result?: ModuleRunResult | null
  hints?: number
}) {
  return (
    <details className="queue-coach">
      <summary>Ask the tutor or talk with Xiao Tuo</summary>
      {code.length > 2000 && (
        <p>
          Your program is too long to send as chat context. Ask about a short
          part instead.
        </p>
      )}
      <ModuleTutor
        context={{
          moduleId: 'queue',
          taskId: `queue-${task}`,
          phase,
          exerciseId,
          exampleId,
          stateSummary: JSON.stringify({
            waiting: state.waiting,
            served: state.served,
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
      className="queue-secondary"
      onClick={() => {
        const node = document.getElementById('queue-fifo')
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
export function QueueGame() {
  return (
    <div className="queue-adventure">
      <ModuleStage
        moduleId="queue"
        tutor={null}
        renderRoom={(room, actions) =>
          room === 1 ? (
            <QueueObserve onComplete={actions.advance} />
          ) : room === 2 ? (
            <PyodideProvider>
              <QueuePythonRoom onComplete={actions.advance} />
            </PyodideProvider>
          ) : room === 3 ? (
            <QueueApplication onComplete={actions.complete} />
          ) : (
            <QueuePractice onMastered={actions.master} />
          )
        }
      />
    </div>
  )
}
export function QueueObserve({ onComplete }: { onComplete: () => void }) {
  const [frame, setFrame] = useState(0)
  const [seen, setSeen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const onFrame = useCallback((index: number, last: boolean) => {
    setFrame(index)
    if (last) setSeen(true)
  }, [])
  const prediction =
    queuePredictions[Math.min(frame, queuePredictions.length - 1)]
  const ready =
    seen && queuePredictions.every((p) => answers[p.id] === p.correct)
  return (
    <section aria-label="Queue observation">
      <p className="queue-kicker">Room 01 · Observe and predict</p>
      <h2>Harbor arrivals and departures</h2>
      <p>
        Welcome to Harbor Pier. New boats join the rear. Serve the
        longest-waiting boat at the front, and inspect it with peek without
        letting it leave.
      </p>
      <div className="queue-guide">
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
          queueCodeInitial,
          ...queueObservation.map((s) => s.event.after as QueueState),
        ]}
        captions={[
          'The harbor starts empty.',
          ...queueObservation.map((s) => s.caption),
        ]}
        render={(state) => (
          <QueueView
            state={state}
            event={frame > 0 ? queueObservation[frame - 1].event : undefined}
          />
        )}
        onFrameChange={onFrame}
      />
      <p>
        Predictions checked:{' '}
        {queuePredictions.filter((p) => answers[p.id] === p.correct).length} /
        6. Enqueue at rear, serve at front. Peek does not remove a boat.
      </p>
      <button disabled={!ready} onClick={onComplete}>
        Continue to Harbor Dispatch
      </button>
      <ReviewKnowledge />
      <QueueCoach
        task="observe"
        phase="observe"
        state={
          frame
            ? (queueObservation[frame - 1].event.after as QueueState)
            : queueCodeInitial
        }
      />
    </section>
  )
}

export function QueuePythonRoom({ onComplete }: { onComplete: () => void }) {
  const { status, runModule, cancelModule } = usePyodide()
  const [code, setCode] = useState(queueCodeStarter)
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
        doc: queueCodeStarter,
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
      moduleId: 'queue',
      taskId: 'queue-code',
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
    result?.finalState?.kind === 'queue' ? result.finalState : queueCodeInitial
  const solved = Boolean(
    result &&
    !result.error &&
    result.finalState &&
    queueCodeGoal(result.finalState, result.events),
  )
  return (
    <section aria-label="Queue Python task">
      <p className="queue-kicker">Room 02 · Python</p>
      <h2>Harbor Dispatch</h2>
      <p>
        Start empty. Enqueue A, enqueue B, peek at A, serve A, then enqueue C.
        Target: waiting B, C; departure history A. Use this order and inspect
        each return value.
      </p>
      <details>
        <summary>Python method guide</summary>
        <p>
          The provided <code>queue</code> object starts empty on every Run.{' '}
          <code>queue.enqueue(value)</code> adds at rear,{' '}
          <code>queue.dequeue()</code> serves and returns front,{' '}
          <code>queue.peek()</code> reads front without changing the queue.
        </p>
        <p>
          In ordinary Python, collections.deque uses append and popleft. Some
          references call enqueue/dequeue push/pop. Removing index 0 from a
          Python list takes linear time; it is not a constant-time queue
          implementation. This is a bounded teaching model.
        </p>
      </details>
      <h3>Python program</h3>
      <div
        ref={parent}
        className="code-editor"
        aria-label="Queue Python editor"
      />
      <div className="queue-buttons">
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
                insert: queueCodeStarter,
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
      <QueueView state={state} event={result?.events.at(-1)} />
      {result && !result.error && (
        <details>
          <summary>Replay my program operations</summary>
          <SnapshotPlayback
            key={result.requestId}
            frames={[
              queueCodeInitial,
              ...result.events.map((e) => e.after as QueueState),
            ]}
            captions={[
              'Before this run',
              ...result.events.map(
                (e) => `${e.operation}: ${JSON.stringify(e.args)}`,
              ),
            ]}
            render={(s) => <QueueView state={s} />}
          />
        </details>
      )}
      <HintList
        hints={queueCodeHints}
        count={hints}
        reveal={() => setHints((h) => Math.min(3, h + 1))}
      />
      <ReviewKnowledge />
      <button disabled={!solved || busy} onClick={onComplete}>
        Continue to Harbor Service
      </button>
      <QueueCoach
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

function useQueueActions(initial: QueueState) {
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
      setFeedback(queueFeedback.EVIDENCE_LIMIT)
      return
    }
    const step = applyOperation(state, action, events.length)
    setState(step.after as QueueState)
    setEvents((e) => [...e, step])
    setFeedback(
      step.accepted
        ? `${action.operation} applied. Inspect the waiting boats and departures.`
        : (queueFeedback[step.errorCode!] ??
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
export function QueueApplication({ onComplete }: { onComplete: () => void }) {
  const { state, events, act, reset, feedback, locked, setFeedback } =
    useQueueActions(queueApplyInitial)
  const [hints, setHints] = useState(0)
  const [complete, setComplete] = useState(false)
  const solved = queueApplyGoal(state, events)
  return (
    <section aria-label="Queue application challenge">
      <p className="queue-kicker">Room 03 · Independent challenge</p>
      <h2>Harbor Service</h2>
      <p>
        Red arrived before blue. Peek at red, serve red, let green arrive, then
        serve blue. Target: only green waiting; departure history red, blue.
        Follow the event order; leaving the pier empty does not complete this
        task.
      </p>
      <QueueView state={state} event={events.at(-1)} />
      <QueueControls
        operations={['peek', 'dequeue', 'enqueue']}
        disabled={locked || complete}
        fixedValue="green"
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
          'Find the boat that arrived first.',
          'Peek leaves it waiting; only dequeue serves it.',
          'New green joins behind any boat still waiting. Track departures as well as waiting boats.',
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
              'Check the required event order: peek, service, arrival, service. Keep green waiting and preserve red, blue departure order. Reset to try a fresh event sequence.',
            )
        }}
      >
        Check and complete harbor
      </button>
      {complete && (
        <div role="status">
          <Sprite pose="happy" />
          <h3>Queue data gem earned!</h3>
          <p>
            You served boats fairly in arrival order. Open 4 · Teach Xiao Tuo to
            help our little learner.
          </p>
        </div>
      )}
      <ReviewKnowledge />
      <QueueCoach
        task="apply"
        phase="apply"
        state={state}
        events={events}
        hints={hints}
      />
    </section>
  )
}

export function QueuePractice({
  onMastered,
}: {
  onMastered: (id: string) => void
}) {
  const [selected, setSelected] = useState(0)
  const store = useModuleProgressStore()
  const mastered = store.read().modules['queue'].mastered
  return (
    <section aria-label="Queue teaching bank">
      <p className="queue-kicker">Room 04 · Teach to learn</p>
      <h2>Teach Xiao Tuo — Queue practice bank</h2>
      <p>
        You are the teacher. Test Xiao Tuo's guess, explain the rule and guide a
        fresh example. {mastered.length} / 4 activities taught. These activities
        work without AI chat.
      </p>
      <nav aria-label="Queue activities">
        {queueActivities.map((activity, index) => (
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
      <QueueTeachingActivity
        key={queueActivities[selected].exerciseId}
        activity={queueActivities[selected]}
        onMastered={onMastered}
      />
    </section>
  )
}
export function QueueTeachingActivity({
  activity,
  onMastered,
}: {
  activity: QueueActivity
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
          ? (queueFeedback[step.errorCode!] ??
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
  const state = session.state as QueueState
  return (
    <article>
      <h3>{activity.title}</h3>
      <p className="queue-source">{activity.source}</p>
      <div className="queue-guide">
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
      <QueueView state={state} event={session.events.at(-1)} />
      {session.phase === 'intro' && (
        <button onClick={() => send({ type: 'start' })}>Start teaching</button>
      )}
      {['demonstrate', 'transfer'].includes(session.phase) && (
        <>
          <QueueControls
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
      <QueueCoach
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
