import { useEffect, useState } from 'react'
import { askTutor } from '../tutor/tutorClient'
import {
  createMessage,
  downloadTranscript,
  loadTranscript,
  saveTranscript,
} from '../tutor/transcript'
import type { TutorLessonContext, TutorMessage } from '../tutor/types'

interface TutorChatPanelProps {
  context: TutorLessonContext
}

export function TutorChatPanel({ context }: TutorChatPanelProps) {
  const [messages, setMessages] = useState<TutorMessage[]>(() =>
    loadTranscript(),
  )
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    saveTranscript(messages)
  }, [messages])

  const send = async () => {
    const question = draft.trim()
    if (!question || pending) return

    // Snapshot the history as it stood when the student pressed Ask; the
    // reply is appended to whatever state exists when it returns.
    const history = messages
    setMessages((current) => [...current, createMessage('student', question)])
    setDraft('')
    setPending(true)

    // Hints used = tutor answers already given for this exercise, so the
    // server can withhold full answers until the student has had two hints.
    const hintsUsed = history.filter(
      (message) => message.role === 'tutor',
    ).length

    const result = await askTutor(
      question,
      { ...context, hintsUsedThisExercise: hintsUsed },
      history,
    )

    setMessages((current) => [
      ...current,
      createMessage(
        'tutor',
        result.reply,
        result.ok ? result.moderationFlag : false,
      ),
    ])
    setPending(false)
  }

  return (
    <section className="lesson-card tutor-card" aria-labelledby="tutor-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Step 4 · Ask</p>
          <h2 id="tutor-heading">Ask the tutor</h2>
        </div>
        <span className="section-badge">Helper</span>
      </div>
      <p className="helper-text">
        Ask anything about stacks. The tutor gives hints so you can work it out
        yourself.
      </p>

      <ol className="tutor-messages" aria-live="polite">
        {messages.length === 0 && (
          <li className="tutor-empty">
            No questions yet. Try asking what <code>push</code> does.
          </li>
        )}
        {messages.map((message) => (
          <li
            key={message.id}
            className={`tutor-message tutor-${message.role}`}
          >
            <span className="tutor-role">
              {message.role === 'student' ? 'You' : 'Tutor'}
            </span>
            <p>{message.text}</p>
          </li>
        ))}
        {pending && (
          <li className="tutor-message tutor-tutor tutor-pending">
            <span className="tutor-role">Tutor</span>
            <p>Thinking…</p>
          </li>
        )}
      </ol>

      <div className="tutor-controls">
        <label className="tutor-input-label" htmlFor="tutor-input">
          Your question
        </label>
        <input
          id="tutor-input"
          type="text"
          value={draft}
          placeholder="What does pop do?"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void send()
          }}
          disabled={pending}
        />
        <div className="tutor-buttons">
          <button type="button" onClick={() => void send()} disabled={pending}>
            Ask
          </button>
          <button
            type="button"
            className="tutor-secondary"
            onClick={() => downloadTranscript(messages)}
            disabled={messages.length === 0}
          >
            Export session log
          </button>
        </div>
      </div>
    </section>
  )
}
