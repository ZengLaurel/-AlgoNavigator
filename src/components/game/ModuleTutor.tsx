import { useEffect, useState } from 'react'
import { ScopedTutor } from '../../tutor/scopedTutor'
import { createMessage, downloadTranscript } from '../../tutor/transcript'
import type { TutorLessonContext, TutorMessage } from '../../tutor/types'

export function ModuleTutor({ context }: { context: TutorLessonContext }) {
  return (
    <Conversation
      key={`${context.moduleId}/${context.taskId}/${context.exerciseId}/${context.exampleId}`}
      context={context}
    />
  )
}
function Conversation({ context }: { context: TutorLessonContext }) {
  const [client] = useState(() => new ScopedTutor())
  const [mode, setMode] = useState<'teach-sprite' | 'practice-coach'>(
    'practice-coach',
  )
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  useEffect(() => () => client.cancel(), [client])
  async function send(question = draft) {
    if (!question.trim() || pending) return
    setPending(true)
    setDraft('')
    const history = messages
    setMessages((current) => [...current, createMessage('student', question)])
    const result = await client.ask(
      question,
      { ...context, teachingMode: mode },
      history,
    )
    if (!result) return
    setMessages((current) => [
      ...current,
      createMessage('tutor', result.reply, result.ok && result.moderationFlag),
    ])
    setPending(false)
  }
  return (
    <section aria-label="Module conversation">
      <h2>Talk with Xiao Tuo or ask the tutor</h2>
      <p>
        Only pressing Send shares this question and current lesson context with
        the AI service. Avoid personal information. Chat stays in memory for
        this activity. Exporting saves it to your device. Chat cannot award
        progress.
      </p>
      <label>
        Conversation partner
        <select
          value={mode}
          onChange={(e) => {
            client.cancel()
            setMode(e.target.value as typeof mode)
            setMessages([])
            setDraft('')
            setPending(false)
          }}
        >
          <option value="practice-coach">Tutor</option>
          <option value="teach-sprite">Xiao Tuo — I am teaching</option>
        </select>
      </label>
      <div>
        {(context.moduleId === 'array'
          ? [
              'Which index should we inspect?',
              'Let me explain why later items move.',
              'Can we try a new storage example?',
            ]
          : context.moduleId === 'linked-list'
            ? [
                'Which next reference should we inspect?',
                'Let me explain how to preserve the remaining path.',
                'Can we try a new beacon example?',
              ]
            : context.moduleId === 'queue'
              ? [
                  'Who is waiting at the front?',
                  'Let me explain why peek does not remove a boat.',
                  'Can we test a new arrival between services?',
                ]
              : [
                  'Which object should we inspect?',
                  'Let me explain this rule.',
                  'Can we try a new example?',
                ]
        ).map((q) => (
          <button key={q} disabled={pending} onClick={() => void send(q)}>
            {q}
          </button>
        ))}
      </div>
      <ol aria-live="polite">
        {messages.map((m) => (
          <li key={m.id}>
            <strong>
              {m.role === 'student'
                ? 'You'
                : mode === 'teach-sprite'
                  ? 'Xiao Tuo'
                  : 'Tutor'}
            </strong>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
      <label>
        Your question
        <textarea
          value={draft}
          maxLength={500}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <button disabled={pending || !draft.trim()} onClick={() => void send()}>
        {pending ? 'Thinking…' : 'Send'}
      </button>
      <button
        disabled={!messages.length}
        onClick={() => downloadTranscript(messages)}
      >
        Export teaching chat
      </button>
    </section>
  )
}
