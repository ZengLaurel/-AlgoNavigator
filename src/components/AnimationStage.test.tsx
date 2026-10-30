import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnimationStage } from './AnimationStage'
import { stackAnimationSteps } from '../content/stackAnimationSteps'

// Trivial render prop: deliberately does NOT use StackRenderer, so these
// tests exercise only AnimationStage's own stepping/playback logic, with
// no Framer Motion / SVG rendering involved (see StackRenderer.test.tsx
// for structural rendering coverage, and StackRenderer.md for why
// animation timing is kept out of automated assertions).
function renderFrame(state: { elements: { value: number | string }[] }) {
  return (
    <div data-testid="frame">
      {state.elements.map((element) => element.value).join(',')}
    </div>
  )
}

function setup() {
  return render(
    <AnimationStage steps={stackAnimationSteps} render={renderFrame} />,
  )
}

function isDisabled(element: HTMLElement) {
  return (element as HTMLButtonElement).disabled
}

describe('AnimationStage', () => {
  it('starts at the empty starting frame', () => {
    setup()
    expect(screen.getByTestId('frame').textContent).toBe('')
    expect(screen.getByText('Starting point')).toBeTruthy()
    expect(isDisabled(screen.getByRole('button', { name: 'Step back' }))).toBe(
      true,
    )
  })

  it('steps forward through the full push/pop/peek sequence', async () => {
    const user = userEvent.setup()
    setup()
    const stepForward = screen.getByRole('button', { name: 'Step forward' })

    const expectedFrames = ['5', '5,8', '5,8,3', '5,8,3', '5,8', '5']
    for (const expected of expectedFrames) {
      await user.click(stepForward)
      expect(screen.getByTestId('frame').textContent).toBe(expected)
    }

    // All 6 scripted steps consumed: final frame reached, no more to step.
    expect(isDisabled(stepForward)).toBe(true)
    expect(
      screen.getByText('pop() — remove the top item. 8 comes off.'),
    ).toBeTruthy()
  })

  it('steps back to the previous frame', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: 'Step forward' }))
    await user.click(screen.getByRole('button', { name: 'Step forward' }))
    expect(screen.getByTestId('frame').textContent).toBe('5,8')

    await user.click(screen.getByRole('button', { name: 'Step back' }))
    expect(screen.getByTestId('frame').textContent).toBe('5')
  })

  describe('Play', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('auto-advances through every frame and stops itself at the end', async () => {
      setup()

      fireEvent.click(screen.getByRole('button', { name: 'Play' }))
      expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()

      // 6 steps at the default 1x speed (1200ms/step). Advance one
      // interval at a time, flushing via act() between each step — a
      // single large advanceTimersByTimeAsync() call doesn't give React's
      // effect a chance to re-register the *next* timer in between, so it
      // only ever fires once no matter how far the clock is advanced.
      for (let i = 0; i < 7; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1200)
        })
      }

      expect(screen.getByTestId('frame').textContent).toBe('5')
      // Reached the end: control must flip back to "Play", not stay on
      // "Pause" forever (this is the behavior fixed for the ESLint
      // react-hooks/set-state-in-effect violation — see AnimationStage.md).
      const playButton = screen.getByRole('button', { name: 'Play' })
      expect(playButton).toBeTruthy()
      expect(isDisabled(playButton)).toBe(true)
    })
  })
})
