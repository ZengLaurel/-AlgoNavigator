import { askTutor } from './tutorClient'
import type { TutorLessonContext, TutorMessage, TutorReply } from './types'

/** A UI owner cancels on task, example or role change and unmount. Old promises cannot append messages. */
export class ScopedTutor {
  private controller: AbortController | null = null
  private generation = 0
  cancel() {
    this.generation++
    this.controller?.abort()
    this.controller = null
  }
  async ask(
    question: string,
    context: TutorLessonContext,
    history: TutorMessage[],
  ): Promise<TutorReply | null> {
    this.cancel()
    const generation = this.generation
    const controller = new AbortController()
    this.controller = controller
    const requestId = crypto.randomUUID()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 60000)
    let reply: TutorReply
    try {
      reply = await askTutor(question, context, history, {
        signal: controller.signal,
        requestId,
      })
    } finally {
      clearTimeout(timer)
    }
    if (
      generation !== this.generation ||
      (controller.signal.aborted && !timedOut)
    )
      return null
    this.controller = null
    if (
      !reply.ok &&
      context.moduleId &&
      context.moduleId !== 'stack' &&
      reply.reply.includes('stack exercise')
    )
      return {
        ok: false,
        reply: `The tutor is unavailable. Continue the ${context.moduleId} activity and use its hints.`,
      }
    return reply
  }
}
