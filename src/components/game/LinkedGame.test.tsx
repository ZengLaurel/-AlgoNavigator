import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  LinkedObserve,
  LinkedApplication,
  LinkedTeachingActivity,
} from './LinkedGame'
import {
  linkedActivities,
  linkedPredictions,
} from '../../content/modules/linkedList'
vi.mock('framer-motion', async () => ({
  ...(await vi.importActual<typeof import('framer-motion')>('framer-motion')),
  useReducedMotion: () => true,
}))
const click = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }))
const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
describe('Linked forest rooms', () => {
  it('keeps observation completion gated by all predictions and frames', () => {
    const done = vi.fn()
    render(<LinkedObserve onComplete={done} />)
    expect(
      screen
        .getByRole('button', { name: 'Continue to Beacon Repair' })
        .hasAttribute('disabled'),
    ).toBe(true)
    for (const p of linkedPredictions) {
      fireEvent.click(screen.getByLabelText(p.correct))
      click('Step forward')
    }
    click('Continue to Beacon Repair')
    expect(done).toHaveBeenCalledOnce()
  })
  it('allows cycle creation and repair, then awards a complete delivery once', () => {
    const done = vi.fn()
    render(<LinkedApplication onComplete={done} />)
    click('Check and complete forest')
    expect(done).not.toHaveBeenCalled()
    fill('Operation', 'link')
    fill('Node ID', 'r')
    fill('Next ID', 'p')
    click('Apply operation')
    expect(screen.getByText(/CYCLE: the path/)).toBeTruthy()
    fill('Next ID', 'None')
    click('Apply operation')
    fill('Operation', 'removeAfter')
    fill('Previous ID', 'p')
    click('Apply operation')
    fill('Operation', 'insertAfter')
    fill('Node ID', 'x')
    click('Apply operation')
    fill('Operation', 'visit')
    for (const id of ['p', 'x', 'r']) {
      fill('Node ID', id)
      click('Apply operation')
    }
    click('Check and complete forest')
    expect(done).toHaveBeenCalledOnce()
    expect(
      screen
        .getByRole('button', { name: 'Check and complete forest' })
        .hasAttribute('disabled'),
    ).toBe(true)
  })
  it('requires fresh empty-forest transfer after explaining head insertion', () => {
    const done = vi.fn()
    const d = linkedActivities[1]
    render(<LinkedTeachingActivity activity={d} onMastered={done} />)
    click('Start teaching')
    fill('Node ID', 'x')
    click('Apply operation')
    click('Check demonstration')
    fill('Rule to teach', d.ruleId)
    fill('Why this rule works', d.reasonId)
    click('Teach the rule')
    expect(
      screen.getByText(/I understand this correction; a fresh example/),
    ).toBeTruthy()
    expect(done).not.toHaveBeenCalled()
    click('Try a fresh example')
    fill('Node ID', 'k')
    click('Apply operation')
    click('Check fresh example')
    expect(done).toHaveBeenCalledWith(d.exerciseId)
    click('Replay from demonstration')
    expect(done).toHaveBeenCalledOnce()
  })
})
