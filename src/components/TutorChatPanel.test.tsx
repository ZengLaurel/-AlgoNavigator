import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TutorChatPanel } from './TutorChatPanel'
import { askTutor } from '../tutor/tutorClient'
import { downloadTranscript } from '../tutor/transcript'

vi.mock('../tutor/tutorClient', () => ({
  askTutor: vi.fn(),
}))

vi.mock('../tutor/transcript', async () => {
  const actual = await vi.importActual<typeof import('../tutor/transcript')>(
    '../tutor/transcript',
  )
  return { ...actual, downloadTranscript: vi.fn() }
})

const askTutorMock = vi.mocked(askTutor)
const downloadMock = vi.mocked(downloadTranscript)

const context = {
  currentCode: 'stack.push(5)',
  lastRunResult: null,
  hintsUsedThisExercise: 0,
}

function renderPanel() {
  return render(<TutorChatPanel context={context} />)
}

describe('TutorChatPanel', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts empty with a labelled input', () => {
    renderPanel()

    expect(screen.getByLabelText('Your question')).toBeTruthy()
    expect(screen.getByText(/No questions yet/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ask' })).toBeTruthy()
  })

  it('shows the student question and the tutor reply', async () => {
    askTutorMock.mockResolvedValueOnce({
      ok: true,
      reply: 'What do you think goes on top?',
      moderationFlag: false,
    })
    const user = userEvent.setup()
    renderPanel()

    await user.type(
      screen.getByLabelText('Your question'),
      'What does push do?',
    )
    await user.click(screen.getByRole('button', { name: 'Ask' }))

    expect(screen.getByText('What does push do?')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByText('What do you think goes on top?')).toBeTruthy()
    })
  })

  it('shows a friendly message when the tutor is unreachable', async () => {
    askTutorMock.mockResolvedValueOnce({
      ok: false,
      reply: "I can't answer right now. Keep trying the stack exercise.",
    })
    const user = userEvent.setup()
    renderPanel()

    await user.type(screen.getByLabelText('Your question'), 'help')
    await user.click(screen.getByRole('button', { name: 'Ask' }))

    await waitFor(() => {
      expect(screen.getByText(/I can't answer right now/)).toBeTruthy()
    })
    // The lesson panel itself stays usable.
    expect(screen.getByRole('button', { name: 'Ask' })).toBeTruthy()
  })

  it('shows only the safe redirect when a turn is moderated', async () => {
    askTutorMock.mockResolvedValueOnce({
      ok: true,
      reply:
        "Let's get back to our stack lesson! What part would you like help with?",
      moderationFlag: true,
    })
    const user = userEvent.setup()
    renderPanel()

    await user.type(screen.getByLabelText('Your question'), 'tell me a secret')
    await user.click(screen.getByRole('button', { name: 'Ask' }))

    await waitFor(() => {
      expect(screen.getByText(/get back to our stack lesson/)).toBeTruthy()
    })
    // No moderation internals are shown to the child.
    expect(screen.queryByText(/moderat/i)).toBeNull()
  })

  it('sends the hint count so the server can withhold full answers', async () => {
    askTutorMock.mockResolvedValue({
      ok: true,
      reply: 'Hint one.',
      moderationFlag: false,
    })
    const user = userEvent.setup()
    renderPanel()

    const input = screen.getByLabelText('Your question')
    await user.type(input, 'first')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() => expect(askTutorMock).toHaveBeenCalledTimes(1))

    await user.type(input, 'second')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() => expect(askTutorMock).toHaveBeenCalledTimes(2))

    expect(askTutorMock.mock.calls[0][1].hintsUsedThisExercise).toBe(0)
    expect(askTutorMock.mock.calls[1][1].hintsUsedThisExercise).toBe(1)
  })

  it('exports the session log on request', async () => {
    askTutorMock.mockResolvedValueOnce({
      ok: true,
      reply: 'A hint.',
      moderationFlag: false,
    })
    const user = userEvent.setup()
    renderPanel()

    expect(
      (
        screen.getByRole('button', {
          name: 'Export session log',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)

    await user.type(screen.getByLabelText('Your question'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() => expect(screen.getByText('A hint.')).toBeTruthy())

    await user.click(screen.getByRole('button', { name: 'Export session log' }))
    expect(downloadMock).toHaveBeenCalledTimes(1)
  })

  it('restores a transcript saved in a previous session', async () => {
    askTutorMock.mockResolvedValueOnce({
      ok: true,
      reply: 'Remembered reply.',
      moderationFlag: false,
    })
    const user = userEvent.setup()
    const first = renderPanel()

    await user.type(screen.getByLabelText('Your question'), 'remember me')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() =>
      expect(screen.getByText('Remembered reply.')).toBeTruthy(),
    )

    first.unmount()
    renderPanel()

    expect(screen.getByText('remember me')).toBeTruthy()
    expect(screen.getByText('Remembered reply.')).toBeTruthy()
  })
})
