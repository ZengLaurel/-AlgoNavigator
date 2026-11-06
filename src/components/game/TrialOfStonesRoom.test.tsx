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

/** Sprite/door/stairs art now resolves to real `<img>` elements (alt text)
 * instead of placeholder `<svg role="img" aria-label>`; this matches either. */
function findByAccName(text: string) {
  return screen.queryByAltText(text) ?? screen.getByLabelText(text)
}
function queryByAccName(text: string) {
  return screen.queryByAltText(text) ?? screen.queryByLabelText(text)
}

describe('TrialOfStonesRoom', () => {
  it('explains all seven moves and keeps captions aligned with actual top changes', () => {
    render(<TrialOfStonesRoom />)
    const guide = screen.getByRole('complementary', {
      name: 'How the stone tower works',
    })
    expect(guide.textContent).toContain('Last In, First Out')
    expect(guide.textContent).toContain('Use Step forward')
    expect(guide.querySelectorAll('li')).toHaveLength(7)
    expect(trialOfStonesSteps.map((step) => step.operation)).toEqual([
      'push',
      'push',
      'push',
      'peek',
      'pop',
      'pop',
      'pop',
    ])
    const expected = [
      ['base'],
      ['base', 'moon'],
      ['base', 'moon', 'star'],
      ['base', 'moon', 'star'],
      ['base', 'moon'],
      ['base'],
      [],
    ]
    trialOfStonesSteps.forEach((step, index) => {
      expect(step.afterState.elements.map((element) => element.glyph)).toEqual(
        expected[index],
      )
      expect(step.description.startsWith(`${step.operation}:`)).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: 'Step forward' }))
      expect(screen.getByText(step.description)).toBeTruthy()
    })
    expect(trialOfStonesSteps[3].description).toContain('No stone is removed')
    expect(trialOfStonesSteps[6].description).toContain('stack is now empty')
  })

  it('starts with the guide, closed gate, and no premature completion', () => {
    render(<TrialOfStonesRoom />)
    expect(findByAccName('The guide sprite, explaining')).toBeTruthy()
    expect(findByAccName('A closed stone ruins door')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('completes by stepping, keeps the reward when reviewing, and replays cleanly', () => {
    render(<TrialOfStonesRoom />)
    completeTrial()
    expect(screen.getByRole('status').textContent).toContain(
      'Last In, First Out',
    )
    expect(findByAccName('The guide sprite, celebrating')).toBeTruthy()
    expect(findByAccName('An open stone ruins door')).toBeTruthy()
    expect(findByAccName('A glowing magic stairway')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Step back' }))
    expect(screen.getByRole('status')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Replay the trial' }))
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('Starting point')).toBeTruthy()
    expect(queryByAccName('A glowing magic stairway')).toBeNull()
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
