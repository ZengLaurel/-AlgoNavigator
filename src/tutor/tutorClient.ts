import type { TutorLessonContext, TutorMessage, TutorReply } from './types'

const TUTOR_ENDPOINT = '/api/tutor'
const LESSON_ID = 'stack'
const RECENT_TURNS = 6

/** Shown when the request never reaches a usable answer. The lesson stays
 * fully usable without the tutor, so this is phrased as a pause, not a fault. */
const OFFLINE_REPLY =
  "I can't answer right now. Keep trying the stack exercise and ask me again in a moment."

export async function askTutor(
  studentMessage: string,
  context: TutorLessonContext,
  history: TutorMessage[],
): Promise<TutorReply> {
  let response: Response
  try {
    response = await fetch(TUTOR_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        lessonId: LESSON_ID,
        studentMessage,
        context: {
          currentCode: context.currentCode,
          lastRunResult: context.lastRunResult ?? undefined,
          hintsUsedThisExercise: context.hintsUsedThisExercise,
        },
        recentTurns: history
          .slice(-RECENT_TURNS)
          .map((message) => ({ role: message.role, text: message.text })),
      }),
    })
  } catch {
    return { ok: false, reply: OFFLINE_REPLY }
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return { ok: false, reply: OFFLINE_REPLY }
  }

  // Validate rather than trust: a proxy/CDN error page must not be rendered
  // to a child as if it were tutor text.
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof (payload as { reply?: unknown }).reply !== 'string'
  ) {
    return { ok: false, reply: OFFLINE_REPLY }
  }

  const { reply, moderationFlag } = payload as {
    reply: string
    moderationFlag?: unknown
  }

  if (!response.ok) {
    return { ok: false, reply }
  }

  return { ok: true, reply, moderationFlag: moderationFlag === true }
}
