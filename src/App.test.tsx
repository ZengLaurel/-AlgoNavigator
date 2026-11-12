import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { trialOfStonesSteps } from './content/trialOfStonesSteps'
import { ADVENTURE_PROGRESS_KEY } from './adventureProgress'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
})
afterEach(() => vi.restoreAllMocks())

async function navigate(hash: string) {
  await act(async () => {
    window.history.pushState(null, '', hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

async function enterStack() {
  fireEvent.click(screen.getByRole('button', { name: 'Stack Ruins · Stack' }))
  await waitFor(() => {
    expect(
      screen.getByRole('heading', { name: 'Trial of Stones' }),
    ).toBeTruthy()
  })
}

function completeTrial() {
  for (const _step of trialOfStonesSteps) {
    fireEvent.click(screen.getByRole('button', { name: 'Step forward' }))
  }
}

describe('App', () => {
  it('opens Array from the map without requiring Stack completion', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Supply Camp · Array' }))
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Camp storage slots' }),
      ).toBeTruthy(),
    )
    expect(
      screen
        .getByRole('button', { name: '2 · Python' })
        .hasAttribute('disabled'),
    ).toBe(true)
    expect(
      screen
        .getByRole('button', { name: '4 · Teach Xiao Tuo' })
        .hasAttribute('disabled'),
    ).toBe(true)
  })
  it('opens Queue independently from the map with later rooms locked', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Harbor Pier · Queue' }))
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Harbor arrivals and departures' }),
      ).toBeTruthy(),
    )
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'Harbor Pier' }),
    )
    expect(
      screen
        .getByRole('button', { name: '2 · Python' })
        .hasAttribute('disabled'),
    ).toBe(true)
    expect(
      screen
        .getByRole('button', { name: '4 · Teach Xiao Tuo' })
        .hasAttribute('disabled'),
    ).toBe(true)
  })
  it('opens all four map regions with zero gems', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'World Adventure Map' }),
    ).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.queryAllByRole('article')).toHaveLength(0)
    expect(
      screen
        .getByRole('img', { name: /illustrated board-game world/i })
        .getAttribute('src'),
    ).toContain('world-map-bg.jpg')
    expect(
      screen.getByLabelText('Adventure progress: 0 / 4 data gems'),
    ).toBeTruthy()
    const dialog = screen.getByRole('dialog', { hidden: true })
    const showModal = vi.fn(() => dialog.setAttribute('open', ''))
    Object.defineProperty(dialog, 'showModal', { value: showModal })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(showModal).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Stack Ruins · Stack' }),
    ).toBeTruthy()
  })

  it('replaces the old labels with four named scroll buttons', () => {
    render(<App />)
    for (const title of [
      'Array of Campsites',
      'Linked Mistwood',
      'Queued Harbor',
    ]) {
      const scroll = screen.getByText(title)
      expect(scroll.closest('button')).toBeTruthy()
      expect(
        scroll.parentElement?.querySelector('img')?.getAttribute('src'),
      ).toContain('map-scroll.png')
    }
    expect(document.querySelector('.map-node-label')).toBeNull()
    expect(document.querySelectorAll('.map-scroll')).toHaveLength(4)
    for (const button of screen.getAllByRole('button')) {
      expect(button.querySelector('.map-node-artwork')).toBeNull()
      expect(button.classList.contains('map-scroll')).toBe(true)
      expect(button.querySelector('button')).toBeNull()
    }
  })

  it('opens the existing lesson from the Stack scroll', async () => {
    render(<App />)
    fireEvent.click(screen.getByText('Ruins of the Shadow Stack'))
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Trial of Stones' }),
      ).toBeTruthy()
    })
  })

  it('shows only scroll artwork at the existing scroll positions', () => {
    render(<App />)
    const landmarks = [
      { name: 'Supply Camp · Array', x: 21, y: 51 },
      { name: 'Misty Forest · Linked List', x: 50, y: 64 },
      { name: 'Stack Ruins · Stack', x: 73, y: 22 },
      { name: 'Harbor Pier · Queue', x: 77, y: 77 },
    ]
    for (const landmark of landmarks) {
      const button = screen.getByRole('button', { name: landmark.name })
      expect(button.querySelectorAll('img')).toHaveLength(1)
      expect(button.querySelector('img')?.getAttribute('src')).toContain(
        'map-scroll.png',
      )
      expect(button.style.left).toBe(`${landmark.x}%`)
      expect(button.style.top).toBe(`${landmark.y}%`)
    }
    expect(document.querySelector('.map-node-gem')).toBeNull()
    expect(document.querySelector('img[src*="map-nodes/"]')).toBeNull()
  })

  it('enters the existing Stack lesson without Python or a tutor connection', async () => {
    render(<App />)
    await enterStack()
    expect(screen.getByRole('heading', { name: 'Stack Ruins' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Trial of Stones' }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Step forward' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Ask the tutor' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Run' })).toBeNull()
    await navigate('#/')
    expect(
      screen.getByLabelText('Adventure progress: 0 / 4 data gems'),
    ).toBeTruthy()
  })

  it('does not award a module gem for finishing only the first room', async () => {
    render(<App />)
    await enterStack()
    completeTrial()
    expect(screen.getByRole('status').textContent).toContain(
      'Last In, First Out',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Replay the trial' }))
    expect(screen.getByText('Starting point')).toBeTruthy()
    await navigate('#/')
    expect(
      screen.getByLabelText('Adventure progress: 0 / 4 data gems'),
    ).toBeTruthy()
    expect(window.localStorage.getItem(ADVENTURE_PROGRESS_KEY)).toBeNull()
  })

  it('supports a direct Stack URL and returning to the map', async () => {
    window.history.replaceState(null, '', '/#/stack')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Stack Ruins' })).toBeTruthy()
    await navigate('#/')
    expect(
      screen.getByRole('heading', { name: 'World Adventure Map' }),
    ).toBeTruthy()
  })

  it('falls back to the map on unknown routes and ignores malformed progress', () => {
    window.history.replaceState(null, '', '/#/unknown')
    window.localStorage.setItem(ADVENTURE_PROGRESS_KEY, '{broken')
    render(<App />)
    expect(
      screen.getByLabelText('Adventure progress: 0 / 4 data gems'),
    ).toBeTruthy()
  })
})
