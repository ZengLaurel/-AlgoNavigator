import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { ADVENTURE_PROGRESS_KEY } from './adventureProgress'

// GameStage only reports completion at the final room's exit. Test the
// application reward/storage boundary independently of Python and animations.
vi.mock('./components/game/GameStage', () => ({
  GameStage: ({ onComplete }: { onComplete: () => void }) => (
    <main>
      <h1>Stack Ruins</h1>
      <button onClick={onComplete}>Reach maze exit</button>
    </main>
  ),
}))
beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/#/stack')
})
afterEach(() => vi.restoreAllMocks())
async function returnToMap() {
  await act(async () => {
    window.history.replaceState(null, '', '/#/')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}
describe('world-map completion integration', () => {
  it('awards exactly one persistent gem on final completion, including repeated callbacks', async () => {
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Reach maze exit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reach maze exit' }))
    expect(JSON.parse(localStorage.getItem(ADVENTURE_PROGRESS_KEY)!)).toEqual({
      stackCompleted: true,
    })
    await returnToMap()
    expect(
      screen.getByLabelText('Adventure progress: 1 / 4 data gems'),
    ).toBeTruthy()
    view.unmount()
    render(<App />)
    expect(
      screen.getByLabelText('Adventure progress: 1 / 4 data gems'),
    ).toBeTruthy()
  })
  it('retains the earned gem for the session when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Reach maze exit' }))
    expect(screen.getByRole('alert').textContent).toContain(
      'cannot save your progress',
    )
    await returnToMap()
    expect(
      screen.getByLabelText('Adventure progress: 1 / 4 data gems'),
    ).toBeTruthy()
  })
})
