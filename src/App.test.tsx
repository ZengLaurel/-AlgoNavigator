import type { ReactNode, SVGProps } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

// Same rationale as StackRenderer.test.tsx: this test asserts the Stack
// lesson actually renders end-to-end (App -> AnimationStage ->
// StackRenderer), not animation timing, so Framer Motion is stubbed out.
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

describe('App', () => {
  it('renders the Stack lesson on load', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'AlgoNavigator' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Stack' })).toBeTruthy()
    expect(screen.getByText('Starting point')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Step forward' })).toBeTruthy()
  })
})
