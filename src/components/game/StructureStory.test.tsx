import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ArrayStory, LinkedStory, QueueStory } from './StructureStory'
import { SnapshotPlayback } from '../AnimationStage'
import { arrayState } from '../../content/modules/array'
import { forest } from '../../content/modules/linkedList'
import { harbor } from '../../content/modules/queue'
import {
  applyOperation,
  type ArrayState,
  type LinkedListState,
  type QueueState,
} from '../../engine/modules/structures'
const preference = vi.hoisted(() => ({ reduced: true }))
vi.mock('framer-motion', async () => ({
  ...(await vi.importActual<typeof import('framer-motion')>('framer-motion')),
  useReducedMotion: () => preference.reduced,
}))
const phase = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
afterEach(() => {
  vi.useRealTimers()
  preference.reduced = true
})
describe('child-friendly structure stories', () => {
  it('uses the matching event when a recorded program is stepped backwards and forwards', () => {
    const e = applyOperation(arrayState(['A', 'B'], 3), {
      operation: 'insert',
      args: { index: 1, value: 'X' },
    })
    render(
      <SnapshotPlayback
        frames={[e.before as ArrayState, e.after as ArrayState]}
        captions={['Start', 'Insert X']}
        render={(s, index) => (
          <ArrayStory state={s} event={index ? e : undefined} />
        )}
      />,
    )
    phase('Step forward')
    expect(
      screen.getByRole('heading', { name: 'Make a place for a new supply' }),
    ).toBeTruthy()
    phase('1 · Before')
    expect(
      screen.getByText('The new box needs a place. Keep every old box.'),
    ).toBeTruthy()
    phase('Step back')
    expect(
      screen.getByRole('heading', { name: 'The numbered supply shelf' }),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Replay this move' })).toBe(
      null,
    )
  })
  it('does not pretend a detached beacon was reached along the HEAD trail', () => {
    const e = applyOperation(
      forest('a', [
        ['a', 'A', null],
        ['x', 'X', null],
      ]),
      { operation: 'visit', args: { id: 'x' } },
    )
    render(<LinkedStory state={e.after as LinkedListState} event={e} />)
    phase('2 · Watch the move')
    expect(
      screen.getByText(
        'You can read its mark, but no HEAD rope leads here yet.',
      ),
    ).toBeTruthy()
  })
  it('prepares a new beacon successor before changing the previous rope or head sign', () => {
    const initial = forest('a', [
      ['a', 'A', 'b'],
      ['b', 'B', null],
      ['x', 'X', null],
    ])
    const e = applyOperation(initial, {
      operation: 'insertAfter',
      args: { previousId: 'a', id: 'x' },
    })
    const view = render(
      <LinkedStory state={e.after as LinkedListState} event={e} />,
    )
    phase('2 · Watch the move')
    expect(
      view.container.querySelector('[data-from="a"][data-to="b"]'),
    ).toBeTruthy()
    expect(
      view.container.querySelector('[data-from="x"][data-to="b"]'),
    ).toBeTruthy()
    expect(view.container.querySelector('[data-from="a"][data-to="x"]')).toBe(
      null,
    )
    phase('3 · After')
    expect(
      view.container.querySelector('[data-from="a"][data-to="x"]'),
    ).toBeTruthy()
    view.unmount()
    const h = applyOperation(initial, {
      operation: 'insertHead',
      args: { id: 'x' },
    })
    const head = render(
      <LinkedStory state={h.after as LinkedListState} event={h} />,
    )
    phase('2 · Watch the move')
    expect(head.container.querySelector('[data-head="a"]')).toBeTruthy()
    phase('3 · After')
    expect(head.container.querySelector('[data-head="x"]')).toBeTruthy()
  })
  it('shows insertion as making a gap before lowering the new box, with stable identities', () => {
    const e = applyOperation(arrayState(['A', 'B', 'C'], 4), {
      operation: 'insert',
      args: { index: 1, value: 'X' },
    })
    const original = JSON.stringify(e)
    const { container } = render(
      <ArrayStory state={e.after as ArrayState} event={e} />,
    )
    phase('1 · Before')
    expect(
      container
        .querySelector('[data-story-item="item-1"]')
        ?.getAttribute('data-place'),
    ).toBe('1')
    expect(
      container
        .querySelector('[data-story-item="new-0"]')
        ?.getAttribute('aria-hidden'),
    ).toBe('true')
    phase('2 · Watch the move')
    expect(
      container
        .querySelector('[data-story-item="item-1"]')
        ?.getAttribute('data-place'),
    ).toBe('2')
    expect(
      screen.getByText(/Slide the later boxes one place right/),
    ).toBeTruthy()
    phase('3 · After')
    expect(
      container
        .querySelector('[data-story-item="new-0"]')
        ?.getAttribute('data-place'),
    ).toBe('1')
    expect(JSON.stringify(e)).toBe(original)
  })
  it('lifts a removed box before closing the gap without losing the surviving box', () => {
    const e = applyOperation(arrayState(['A', 'B', 'C']), {
      operation: 'remove',
      args: { index: 1 },
    })
    const { container } = render(
      <ArrayStory state={e.after as ArrayState} event={e} />,
    )
    phase('2 · Watch the move')
    expect(
      container
        .querySelector('[data-story-item="item-2"]')
        ?.getAttribute('data-place'),
    ).toBe('2')
    phase('3 · After')
    expect(
      container
        .querySelector('[data-story-item="item-1"]')
        ?.getAttribute('aria-hidden'),
    ).toBe('true')
    expect(
      container
        .querySelector('[data-story-item="item-2"]')
        ?.getAttribute('data-place'),
    ).toBe('1')
  })
  it('separates growing capacity from adding supplies', () => {
    const e = applyOperation(arrayState(['A', 'B'], 2), {
      operation: 'grow',
      args: { capacity: 5 },
    })
    const { container } = render(
      <ArrayStory state={e.after as ArrayState} event={e} />,
    )
    phase('1 · Before')
    expect(screen.getByText('Old shelf · 2 places')).toBeTruthy()
    phase('2 · Watch the move')
    expect(screen.getByText('Bigger shelf · 5 places')).toBeTruthy()
    phase('3 · After')
    expect(container.querySelectorAll('[data-story-item]')).toHaveLength(2)
  })
  it('changes actual next ropes while keeping beacon locations and identities fixed', () => {
    const initial = forest('a', [
      ['a', 'A', 'b'],
      ['b', 'B', null],
      ['x', 'X', 'b'],
    ])
    const e = applyOperation(initial, {
      operation: 'link',
      args: { id: 'a', nextId: 'x' },
    })
    const { container } = render(
      <LinkedStory state={e.after as LinkedListState} event={e} />,
    )
    phase('1 · Before')
    const stone = container
      .querySelector('[data-story-node="b"]')
      ?.getAttribute('transform')
    expect(container.querySelector('[data-from="a"][data-to="b"]')).toBeTruthy()
    phase('2 · Watch the move')
    expect(container.querySelector('[data-from="a"][data-to="x"]')).toBeTruthy()
    expect(container.querySelector('[data-from="x"][data-to="b"]')).toBeTruthy()
    expect(
      container
        .querySelector('[data-story-node="b"]')
        ?.getAttribute('transform'),
    ).toBe(stone)
  })
  it('depicts head removal as changing the starting sign, including an empty trail', () => {
    const e = applyOperation(forest('k', [['k', 'K', null]]), {
      operation: 'removeHead',
      args: {},
    })
    render(<LinkedStory state={e.after as LinkedListState} event={e} />)
    phase('1 · Before')
    expect(screen.queryByText('HEAD → None · empty trail')).toBe(null)
    phase('3 · After')
    expect(screen.getByText('HEAD → None · empty trail')).toBeTruthy()
    expect(screen.getByText('K')).toBeTruthy()
  })
  it('keeps boats and departure history unchanged throughout peek', () => {
    const e = applyOperation(harbor(['A', 'B']), {
      operation: 'peek',
      args: {},
    })
    const { container } = render(
      <QueueStory state={e.after as QueueState} event={e} />,
    )
    for (const name of ['1 · Before', '2 · Watch the move', '3 · After']) {
      phase(name)
      expect(container.querySelectorAll('[data-story-boat]')).toHaveLength(2)
      expect(container.querySelectorAll('[data-served-boat]')).toHaveLength(0)
    }
    expect(
      screen.getByText(/Same waiting boats, same departure history/),
    ).toBeTruthy()
  })
  it('sails out only the front boat before recording its departure', () => {
    const e = applyOperation(harbor(['A', 'B']), {
      operation: 'dequeue',
      args: {},
    })
    const { container } = render(
      <QueueStory state={e.after as QueueState} event={e} />,
    )
    phase('2 · Watch the move')
    expect(container.querySelectorAll('[data-story-boat]')).toHaveLength(2)
    phase('3 · After')
    expect(container.querySelector('[data-story-boat="boat-0"]')).toBe(null)
    expect(container.querySelector('[data-story-boat="boat-1"]')).toBeTruthy()
    expect(container.querySelector('[data-served-boat="boat-0"]')).toBeTruthy()
  })
  it('adds newcomers behind existing boats and explains failed empty operations', () => {
    const e = applyOperation(harbor(['A']), {
      operation: 'enqueue',
      args: { value: 'B' },
    })
    const view = render(<QueueStory state={e.after as QueueState} event={e} />)
    phase('1 · Before')
    expect(
      view.container
        .querySelector('[data-story-boat="new-0"]')
        ?.getAttribute('aria-hidden'),
    ).toBe('true')
    phase('3 · After')
    expect(
      view.container.querySelector('[data-story-boat="boat-0"]'),
    ).toBeTruthy()
    view.unmount()
    const error = applyOperation(harbor([]), { operation: 'dequeue', args: {} })
    render(<QueueStory state={error.after as QueueState} event={error} />)
    expect(screen.getByText('Check the hint, then try again.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Replay this move' })).toBe(
      null,
    )
  })
  it('auto-plays the three phases, pauses, and replays without changing lesson data', () => {
    preference.reduced = false
    vi.useFakeTimers()
    const e = applyOperation(harbor(['A']), { operation: 'peek', args: {} })
    render(<QueueStory state={e.after as QueueState} event={e} />)
    expect(
      screen
        .getByRole('button', { name: '1 · Before' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    act(() => vi.advanceTimersByTime(1100))
    phase('Pause this move')
    act(() => vi.advanceTimersByTime(4000))
    expect(
      screen
        .getByRole('button', { name: '2 · Watch the move' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    phase('Replay this move')
    act(() => vi.advanceTimersByTime(1100))
    act(() => vi.advanceTimersByTime(1100))
    expect(
      screen
        .getByRole('button', { name: '3 · After' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
  })
})
