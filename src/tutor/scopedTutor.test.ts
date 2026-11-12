import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScopedTutor } from './scopedTutor'
import type { TutorLessonContext } from './types'

const context: TutorLessonContext = {
  moduleId: 'queue',
  taskId: 'queue-code',
  exampleId: 'main',
  phase: 'code',
  currentCode: '',
  lastRunResult: null,
  hintsUsedThisExercise: 0,
}
describe('scoped tutor requests', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('cancels the previous role/task request and ignores its late response', async () => {
    const replies: Array<() => void> = []
    const signals: AbortSignal[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, options: RequestInit) =>
          new Promise<Response>((resolve) => {
            const body = JSON.parse(String(options.body))
            signals.push(options.signal as AbortSignal)
            replies.push(() =>
              resolve(
                new Response(
                  JSON.stringify({
                    reply: 'Which end is front?',
                    requestId: body.requestId,
                    moderationFlag: false,
                  }),
                  { status: 200 },
                ),
              ),
            )
          }),
      ),
    )
    const client = new ScopedTutor()
    const old = client.ask('first', context, [])
    const current = client.ask(
      'second',
      { ...context, teachingMode: 'teach-sprite' },
      [],
    )
    expect(signals[0].aborted).toBe(true)
    replies[1]()
    expect((await current)?.reply).toBe('Which end is front?')
    replies[0]()
    expect(await old).toBe(null)
  })
  it('rejects a mismatched response identity and uses a module-specific offline fallback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ reply: 'old lesson', requestId: 'stale' }),
            { status: 200 },
          ),
      ),
    )
    const client = new ScopedTutor()
    expect((await client.ask('help', context, []))?.ok).toBe(false)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    const reply = await client.ask('help', context, [])
    expect(reply?.reply).toContain('queue')
    expect(reply?.reply).not.toContain('stack')
  })
})
