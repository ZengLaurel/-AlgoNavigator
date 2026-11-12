import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ArrayApplication,
  ArrayObserve,
  ArrayPythonRoom,
  ArrayTeachingActivity,
} from './ArrayGame'
import {
  arrayActivities,
  arrayCodeInitial,
  arrayPredictions,
} from '../../content/modules/array'
import { PyodideContext } from '../../engine/pyodide/pyodideContext'
import type { ModuleRunResult } from '../../engine/pyodide/moduleExecution'

vi.mock('framer-motion', async () => {
  const actual =
    await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return { ...actual, useReducedMotion: () => true }
})
beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())
describe('Array playable rooms', () => {
  it('keeps Python locked until all demonstrations and predictions are completed', () => {
    const done = vi.fn()
    render(<ArrayObserve onComplete={done} />)
    expect(
      screen
        .getByRole('button', { name: 'Continue to Supply Sorting' })
        .hasAttribute('disabled'),
    ).toBe(true)
    for (const p of arrayPredictions) {
      fireEvent.click(screen.getByLabelText(p.correct))
      fireEvent.click(screen.getByRole('button', { name: 'Step forward' }))
    }
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to Supply Sorting' }),
    )
    expect(done).toHaveBeenCalledOnce()
  })
  it('does not award an application gem before complete evidence and supports correction', () => {
    const done = vi.fn()
    render(<ArrayApplication onComplete={done} />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Check and complete camp' }),
    )
    expect(done).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Index'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply operation' }))
    expect(screen.getByRole('status').textContent).toContain('full')
    fireEvent.change(screen.getByLabelText('Operation'), {
      target: { value: 'grow' },
    })
    fireEvent.change(screen.getByLabelText('New capacity'), {
      target: { value: '5' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply operation' }))
    fireEvent.change(screen.getByLabelText('Operation'), {
      target: { value: 'insert' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply operation' }))
    fireEvent.change(screen.getByLabelText('Operation'), {
      target: { value: 'remove' },
    })
    fireEvent.change(screen.getByLabelText('Index'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply operation' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Check and complete camp' }),
    )
    expect(done).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Operation'), {
      target: { value: 'traverse' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply operation' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Check and complete camp' }),
    )
    expect(done).toHaveBeenCalledOnce()
    expect(screen.getByText('Array data gem earned!')).toBeTruthy()
  })
  it('renders the learner correction gate and only awards a taught activity after the fresh case', () => {
    const done = vi.fn()
    const activity = arrayActivities[0]
    render(<ArrayTeachingActivity activity={activity} onMastered={done} />)
    expect(screen.getByText(/mistaken guess/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Start teaching' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply operation' }))
    fireEvent.click(screen.getByRole('button', { name: 'Check demonstration' }))
    fireEvent.change(screen.getByLabelText('Rule to teach'), {
      target: { value: activity.ruleId },
    })
    fireEvent.change(screen.getByLabelText('Why this rule works'), {
      target: { value: activity.reasonId },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Teach the rule' }))
    expect(
      screen.getByText(/I understand this correction; a fresh example/),
    ).toBeTruthy()
    expect(done).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Try a fresh example' }))
    fireEvent.change(screen.getByLabelText('Index'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply operation' }))
    fireEvent.click(screen.getByRole('button', { name: 'Check fresh example' }))
    expect(done).toHaveBeenCalledWith('array-index')
    expect(screen.getByText(/Xiao Tuo learned this activity/)).toBeTruthy()
  })
  it('rejects a wrong Python result and cancels a pending run when the room closes', async () => {
    const done = vi.fn()
    const cancel = vi.fn()
    let resolve: (r: ModuleRunResult) => void = () => {}
    const runModule = vi.fn(
      () =>
        new Promise<ModuleRunResult>((r) => {
          resolve = r
        }),
    )
    const view = render(
      <PyodideContext.Provider
        value={{
          status: 'ready',
          run: vi.fn(),
          runModule,
          cancelModule: cancel,
        }}
      >
        <ArrayPythonRoom onComplete={done} />
      </PyodideContext.Provider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    await act(async () =>
      resolve({
        moduleId: 'array',
        taskId: 'array-code',
        exampleId: 'main',
        sessionId: 'x',
        requestId: 1,
        workerGeneration: 0,
        type: 'module-result',
        protocolVersion: 2,
        stdout: '',
        error: null,
        initialState: arrayCodeInitial,
        finalState: arrayCodeInitial,
        events: [],
      }),
    )
    expect(
      screen
        .getByRole('button', { name: 'Continue to Camp Packing' })
        .hasAttribute('disabled'),
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    view.unmount()
    expect(cancel).toHaveBeenCalled()
    expect(done).not.toHaveBeenCalled()
  })
})
