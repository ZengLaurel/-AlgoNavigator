import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorView } from '@codemirror/view'
import { PyodideContext } from '../../engine/pyodide/pyodideContext'
import type { ExecResult, PyodideStatus } from '../../engine/pyodide/types'
import { StairwayRepairContent } from './StairwayRepairRoom'

function renderWithRun(
  run: (code: string) => Promise<ExecResult>,
  onComplete?: () => void,
) {
  return render(
    <PyodideContext.Provider value={{ status: 'ready', run }}>
      <StairwayRepairContent onComplete={onComplete} />
    </PyodideContext.Provider>,
  )
}

/** Sprite/door art now resolves to real `<img>` elements (alt text)
 * instead of placeholder `<svg role="img" aria-label>`; this matches either. */
function findByAccName(text: string) {
  return screen.queryByAltText(text) ?? screen.getByLabelText(text)
}

const matchingResult: ExecResult = {
  stdout: '',
  error: null,
  finalState: {
    elements: [
      { id: 'slot-0', value: 1, glyph: 'base' },
      { id: 'slot-1', value: 2, glyph: 'moon' },
      { id: 'slot-2', value: 3, glyph: 'star' },
    ],
  },
}

const nonMatchingResult: ExecResult = {
  stdout: '',
  error: null,
  finalState: {
    elements: [{ id: 'slot-0', value: 1, glyph: 'base' }],
  },
}

const erroredResult: ExecResult = {
  stdout: '',
  error: 'IndexError: pop from empty stack',
  finalState: null,
}

describe('StairwayRepairRoom', () => {
  it('only sends tutor context on Ask, including edited code and real run state', async () => {
    window.localStorage.clear()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          reply: 'Which stone is on top?',
          moderationFlag: false,
        }),
        {
          headers: { 'content-type': 'application/json' },
        },
      ),
    )
    try {
      renderWithRun(vi.fn().mockResolvedValue(nonMatchingResult))
      fireEvent.click(
        screen.getByRole('button', { name: 'Ask the stack tutor' }),
      )
      expect(fetchMock).not.toHaveBeenCalled()
      const editor = EditorView.findFromDOM(
        document.querySelector('.cm-editor') as HTMLElement,
      )!
      const editedCode = 'stack = MyStack()\nstack.push(1, "base")'
      act(() =>
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: editedCode },
        }),
      )
      fireEvent.click(screen.getByRole('button', { name: 'Run' }))
      await screen.findByText(/Your stack — this run result/)
      fireEvent.change(screen.getByLabelText('Your question'), {
        target: { value: 'What is missing?' },
      })
      fireEvent.click(screen.getByRole('button', { name: /^Ask$/ }))
      await screen.findByText('Which stone is on top?')
      const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string)
      expect(body.context.currentCode).toBe(editedCode)
      expect(body.context.lastRunResult.finalState).toEqual(
        nonMatchingResult.finalState,
      )
      expect(JSON.parse(body.context.gameState)).toMatchObject({
        room: 'Stairway Repair',
        target: ['base', 'moon', 'star'],
        stack: nonMatchingResult.finalState!.elements,
        completed: false,
      })
      fireEvent.click(screen.getByRole('button', { name: 'Hide the tutor' }))
      fireEvent.click(
        screen.getByRole('button', { name: 'Ask the stack tutor' }),
      )
      await waitFor(() =>
        expect(screen.getByText('Which stone is on top?')).toBeTruthy(),
      )
    } finally {
      fetchMock.mockRestore()
    }
  })
  it('only continues after success and an explicit button click', async () => {
    const onComplete = vi.fn()
    renderWithRun(vi.fn().mockResolvedValue(matchingResult), onComplete)
    expect(
      screen.queryByRole('button', { name: 'Continue to Forked Path →' }),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    const button = await screen.findByRole('button', {
      name: 'Continue to Forked Path →',
    })
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(button)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
  it('shows the target pattern on mount', () => {
    renderWithRun(vi.fn())
    expect(screen.getByLabelText('Target pattern')).toBeTruthy()
    expect(findByAccName('The guide sprite, resting')).toBeTruthy()
    expect(findByAccName('A closed stone ruins door')).toBeTruthy()
  })

  it('reveals the reward when the run matches the target', async () => {
    const run = vi.fn().mockResolvedValue(matchingResult)
    renderWithRun(run)
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    expect(await screen.findByRole('status')).toBeTruthy()
    expect(findByAccName('The guide sprite, celebrating')).toBeTruthy()
    expect(findByAccName('An open stone ruins door')).toBeTruthy()
  })

  it('shows missing-stone feedback without unlocking the gate', async () => {
    const run = vi.fn().mockResolvedValue(nonMatchingResult)
    renderWithRun(run)
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    await act(async () => {
      await vi.waitFor(() => expect(run).toHaveBeenCalled())
    })
    expect(
      await screen.findByText(/Missing 2 stones: moon → star/),
    ).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
    expect(findByAccName('A closed stone ruins door')).toBeTruthy()
  })

  it('shows the thinking pose and error message on a Python error', async () => {
    const run = vi.fn().mockResolvedValue(erroredResult)
    renderWithRun(run)
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    expect((await screen.findByRole('alert')).textContent).toContain(
      'IndexError: pop from empty stack',
    )
    expect(findByAccName('The guide sprite, thinking')).toBeTruthy()
    expect(findByAccName('A closed stone ruins door')).toBeTruthy()
  })

  it('teaches ordered building and separate value-returning examples without editing or running code', () => {
    const run = vi.fn()
    renderWithRun(run)
    const basics = screen.getByRole('complementary', {
      name: 'Meet your stone stack',
    })
    const steps = within(basics).getAllByRole('listitem')
    expect(
      steps.map((step) => step.querySelector('code')?.textContent),
    ).toEqual([
      'stack = MyStack()',
      "stack.push(1, 'base')",
      "stack.push(2, 'moon')",
      "stack.push(3, 'star')",
    ])
    expect(basics.textContent).toContain(
      'Python reads your lines from top to bottom',
    )
    expect(steps[0].textContent).toContain('new, empty tower')
    expect(steps[1].textContent).toContain('1 is the stored number')
    expect(steps[1].textContent).toContain(
      'base is both the bottom and the top',
    )
    expect(steps[2].textContent).toContain('base → moon')
    expect(steps[3].textContent).toContain('base → moon → star')
    expect(basics.textContent).toContain('not a line-by-line animation')
    const examples = screen.getByRole('complementary', {
      name: 'Function guide — separate examples',
    })
    const [push, pop, peek] = within(examples).getAllByRole('listitem')
    expect(push.textContent).toContain('quoted word chooses the picture')
    expect(pop.textContent).toContain('pop removes star')
    expect(pop.textContent).toContain('base → moon, with moon on top')
    expect(pop.textContent).toContain('returns the number 3')
    expect(pop.textContent).toContain('not the word star')
    expect(peek.textContent).toContain('peek returns the number 3')
    expect(peek.textContent).toContain('Star stays on top')
    expect(examples.textContent).toContain('not extra lines for your solution')
    expect(examples.textContent).toContain(
      'Each example starts with its own tower',
    )
    expect(examples.textContent).toContain('empty tower has no top stone')
    expect(examples.textContent).toContain('IndexError')
    const editor = screen.getByLabelText('Python code editor')
    expect(editor.textContent).toContain("stack.push(1, 'base')")
    expect(editor.textContent).not.toContain('stack.pop()')
    expect(editor.textContent).not.toContain("stack.push(2, 'moon')")
    expect(run).not.toHaveBeenCalled()
  })

  it('reveals hints progressively without editing the student code', () => {
    const run = vi.fn()
    renderWithRun(run)
    const editor = screen.getByLabelText('Python code editor')
    const originalCode = editor.textContent
    expect(
      screen.getByLabelText('Target code names, bottom to top').textContent,
    ).toBe('base → moon → star')
    expect(screen.getByText(/MyStack is already provided/)).toBeTruthy()
    expect(screen.queryByText(/Two stones are still missing/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Show hint 1 of 3' }))
    expect(screen.getByText(/Two stones are still missing/)).toBeTruthy()
    expect(screen.queryByText(/Keep the base push/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Show hint 2 of 3' }))
    expect(screen.getByText(/Keep the base push/)).toBeTruthy()
    expect(screen.queryByText(/Add these two lines/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Show hint 3 of 3' }))
    expect(screen.getByText(/Add these two lines/)).toBeTruthy()
    expect(
      within(document.getElementById('stairway-hints')!).getByText(
        /stack.push\(2, 'moon'\)/,
      ).textContent,
    ).toBe("stack.push(2, 'moon')\nstack.push(3, 'star')")
    expect(
      (
        screen.getByRole('button', {
          name: 'All hints shown',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
    expect(screen.getByText(/Two stones are still missing/)).toBeTruthy()
    expect(editor.textContent).toBe(originalCode)
    expect(run).not.toHaveBeenCalled()
  })

  it.each([
    [
      'wrong glyph',
      { elements: [{ id: '0', value: 1, glyph: 'sun' as const }] },
      "Stone 1 from the bottom should be 'base', but is 'sun'",
    ],
    [
      'extra stone',
      {
        elements: [
          ...matchingResult.finalState!.elements,
          { id: '3', value: 4, glyph: 'sun' as const },
        ],
      },
      '1 extra stone on top',
    ],
    ['empty stack', { elements: [] }, 'Your stack is empty. Missing 3 stones'],
    ['no stack', null, 'No stack result was returned'],
  ])(
    'explains %s results without completion',
    async (_name, finalState, message) => {
      renderWithRun(
        vi.fn().mockResolvedValue({ stdout: '', error: null, finalState }),
      )
      fireEvent.click(screen.getByRole('button', { name: 'Run' }))
      expect(
        await screen.findByText(
          (_, element) =>
            element?.className === 'stairway-feedback' &&
            !!element.textContent?.includes(message),
        ),
      ).toBeTruthy()
      expect(screen.queryByRole('status')).toBeNull()
    },
  )

  it.each(['loading', 'running'] as const)(
    'labels previous results and hides stale feedback while %s',
    async (busyStatus) => {
      const run = vi
        .fn()
        .mockResolvedValueOnce(nonMatchingResult)
        .mockResolvedValueOnce(erroredResult)
      const content = (status: PyodideStatus) => (
        <PyodideContext.Provider value={{ status, run }}>
          <StairwayRepairContent />
        </PyodideContext.Provider>
      )
      const { rerender } = render(content('ready'))
      fireEvent.click(screen.getByRole('button', { name: 'Run' }))
      await screen.findByText(/Missing 2 stones/)
      expect(screen.getByText('Your stack — this run result')).toBeTruthy()
      rerender(content(busyStatus))
      expect(
        screen.getByText(/previous run result; waiting for this run/),
      ).toBeTruthy()
      expect(screen.queryByText(/Missing 2 stones/)).toBeNull()
      expect(
        (screen.getByRole('button', { name: 'Run' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true)
      rerender(content('ready'))
      fireEvent.click(screen.getByRole('button', { name: 'Run' }))
      await screen.findByRole('alert')
      expect(screen.queryByText(/Missing 2 stones/)).toBeNull()
      rerender(content(busyStatus))
      expect(screen.queryByRole('alert')).toBeNull()
    },
  )

  it('replay resets the reward state and hints', async () => {
    const run = vi.fn().mockResolvedValue(matchingResult)
    renderWithRun(run)
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    await screen.findByRole('status')
    fireEvent.click(screen.getByRole('button', { name: 'Show hint 1 of 3' }))

    fireEvent.click(screen.getByRole('button', { name: 'Replay the trial' }))
    expect(
      screen.getByRole('button', { name: 'Show hint 1 of 3' }),
    ).toBeTruthy()
    expect(screen.queryByText(/Two stones are still missing/)).toBeNull()
    expect(screen.getByText('Your stack — not run yet')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
    expect(findByAccName('A closed stone ruins door')).toBeTruthy()
  })
})
