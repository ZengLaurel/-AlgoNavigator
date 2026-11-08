import { useState } from 'react'
import { askTutor } from '../../tutor/tutorClient'
import { createMessage, downloadTranscript } from '../../tutor/transcript'
import type { TutorMessage } from '../../tutor/types'
import { Sprite } from './Sprite'

export function TeachingChat({ gameState }: { gameState: string }) {
  const [mode, setMode] = useState<'teach-sprite' | 'practice-coach'>(
    'teach-sprite',
  )
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  async function send(question = draft) {
    if (!question.trim() || pending) return
    setDraft('')
    setPending(true)
    const history = messages
    setMessages((current) => [...current, createMessage('student', question)])
    const result = await askTutor(
      question,
      {
        currentCode: '',
        lastRunResult: null,
        hintsUsedThisExercise: 0,
        gameState,
        teachingMode: mode,
      },
      history,
    )
    setMessages((current) => [
      ...current,
      createMessage('tutor', result.reply, result.ok && result.moderationFlag),
    ])
    setPending(false)
  }
  return (
    <section className="teaching-chat" aria-label="Teaching conversation">
      <div className="teaching-sprite">
        <Sprite pose={pending ? 'thinking' : 'idle'} />
        <h3>Talk with Xiao Tuo or ask the coach</h3>
      </div>
      <p>
        AI chat sends your words and this activity to the AI service. Avoid
        personal information. Chat stays in memory for this activity; exporting
        saves it to your device. Chat cannot mark an exercise learned.
      </p>
      <label htmlFor="teaching-chat-mode">Conversation partner</label>
      <select
        id="teaching-chat-mode"
        value={mode}
        disabled={pending}
        onChange={(event) => {
          setMode(event.target.value as typeof mode)
          setMessages([])
        }}
      >
        <option value="teach-sprite">Xiao Tuo — I am teaching</option>
        <option value="practice-coach">Tutor — give me a hint</option>
      </select>
      <div className="teaching-actions" aria-label="Conversation starters">
        {[
          'Which item would you remove first?',
          'Let me explain why the top matters.',
          'Can you try another example?',
        ].map((text) => (
          <button
            type="button"
            key={text}
            disabled={pending}
            onClick={() => void send(text)}
          >
            {text}
          </button>
        ))}
      </div>
      <ol className="tutor-messages" aria-live="polite">
        {messages.map((message) => (
          <li
            key={message.id}
            className={`tutor-message tutor-${message.role}`}
          >
            <strong>
              {message.role === 'student'
                ? 'You, the teacher'
                : mode === 'teach-sprite'
                  ? 'Xiao Tuo'
                  : 'Tutor'}
            </strong>
            <p>{message.text}</p>
          </li>
        ))}
        {pending && <li>Thinking… You can keep working on the activity.</li>}
      </ol>
      <label htmlFor="teaching-question">Your explanation or question</label>
      <textarea
        id="teaching-question"
        maxLength={500}
        value={draft}
        disabled={pending}
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="teaching-actions">
        <button
          type="button"
          disabled={pending || !draft.trim()}
          onClick={() => void send()}
        >
          Send to {mode === 'teach-sprite' ? 'Xiao Tuo' : 'Tutor'}
        </button>
        <button
          type="button"
          disabled={!messages.length}
          onClick={() => downloadTranscript(messages)}
        >
          Export teaching chat
        </button>
      </div>
    </section>
  )
}
