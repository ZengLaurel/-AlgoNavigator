import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ArrayPythonRoom } from './ArrayGame'
import { LinkedPythonRoom } from './LinkedGame'
import { QueuePythonRoom } from './QueueGame'
import { CodeEditorPanel } from '../CodeEditorPanel'
import { PyodideContext } from '../../engine/pyodide/pyodideContext'

describe('four Python editors accessibility', () => {
  it.each([
    [
      'Stack Python program',
      () => <CodeEditorPanel starterCode="" onResult={vi.fn()} />,
    ],
    ['Array Python program', () => <ArrayPythonRoom onComplete={vi.fn()} />],
    [
      'Linked list Python program',
      () => <LinkedPythonRoom onComplete={vi.fn()} />,
    ],
    ['Queue Python program', () => <QueuePythonRoom onComplete={vi.fn()} />],
  ] as const)(
    '%s exposes its name and keyboard escape instructions',
    (name, room) => {
      render(
        <PyodideContext.Provider
          value={{
            status: 'ready',
            run: vi.fn(),
            runModule: vi.fn(),
            cancelModule: vi.fn(),
          }}
        >
          {room()}
        </PyodideContext.Provider>,
      )
      const editor = screen.getByRole('textbox', { name })
      const help = document.getElementById(
        editor.getAttribute('aria-describedby')!,
      )
      expect(help?.textContent).toContain('Escape, then Tab')
      expect(help?.textContent).toContain('Tab indents code')
    },
  )
})
