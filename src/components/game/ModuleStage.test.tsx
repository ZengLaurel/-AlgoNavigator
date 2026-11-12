import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ModuleStage } from './ModuleStage'
import { SnapshotPlayback } from '../AnimationStage'
import { createProgressStore } from '../../engine/modules/progress'

beforeEach(() => localStorage.clear())
afterEach(() => vi.useRealTimers())
describe('shared module shell and snapshot playback', () => {
  it('keeps stages ordered, provides knowledge/tutor and awards only from third-stage completion', () => {
    render(
      <ModuleStage
        moduleId="array"
        tutor={<p>Optional tutor</p>}
        renderRoom={(room, actions) => (
          <>
            <p>Current room {room}</p>
            <button onClick={actions.advance}>Verified advance</button>
            <button onClick={actions.complete}>Verified complete</button>
          </>
        )}
      />,
    )
    expect(
      screen
        .getByRole('button', { name: '2 · Python' })
        .hasAttribute('disabled'),
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Verified complete' }))
    expect(createProgressStore().read().modules.array.completed).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Verified advance' }))
    fireEvent.click(screen.getByRole('button', { name: 'Verified advance' }))
    fireEvent.click(screen.getByRole('button', { name: 'Verified complete' }))
    expect(createProgressStore().read().modules.array.completed).toBe(true)
    expect(
      screen
        .getByRole('button', { name: '4 · Teach Xiao Tuo' })
        .hasAttribute('disabled'),
    ).toBe(false)
    expect(screen.getByText('Optional tutor')).toBeTruthy()
    expect(screen.getByText('Length and capacity')).toBeTruthy()
  })
  it('replays arbitrary queue snapshots without executing or changing the data', () => {
    vi.useFakeTimers()
    const frames = [{ waiting: ['A', 'B'] }, { waiting: ['B'] }]
    const original = JSON.stringify(frames)
    render(
      <SnapshotPlayback
        frames={frames}
        captions={['Before service', 'After service']}
        render={(state) => <p>{state.waiting.join(',')}</p>}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    act(() => vi.advanceTimersByTime(1200))
    expect(screen.getByText('After service')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Step back' }))
    expect(screen.getByText('A,B')).toBeTruthy()
    expect(JSON.stringify(frames)).toBe(original)
  })
})
