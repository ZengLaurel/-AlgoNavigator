import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TeachingChat } from './TeachingChat'
import { askTutor } from '../../tutor/tutorClient'
vi.mock('../../tutor/tutorClient', () => ({ askTutor: vi.fn() }))
beforeEach(() => vi.clearAllMocks())
describe('teaching chat role and offline handling', () => {
  it('offers three shortcuts, sends the learner mode and current evidence, and switches to an isolated coach chat', async () => {
    vi.mocked(askTutor).mockResolvedValue({
      ok: true,
      reply: 'Show me the top?',
      moderationFlag: false,
    })
    render(<TeachingChat gameState='{"exercise":844,"correctedRule":false}' />)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Which item would you remove first?',
      }),
    )
    await screen.findByText('Show me the top?')
    expect(askTutor).toHaveBeenCalledWith(
      'Which item would you remove first?',
      expect.objectContaining({
        teachingMode: 'teach-sprite',
        gameState: '{"exercise":844,"correctedRule":false}',
      }),
      [],
    )
    fireEvent.change(screen.getByLabelText('Conversation partner'), {
      target: { value: 'practice-coach' },
    })
    expect(screen.queryByText('Show me the top?')).toBeNull()
    fireEvent.change(screen.getByLabelText('Your explanation or question'), {
      target: { value: 'Give a small hint' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send to Tutor' }))
    await waitFor(() => expect(askTutor).toHaveBeenCalledTimes(2))
    expect(vi.mocked(askTutor).mock.calls[1][1].teachingMode).toBe(
      'practice-coach',
    )
    expect(vi.mocked(askTutor).mock.calls[1][2]).toEqual([])
  })
  it('shows an offline reply, re-enables input and allows another attempt without changing learning progress', async () => {
    vi.mocked(askTutor).mockResolvedValue({
      ok: false,
      reply: 'Tutor is offline. Keep demonstrating.',
    })
    render(<TeachingChat gameState='{"phase":"demo"}' />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Can you try another example?' }),
    )
    await screen.findByText('Tutor is offline. Keep demonstrating.')
    expect(
      (
        screen.getByLabelText(
          'Your explanation or question',
        ) as HTMLTextAreaElement
      ).disabled,
    ).toBe(false)
    expect(screen.queryByText(/Learned through teaching/)).toBeNull()
  })
})
