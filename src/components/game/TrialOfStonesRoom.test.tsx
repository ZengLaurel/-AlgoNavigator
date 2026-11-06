import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TrialOfStonesRoom } from './TrialOfStonesRoom'
import { trialOfStonesSteps } from '../../content/trialOfStonesSteps'

afterEach(() => vi.useRealTimers())

function completeTrial() {
  for (const _step of trialOfStonesSteps) {
    fireEvent.click(screen.getByRole('button', { name: 'Step forward' }))
  }
}

describe('TrialOfStonesRoom', () => {
  it('starts with the guide, closed gate, and no premature completion', () => {
    render(<TrialOfStonesRoom />)
    expect(screen.getByLabelText('The guide sprite, explaining')).toBeTruthy()
    expect(screen.getByLabelText('A closed stone ruins door')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('completes by stepping, keeps the reward when reviewing, and replays cleanly', () => {
    render(<TrialOfStonesRoom />)
    completeTrial()
    expect(screen.getByRole('status').textContent).toContain(
      'Last In, First Out',
    )
    expect(screen.getByLabelText('The guide sprite, celebrating')).toBeTruthy()
    expect(screen.getByLabelText('An open stone ruins door')).toBeTruthy()
    expect(screen.getByLabelText('A glowing magic stairway')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Step back' }))
    expect(screen.getByRole('status')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Replay the trial' }))
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('Starting point')).toBeTruthy()
    expect(screen.queryByLabelText('A glowing magic stairway')).toBeNull()
  })

  it('finishes through automatic playback', async () => {
    vi.useFakeTimers()
    render(<TrialOfStonesRoom />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    for (const _step of trialOfStonesSteps) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1200)
      })
    }
    expect(screen.getByRole('status')).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Play' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it('pauses playback without advancing and respects the speed control', async () => {
    vi.useFakeTimers()
    render(<TrialOfStonesRoom />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2400)
    })
    expect(screen.getByText('Starting point')).toBeTruthy()

    fireEvent.change(screen.getByRole('combobox', { name: 'Speed' }), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(599)
    })
    expect(screen.getByText('Starting point')).toBeTruthy()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByText(trialOfStonesSteps[0].description)).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })
})
