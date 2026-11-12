import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  QueueObserve,
  QueueApplication,
  QueueTeachingActivity,
  QueuePythonRoom,
} from './QueueGame'
import {
  queueActivities,
  queuePredictions,
  queueCodeInitial,
} from '../../content/modules/queue'
import { PyodideContext } from '../../engine/pyodide/pyodideContext'
import type { ModuleRunResult } from '../../engine/pyodide/moduleExecution'
vi.mock('framer-motion', async () => ({
  ...(await vi.importActual<typeof import('framer-motion')>('framer-motion')),
  useReducedMotion: () => true,
}))
const click = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
const choose = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
describe('Queue harbor rooms', () => {
  it('gates Python behind six observed frames and correct predictions', () => {
    const done = vi.fn()
    render(<QueueObserve onComplete={done} />)
    expect(
      screen
        .getByRole('button', { name: 'Continue to Harbor Dispatch' })
        .hasAttribute('disabled'),
    ).toBe(true)
    for (const p of queuePredictions) {
      fireEvent.click(screen.getByLabelText(p.correct))
      click('Step forward')
    }
    click('Continue to Harbor Dispatch')
    expect(done).toHaveBeenCalledOnce()
  })
  it('awards the harbor gem once only after correct arrival and service evidence', () => {
    const done = vi.fn()
    render(<QueueApplication onComplete={done} />)
    click('Check and complete harbor')
    expect(done).not.toHaveBeenCalled()
    click('Apply operation')
    choose('Operation', 'dequeue')
    click('Apply operation')
    choose('Operation', 'enqueue')
    click('Apply operation')
    choose('Operation', 'dequeue')
    click('Apply operation')
    click('Check and complete harbor')
    expect(done).toHaveBeenCalledOnce()
    expect(screen.getByText('Queue data gem earned!')).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: 'Check and complete harbor' })
        .hasAttribute('disabled'),
    ).toBe(true)
  })
  it('requires a fresh one-boat peek without departure before awarding teaching mastery', () => {
    const done = vi.fn()
    const d = queueActivities[2]
    render(<QueueTeachingActivity activity={d} onMastered={done} />)
    click('Start teaching')
    click('Apply operation')
    click('Check demonstration')
    choose('Rule to teach', d.ruleId)
    choose('Why this rule works', d.reasonId)
    click('Teach the rule')
    expect(
      screen.getByText(/I understand this correction; a fresh example/),
    ).toBeTruthy()
    expect(done).not.toHaveBeenCalled()
    click('Try a fresh example')
    click('Apply operation')
    click('Check fresh example')
    expect(done).toHaveBeenCalledWith(d.exerciseId)
    click('Replay from demonstration')
    expect(done).toHaveBeenCalledOnce()
  })
  it('shows empty-service recovery in the fresh teaching task', () => {
    render(
      <QueueTeachingActivity
        activity={queueActivities[3]}
        onMastered={vi.fn()}
      />,
    )
    click('Start teaching')
    choose('Operation', 'dequeue')
    click('Apply operation')
    choose('Operation', 'enqueue')
    choose('Boat name', 'C')
    click('Apply operation')
    choose('Operation', 'dequeue')
    click('Apply operation')
    click('Check demonstration')
    choose('Rule to teach', queueActivities[3].ruleId)
    choose('Why this rule works', queueActivities[3].reasonId)
    click('Teach the rule')
    click('Try a fresh example')
    choose('Operation', 'dequeue')
    click('Apply operation')
    expect(screen.getByRole('status').textContent).toContain('empty queue')
    expect(screen.getByText('Empty queue · no front or rear')).toBeTruthy()
  })
  it('rejects a successful Python run that lacks goal evidence and cancels on unmount', async () => {
    const cancelModule = vi.fn()
    const runModule = vi.fn().mockResolvedValue({
      finalState: queueCodeInitial,
      events: [],
      stdout: '',
      error: null,
    } as Partial<ModuleRunResult>)
    const view = render(
      <PyodideContext.Provider
        value={{ status: 'ready', run: vi.fn(), runModule, cancelModule }}
      >
        <QueuePythonRoom onComplete={vi.fn()} />
      </PyodideContext.Provider>,
    )
    await act(async () => click('Run'))
    expect(
      screen
        .getByRole('button', { name: 'Continue to Harbor Service' })
        .hasAttribute('disabled'),
    ).toBe(true)
    view.unmount()
    expect(cancelModule).toHaveBeenCalled()
  })
})
