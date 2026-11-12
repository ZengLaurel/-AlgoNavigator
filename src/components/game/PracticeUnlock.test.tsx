import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GAME_PROGRESS_KEY } from '../../engine/gameProgress'
import { MODULE_PROGRESS_KEY } from '../../engine/modules/progress'
import { ADVENTURE_PROGRESS_KEY } from '../../adventureProgress'
import { GameStage } from './GameStage'

vi.mock('./ForkedPathRoom', () => ({
  ForkedPathRoom: ({
    onComplete,
    onPractice,
  }: {
    onComplete: () => void
    onPractice: () => void
  }) => (
    <section>
      <button onClick={onComplete}>Reach final exit</button>
      <button onClick={onPractice}>Continue to Teach Xiao Tuo →</button>
    </section>
  ),
}))
beforeEach(() => localStorage.clear())
describe('final-room practice unlock', () => {
  it('keeps the bank locked before the exit, unlocks and persists it at the exit, and opens the bank', async () => {
    localStorage.setItem(
      GAME_PROGRESS_KEY,
      JSON.stringify({ version: 1, unlockedThrough: 3 }),
    )
    const onComplete = vi.fn()
    const view = render(<GameStage onComplete={onComplete} />)
    expect(
      screen.queryByRole('button', { name: '04 · Teach Xiao Tuo' }),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '03 · Forked Path' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Reach final exit' }),
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(
      JSON.parse(localStorage.getItem(MODULE_PROGRESS_KEY)!).modules.stack
        .teachingUnlocked,
    ).toBe(true)
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Teach Xiao Tuo →' }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Teach Xiao Tuo — Stack practice bank',
      }),
    ).toBeTruthy()
    view.unmount()
    render(<GameStage />)
    expect(
      screen.getByRole('button', { name: '04 · Teach Xiao Tuo' }),
    ).toBeTruthy()
  })
  it('allows existing players with the previously earned world-map gem to open practice', () => {
    localStorage.setItem(
      ADVENTURE_PROGRESS_KEY,
      JSON.stringify({ stackCompleted: true }),
    )
    render(<GameStage />)
    expect(
      screen.getByRole('button', { name: '04 · Teach Xiao Tuo' }),
    ).toBeTruthy()
  })
})
