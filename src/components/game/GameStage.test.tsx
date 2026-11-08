import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GAME_PROGRESS_KEY } from '../../engine/gameProgress'
beforeEach(() => localStorage.clear())
vi.mock('./StairwayRepairRoom', () => ({
  StairwayRepairRoom: ({ onComplete }: { onComplete?: () => void }) => (
    <section>
      <h2>Stairway Repair</h2>
      <button onClick={onComplete}>Continue to Forked Path →</button>
    </section>
  ),
}))
import { GameStage } from './GameStage'
import { trialOfStonesSteps } from '../../content/trialOfStonesSteps'

function completeTrial() {
  for (const _step of trialOfStonesSteps) {
    fireEvent.click(screen.getByRole('button', { name: 'Step forward' }))
  }
}

describe('GameStage', () => {
  it('reloads into Trial with saved entrances, and replay cannot relock room three', () => {
    localStorage.setItem(
      GAME_PROGRESS_KEY,
      JSON.stringify({ version: 1, unlockedThrough: 3 }),
    )
    const view = render(<GameStage />)
    expect(
      screen.getByRole('heading', { name: 'Trial of Stones' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: '03 · Forked Path' }),
    ).toBeTruthy()
    completeTrial()
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Stairway Repair →' }),
    )
    expect(
      JSON.parse(localStorage.getItem(GAME_PROGRESS_KEY)!).unlockedThrough,
    ).toBe(3)
    view.unmount()
    render(<GameStage />)
    expect(
      screen.getByRole('heading', { name: 'Trial of Stones' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: '03 · Forked Path' }),
    ).toBeTruthy()
  })
  it('unlocks room three explicitly and preserves both unlocks after returning', async () => {
    render(<GameStage />)
    expect(
      screen.queryByRole('button', { name: '03 · Forked Path' }),
    ).toBeNull()
    completeTrial()
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Stairway Repair →' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Forked Path →' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Forked Path' }),
    ).toBeTruthy()
    fireEvent.click(
      screen.getByRole('button', { name: '01 · Trial of Stones' }),
    )
    expect(
      screen.getByRole('button', { name: '02 · Stairway Repair' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '03 · Forked Path' }))
    expect(
      await screen.findByRole('heading', { name: 'Forked Path' }),
    ).toBeTruthy()
  })
  it('starts on Trial of Stones with Stairway Repair locked', () => {
    render(<GameStage />)
    expect(
      screen
        .getByRole('button', { name: '01 · Trial of Stones' })
        .getAttribute('aria-current'),
    ).toBe('step')
    expect(screen.getByText('02 · Stairway Repair · Coming next')).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Trial of Stones' }),
    ).toBeTruthy()
  })

  it('unlocks and switches to Stairway Repair after completing the trial', () => {
    render(<GameStage />)
    completeTrial()
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Stairway Repair →' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Stairway Repair' }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: '02 · Stairway Repair' })
        .getAttribute('aria-current'),
    ).toBe('step')
  })

  it('switching back to room 01 keeps room 02 unlocked', () => {
    render(<GameStage />)
    completeTrial()
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Stairway Repair →' }),
    )

    fireEvent.click(
      screen.getByRole('button', { name: '01 · Trial of Stones' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Trial of Stones' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: '02 · Stairway Repair' }),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: '02 · Stairway Repair' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Stairway Repair' }),
    ).toBeTruthy()
  })
})
