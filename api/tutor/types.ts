/** Shared request/response boundary for the tutor proxy.
 *
 * Deliberately free of SDK types so the handler stays testable without a
 * provider client, and so the browser can reuse the response shape without
 * pulling the Anthropic SDK into the bundle.
 */

export const SUPPORTED_LESSON_ID = 'stack'

/** Caps applied before any paid provider call. Oversized input is rejected,
 * not truncated, so a student never gets an answer about silently cut code. */
export const TUTOR_LIMITS = {
  studentMessageChars: 500,
  codeContextChars: 2000,
  runOutputChars: 500,
  recentTurns: 6,
  recentTurnChars: 600,
} as const

export interface TutorRunResult {
  stdout?: string
  error?: string | null
}

export interface TutorRequestContext {
  teachingMode?: 'teach-sprite' | 'practice-coach'
  gameState?: string
  currentCode?: string
  lastRunResult?: TutorRunResult
  animationStepIndex?: number
  hintsUsedThisExercise?: number
}

export type TutorTurnRole = 'student' | 'tutor'

export interface TutorTurn {
  role: TutorTurnRole
  text: string
}

export interface TutorRequestBody {
  lessonId: string
  studentMessage: string
  context?: TutorRequestContext
  recentTurns?: TutorTurn[]
}

export interface TutorResponseBody {
  reply: string
  moderationFlag: boolean
}

/** Shown whenever the safety boundary rejects input or output. Fixed text so
 * a child never sees which rule fired. */
export const SAFE_REDIRECT_REPLY =
  "Let's get back to our stack lesson! What part would you like help with?"

/** Shown on transport/provider failure. Must not leak provider details. */
export const SERVICE_UNAVAILABLE_REPLY =
  "I can't answer right now. Keep trying the stack exercise and ask me again in a moment."

/** Shown when the request itself is malformed. */
export const INVALID_REQUEST_REPLY =
  "I didn't catch that. Try asking your question about the stack again."
