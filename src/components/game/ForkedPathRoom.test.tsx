import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { RoomNode } from '../../engine/path/pathState'
import { ForkedPathRoom } from './ForkedPathRoom'
vi.mock('framer-motion', () => ({
  useReducedMotion: () => true,
  motion: {
    circle: ({
      initial: _initial,
      animate: _animate,
      transition: _transition,
      onAnimationComplete: _end,
      ...props
    }: Record<string, unknown>) => <circle {...props} />,
  },
}))
const nodes: Record<string, RoomNode> = {
  start: { id: 'start', type: 'entrance', connections: ['fork'] },
  fork: { id: 'fork', type: 'hall', connections: ['start', 'dead', 'exit'] },
  dead: { id: 'dead', type: 'deadEnd', connections: ['fork'] },
  exit: { id: 'exit', type: 'exit', connections: ['fork'] },
}
const enter = (name: RegExp) =>
  fireEvent.keyDown(screen.getByRole('button', { name }), { key: 'Enter' })
describe('ForkedPathRoom', () => {
  it('explains room cards and pops the room being left while keeping explored marks', () => {
    const { container } = render(<ForkedPathRoom generate={() => nodes} />)
    const guide = screen.getByRole('complementary', {
      name: 'Your trail of room cards',
    })
    expect(guide.textContent).toContain('top card is the room you are in now')
    expect(guide.textContent).toContain('not the room you are returning to')
    expect(guide.textContent).toContain(
      'entrance → fork → dead end becomes entrance → fork after pop',
    )
    expect(guide.textContent).toContain('entrance card cannot be popped')
    enter(/^Fork fork/)
    enter(/^Dead end dead/)
    fireEvent.click(screen.getByRole('button', { name: 'Backtrack (pop)' }))
    expect(screen.getByRole('status').textContent).toContain(
      'pop: removed the card for Dead end dead; returned to Fork fork',
    )
    expect(
      Array.from(container.querySelectorAll('[data-stack-room]')).map((node) =>
        node.getAttribute('data-stack-room'),
      ),
    ).toEqual(['start', 'fork'])
    expect(
      screen.getByRole('button', { name: /^Dead end dead, explored/ }),
    ).toBeTruthy()
    expect(screen.getByText('Current: Fork fork')).toBeTruthy()
  })

  it('renders the generated SVG and stack, supports dead-end pop, branch re-entry, exit freeze and fresh replay', () => {
    const generate = vi.fn(() => nodes)
    const { container } = render(<ForkedPathRoom generate={generate} />)
    expect(container.querySelectorAll('[data-room-node]')).toHaveLength(4)
    expect(container.querySelectorAll('[data-path-edge]')).toHaveLength(3)
    expect(
      (
        screen.getByRole('button', {
          name: 'Backtrack (pop)',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
    enter(/^Fork fork/)
    enter(/^Dead end dead/)
    expect(screen.getByText(/A dead end!/)).toBeTruthy()
    expect(
      Array.from(container.querySelectorAll('[data-stack-room]')).map((e) =>
        e.getAttribute('data-stack-room'),
      ),
    ).toEqual(['start', 'fork', 'dead'])
    expect(
      screen.getByRole('img', {
        name: /Path stack bottom to top:.*Top: Dead end dead/,
      }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Backtrack (pop)' }))
    enter(/^Dead end dead, explored/)
    fireEvent.click(screen.getByRole('button', { name: 'Backtrack (pop)' }))
    enter(/^Exit exit/)
    expect(
      screen.getByRole('heading', { name: 'Stack Ruins complete!' }),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: /^Fork fork/ })
        .getAttribute('aria-disabled'),
    ).toBe('true')
    fireEvent.click(
      screen.getByRole('button', { name: 'Replay with a new maze' }),
    )
    expect(generate).toHaveBeenCalledTimes(2)
    expect(container.querySelectorAll('[data-stack-room]')).toHaveLength(1)
    expect(
      screen.queryByRole('heading', { name: 'Stack Ruins complete!' }),
    ).toBeNull()
  })
})
