import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { trialOfStonesSteps } from './content/trialOfStonesSteps'

describe('App', () => {
  it('opens Stack Ruins without requiring Python or a tutor connection', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Stack Ruins' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Trial of Stones' }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Step forward' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Ask the tutor' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Run' })).toBeNull()
  })

  it('lets the learner finish and replay the first room from the application', () => {
    render(<App />)
    for (const _step of trialOfStonesSteps) {
      fireEvent.click(screen.getByRole('button', { name: 'Step forward' }))
    }
    expect(screen.getByRole('status').textContent).toContain(
      'Last In, First Out',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Replay the trial' }))
    expect(screen.getByText('Starting point')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })
})
