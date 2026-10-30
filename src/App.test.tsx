import type { ReactNode, SVGProps } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import type { StructureState } from './engine/structures/types'

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

vi.mock('./components/CodeEditorPanel', () => ({
  CodeEditorPanel: ({
    onResult,
  }: {
    onResult: (result: {
      stdout: string
      error: string | null
      finalState: StructureState
    }) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onResult({
          stdout: '3\n',
          error: null,
          finalState: {
            elements: [
              { id: 'slot-0', value: 5 },
              { id: 'slot-1', value: 8 },
            ],
          },
        })
      }
    >
      Run
    </button>
  ),
}))

describe('App', () => {
  it('renders the Stack lesson with no output before the first run', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'AlgoNavigator' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'How a stack works' }),
    ).toBeTruthy()
    expect(screen.getByText('Write Python')).toBeTruthy()
    expect(screen.getByText('Your stack')).toBeTruthy()
    expect(screen.getByText('Starting point')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Step forward' })).toBeTruthy()
    expect(screen.queryByText('Program output')).toBeNull()
  })

  it('shows an explanatory output panel after Python runs', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Run' }))

    await waitFor(() => {
      expect(screen.getByText('Program output')).toBeTruthy()
    })
    expect(
      screen.getByText('Your program peeked at the top item:'),
    ).toBeTruthy()
    expect(
      screen.getAllByRole('img', { name: 'Stack visualization' }),
    ).toHaveLength(2)
    expect(screen.getByText('3', { selector: 'pre.output-value' })).toBeTruthy()
    expect(screen.getByText('Live result')).toBeTruthy()
  })
})
