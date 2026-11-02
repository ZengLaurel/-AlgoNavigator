import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildExport,
  createMessage,
  clearTranscript,
  loadTranscript,
  MAX_STORED_MESSAGES,
  saveTranscript,
} from './transcript'

const STORAGE_KEY = 'algonavigator.transcript.stack.v1'

describe('transcript storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty transcript when nothing is stored', () => {
    expect(loadTranscript()).toEqual([])
  })

  it('returns an empty transcript when storage is corrupt', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json at all')
    expect(loadTranscript()).toEqual([])
  })

  it('drops entries that do not match the message shape', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ nope: true }, createMessage('student', 'hi')]),
    )
    const loaded = loadTranscript()

    expect(loaded).toHaveLength(1)
    expect(loaded[0].text).toBe('hi')
  })

  it('round-trips messages in order', () => {
    const messages = [
      createMessage('student', 'What does push do?'),
      createMessage('tutor', 'What do you think goes on top?'),
    ]
    saveTranscript(messages)

    const loaded = loadTranscript()
    expect(loaded.map((message) => message.role)).toEqual(['student', 'tutor'])
    expect(loaded[1].text).toBe('What do you think goes on top?')
    expect(loaded[0].at).toEqual(expect.any(String))
  })

  it('caps stored history so a long session cannot fill storage', () => {
    const messages = Array.from({ length: MAX_STORED_MESSAGES + 10 }, (_, i) =>
      createMessage('student', `question ${i}`),
    )
    saveTranscript(messages)

    const loaded = loadTranscript()
    expect(loaded).toHaveLength(MAX_STORED_MESSAGES)
    // The oldest turns are the ones dropped.
    expect(loaded[loaded.length - 1].text).toBe(
      `question ${MAX_STORED_MESSAGES + 9}`,
    )
  })

  it('clears stored history', () => {
    saveTranscript([createMessage('student', 'hi')])
    clearTranscript()
    expect(loadTranscript()).toEqual([])
  })
})

describe('buildExport', () => {
  it('exports only the approved review fields', () => {
    const messages = [
      createMessage('student', 'What does pop do?'),
      createMessage('tutor', "Let's get back to our stack lesson!", true),
    ]

    const exported = buildExport(messages)

    expect(exported.lesson).toBe('stack')
    expect(exported.exportedAt).toEqual(expect.any(String))
    expect(Object.keys(exported.messages[0]).sort()).toEqual([
      'at',
      'role',
      'text',
    ])
    expect(exported.messages[1].moderated).toBe(true)
  })

  it('does not carry internal ids into the exported file', () => {
    const exported = buildExport([createMessage('student', 'hello')])
    expect(JSON.stringify(exported)).not.toContain('"id"')
  })
})
