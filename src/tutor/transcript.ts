import type { TutorMessage, TutorRole } from './types'

const STORAGE_KEY = 'algonavigator.transcript.stack.v1'

/** Caps stored history so a long session cannot fill localStorage. Older
 * turns drop off; the visible conversation stays recent. */
export const MAX_STORED_MESSAGES = 50

function isMessage(value: unknown): value is TutorMessage {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    (candidate.role === 'student' || candidate.role === 'tutor') &&
    typeof candidate.text === 'string' &&
    typeof candidate.at === 'string'
  )
}

/** Reads the stored transcript, tolerating cleared, corrupt, or
 * foreign-shaped storage (a thrown error here would break the lesson page). */
export function loadTranscript(): TutorMessage[] {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isMessage).slice(-MAX_STORED_MESSAGES)
  } catch {
    return []
  }
}

export function saveTranscript(messages: TutorMessage[]): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)),
    )
  } catch {
    // Private-browsing or quota failures must not interrupt the lesson.
  }
}

export function clearTranscript(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignored for the same reason as saveTranscript.
  }
}

let messageCounter = 0

export function createMessage(
  role: TutorRole,
  text: string,
  moderated = false,
): TutorMessage {
  messageCounter += 1
  return {
    id: `${role}-${Date.now()}-${messageCounter}`,
    role,
    text,
    at: new Date().toISOString(),
    ...(moderated ? { moderated: true } : {}),
  }
}

export interface ExportedTranscript {
  lesson: string
  exportedAt: string
  messages: { role: TutorRole; text: string; at: string; moderated?: boolean }[]
}

/** Builds the parent/teacher review payload.
 *
 * Copies fields explicitly rather than serialising the stored objects, so a
 * future internal field cannot silently end up in an exported file. */
export function buildExport(messages: TutorMessage[]): ExportedTranscript {
  return {
    lesson: 'stack',
    exportedAt: new Date().toISOString(),
    messages: messages.map((message) => ({
      role: message.role,
      text: message.text,
      at: message.at,
      ...(message.moderated ? { moderated: true } : {}),
    })),
  }
}

export function downloadTranscript(messages: TutorMessage[]): void {
  const blob = new Blob([JSON.stringify(buildExport(messages), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'algonavigator-stack-session.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
