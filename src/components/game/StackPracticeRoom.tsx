import { useEffect, useRef, useState } from 'react'
import {
  STACK_LIST_SOURCE,
  stackPractice,
  type PracticeExercise,
} from '../../content/stackPractice'
import {
  currentInput,
  newTeachingRun,
  runFinished,
  teachStep,
  teachingRuleCorrect,
  type TeachingAction,
} from '../../engine/stackTeaching'
import { Sprite } from './Sprite'
import { TeachingChat } from './TeachingChat'
import './StackPracticeRoom.css'

function TeachingActivity({
  exercise,
  onMastered,
}: {
  exercise: PracticeExercise
  onMastered: (id: string) => void
}) {
  const [phase, setPhase] = useState<
    'demo' | 'explain' | 'transfer' | 'learned'
  >('demo')
  const [run, setRun] = useState(newTeachingRun)
  const [hintCount, setHintCount] = useState(0)
  const [rule, setRule] = useState('')
  const [reason, setReason] = useState('')
  const [explanation, setExplanation] = useState('')
  const [comparison, setComparison] = useState('')
  const [feedback, setFeedback] = useState(
    'Xiao Tuo has a mistaken idea. Show a counterexample before teaching the rule.',
  )
  const [chatOpen, setChatOpen] = useState(false)
  const example =
    exercise.examples[phase === 'transfer' || phase === 'learned' ? 1 : 0]
  const finished = runFinished(exercise.kind, example, run)
  const active = phase === 'demo' || phase === 'transfer'
  const comparisonCorrect =
    exercise.kind !== 'backspace' ||
    comparison === String(run.first === run.stack.join(''))
  function act(action: TeachingAction) {
    if (!active || finished) return
    if (action === 'peek') {
      setFeedback(
        run.stack.length
          ? `Peek sees ${run.stack.at(-1)}. Nothing was removed and the input did not advance.`
          : 'An empty stack has no top to peek at. Nothing changed.',
      )
      return
    }
    const result = teachStep(exercise.kind, example, run, action)
    if (!result.correct) {
      setFeedback(
        'Xiao Tuo is still unsure. Look at the current symbol and the top survivor. Which operation follows this task’s rule?',
      )
      return
    }
    setRun(result.run)
    setFeedback(
      'Your demonstration was accepted. Xiao Tuo is watching the top of the stack.',
    )
  }
  function advance() {
    if (!finished || !comparisonCorrect) {
      setFeedback(
        'Compare the two repaired messages before teaching Xiao Tuo. Are the remaining letters the same?',
      )
      return
    }
    if (phase === 'demo') {
      setPhase('explain')
      setFeedback(
        'You showed an example. Now correct Xiao Tuo’s rule and explain why.',
      )
    } else {
      setPhase('learned')
      onMastered(exercise.id)
      setFeedback(
        'Xiao Tuo learned from your teaching and a fresh example. You helped it use the top of the stack!',
      )
    }
  }
  return (
    <article className="teaching-activity" aria-label={exercise.title}>
      <h3>{exercise.title}</h3>
      <p>{exercise.story}</p>
      <a href={exercise.source} target="_blank" rel="noreferrer">
        Source: LeetCode {exercise.number} (adapted)
      </a>
      <p className="scene-label">
        {phase === 'demo'
          ? '1. Demonstrate'
          : phase === 'explain'
            ? '2. Teach the rule'
            : phase === 'transfer'
              ? '3. Try a fresh example'
              : 'Learned through teaching'}
      </p>
      <div className="teaching-sprite">
        <Sprite
          pose={
            phase === 'learned'
              ? 'happy'
              : phase === 'transfer'
                ? 'guide'
                : 'thinking'
          }
        />
        <p>
          {phase === 'learned'
            ? 'Xiao Tuo: Aha! The most recent survivor is on top. I must follow the task rule there, not remove the oldest item.'
            : phase === 'transfer'
              ? 'Xiao Tuo: I will test your top-only rule on a new example. Please check each step with me.'
              : `Xiao Tuo’s mistaken guess: “${exercise.misconception}”`}
        </p>
      </div>
      {phase !== 'explain' && (
        <>
          <p>
            Input{example.other !== undefined ? ' A' : ''}:{' '}
            <code>{example.input}</code>
            {example.other !== undefined && (
              <>
                {' '}
                · Input B: <code>{example.other}</code>
              </>
            )}
            {example.target && (
              <>
                {' '}
                · Target (bottom → top):{' '}
                <code>{example.target.split('').join(' → ')}</code>
              </>
            )}
          </p>
          <p>
            Current message: {run.message === 0 ? 'A' : 'B'} · Read {run.cursor}{' '}
            symbols · Next:{' '}
            <strong>
              {run.discard
                ? 'remove or keep the crate just pushed?'
                : (currentInput(example, run)[run.cursor] ?? 'end')}
            </strong>
          </p>
          {run.first !== null && (
            <p>
              Repaired message A: <code>{run.first || '(empty)'}</code>
            </p>
          )}
          <div
            className="teaching-stack"
            role="img"
            aria-label={`Stack bottom to top: ${run.stack.join(', ') || 'empty'}. Top: ${run.stack.at(-1) ?? 'none'}`}
          >
            <span>Bottom</span>
            {run.stack.map((token, index) => (
              <span className="teaching-token" key={index}>
                {token}
                {index === run.stack.length - 1 ? ' · top' : ''}
              </span>
            ))}
            <span>Top ↑</span>
          </div>
          <div
            className="teaching-actions"
            aria-label="Demonstrate stack actions"
          >
            {(['push', 'pop', 'ignore', 'peek'] as const).map((action) => (
              <button
                type="button"
                key={action}
                disabled={
                  !active || finished || (action === 'pop' && !run.stack.length)
                }
                onClick={() => act(action)}
              >
                {action}
              </button>
            ))}
          </div>
          {finished && exercise.kind === 'backspace' && active && (
            <label>
              Are the repaired messages equal?
              <select
                value={comparison}
                onChange={(event) => setComparison(event.target.value)}
              >
                <option value="">Choose</option>
                <option value="true">Same</option>
                <option value="false">Different</option>
              </select>
            </label>
          )}
          {finished && active && (
            <button type="button" onClick={advance}>
              {phase === 'demo'
                ? 'Explain to Xiao Tuo'
                : 'Check the fresh example'}
            </button>
          )}
        </>
      )}
      {phase === 'explain' && (
        <fieldset>
          <legend>Teach Xiao Tuo, in your own words and with a rule</legend>
          <label>
            Which item leaves first?
            <select
              value={rule}
              onChange={(event) => setRule(event.target.value)}
            >
              <option value="">Choose a rule</option>
              <option value="fifo">
                The oldest item (first in, first out)
              </option>
              <option value="lifo">
                The newest top item (last in, first out)
              </option>
            </select>
          </label>
          <label>
            Why?
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              <option value="">Choose a reason</option>
              <option value="anywhere">We can reach any item in a stack</option>
              <option value="top">
                A stack only adds and removes at its top
              </option>
            </select>
          </label>
          <label htmlFor="teaching-reflection">
            Your explanation (optional)
          </label>
          <textarea
            id="teaching-reflection"
            maxLength={500}
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            placeholder="Imagine a pile of plates…"
          />
          <button
            type="button"
            onClick={() => {
              if (!teachingRuleCorrect(rule, reason)) {
                setFeedback(
                  'Xiao Tuo still believes it can reach the oldest item. Can a stack remove a covered bottom item? Try correcting both the rule and the reason.',
                )
                return
              }
              setRun(newTeachingRun())
              setComparison('')
              setPhase('transfer')
              setFeedback(
                'Xiao Tuo: I see! I can only reach the top. Let us test your explanation on another example.',
              )
            }}
          >
            Let Xiao Tuo try a new example
          </button>
        </fieldset>
      )}
      <p role="status" aria-live="polite">
        {feedback}
      </p>
      <aside className="teaching-hints" aria-label="Progressive hints">
        <button
          type="button"
          disabled={hintCount === exercise.hints.length}
          onClick={() => setHintCount((count) => count + 1)}
        >
          Show hint {Math.min(hintCount + 1, exercise.hints.length)} of{' '}
          {exercise.hints.length}
        </button>
        <ol>
          {exercise.hints.slice(0, hintCount).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      </aside>
      <button
        type="button"
        aria-expanded={chatOpen}
        onClick={() => setChatOpen((open) => !open)}
      >
        Talk to Xiao Tuo / Tutor
      </button>
      {chatOpen && (
        <TeachingChat
          gameState={JSON.stringify({
            exercise: exercise.number,
            title: exercise.title,
            phase,
            misconception: exercise.misconception,
            input: example,
            stack: run.stack,
            cursor: run.cursor,
            correctedRule: phase === 'transfer' || phase === 'learned',
            explanation,
            hintCount,
          })}
        />
      )}
    </article>
  )
}

export function StackPracticeRoom({
  mastered,
  onMastered,
}: {
  mastered: string[]
  onMastered: (id: string) => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  const [selected, setSelected] = useState(stackPractice[0].id)
  const [attempt, setAttempt] = useState(0)
  const exercise = stackPractice.find((item) => item.id === selected)!
  return (
    <section
      className="stack-practice"
      aria-labelledby="stack-practice-heading"
    >
      <p className="game-kicker">Room 04 · Teach to learn</p>
      <h2 id="stack-practice-heading" tabIndex={-1} ref={heading}>
        Teach Xiao Tuo — Stack practice bank
      </h2>
      <p>
        You are the teacher. Xiao Tuo is a learner with a mistaken idea about
        stacks. Demonstrate, correct, explain, and try a new example. Practice
        works even when AI chat is unavailable.
      </p>
      <p>
        {mastered.length} / {stackPractice.length} activities taught ·{' '}
        <a href={STACK_LIST_SOURCE} target="_blank" rel="noreferrer">
          Inspired by the Stack exercise list
        </a>
      </p>
      <nav className="teaching-actions" aria-label="Choose a teaching activity">
        {stackPractice.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={selected === item.id}
            onClick={() => {
              setSelected(item.id)
              setAttempt(0)
            }}
          >
            {item.number} · {item.title}
            {mastered.includes(item.id) ? ' · taught' : ''}
          </button>
        ))}
      </nav>
      <TeachingActivity
        key={`${selected}-${attempt}`}
        exercise={exercise}
        onMastered={onMastered}
      />
      <button type="button" onClick={() => setAttempt((count) => count + 1)}>
        Restart this teaching activity
      </button>
    </section>
  )
}
