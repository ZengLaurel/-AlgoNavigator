import type { ReactNode, SVGProps } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StackRenderer } from './StackRenderer'
import type { StructureState } from '../engine/structures/types'

// Animation timing/easing stays a manual visual check (see
// StackRenderer.md). These tests assert structural correctness only, so
// Framer Motion's `motion.g`/`AnimatePresence` are replaced with plain
// passthroughs — real `AnimatePresence` keeps exiting elements mounted
// until their exit animation completes, which would make assertions
// depend on animation timing instead of just rendered output.
interface MotionGProps extends SVGProps<SVGGElement> {
  children?: ReactNode
  initial?: unknown
  animate?: unknown
  exit?: unknown
  transition?: unknown
}

vi.mock('framer-motion', () => ({
  motion: {
    g: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...domProps
    }: MotionGProps) => <g {...domProps}>{children}</g>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

function state(
  values: Array<{ value: number; highlighted?: boolean }>,
): StructureState {
  return {
    elements: values.map((entry, index) => ({
      id: `el-${index}`,
      value: entry.value,
      highlighted: entry.highlighted,
    })),
  }
}

describe('StackRenderer', () => {
  it('renders one text node per element, with correct values', () => {
    render(
      <StackRenderer
        state={state([{ value: 5 }, { value: 8 }, { value: 3 }])}
      />,
    )
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('gives the highlighted element a different fill than non-highlighted ones', () => {
    render(
      <StackRenderer
        state={state([{ value: 5 }, { value: 3, highlighted: true }])}
      />,
    )
    const highlightedRect = screen.getByText('3').previousElementSibling
    const normalRect = screen.getByText('5').previousElementSibling

    expect(highlightedRect?.getAttribute('fill')).not.toBe(
      normalRect?.getAttribute('fill'),
    )
  })
})
