/** Browser-side tutor types.
 *
 * Intentionally duplicates the small response shape from `api/tutor/types.ts`
 * rather than importing it: nothing under `src/` may import `api/`, or the
 * Anthropic SDK and the server key handling would be pulled into the client
 * bundle.
 */

export type TutorRole = 'student' | 'tutor'

export interface TutorMessage {
  id: string
  role: TutorRole
  text: string
  /** ISO timestamp, used only for the exported session log. */
  at: string
  /** True when the reply was replaced by the safe redirect. */
  moderated?: boolean
}

export interface TutorLessonContext {
  moduleId?: 'stack' | 'array' | 'linked-list' | 'queue'
  taskId?: string
  exerciseId?: string
  exampleId?: string
  phase?: string
  stateSummary?: string
  lastActions?: string[]
  teachingMode?: 'teach-sprite' | 'practice-coach'
  gameState?: string
  currentCode: string
  lastRunResult: { stdout: string; error: string | null } | null
  hintsUsedThisExercise: number
}

export type TutorReply =
  | { ok: true; reply: string; moderationFlag: boolean }
  | { ok: false; reply: string }
