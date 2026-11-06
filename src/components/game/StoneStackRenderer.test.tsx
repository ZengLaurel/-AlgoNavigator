import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StoneStackRenderer } from './StoneStackRenderer'
import type { StructureState } from '../../engine/structures/types'

const state: StructureState = {
  elements: [
    { id: 'a', value: 'base', glyph: 'base' },
    { id: 'b', value: 'moon', glyph: 'moon' },
    { id: 'c', value: 'star', glyph: 'star', highlighted: true },
  ],
}

describe('StoneStackRenderer', () => {
  it('renders stones in bottom-to-top data order with distinct glyphs', () => {
    const { container } = render(
      <StoneStackRenderer state={state} slotCount={3} />,
    )

    expect(
      Array.from(container.querySelectorAll('[data-glyph]')).map((element) =>
        element.getAttribute('data-glyph'),
      ),
    ).toEqual(['base', 'moon', 'star'])
    expect(
      screen.getByLabelText('A stone block carved with a moon'),
    ).toBeTruthy()
    expect(screen.getByText('Top')).toBeTruthy()
  })

  it('uses 2:1 stones and highlights peek without removing a stone', () => {
    const { container } = render(<StoneStackRenderer state={state} />)
    const stones = container.querySelectorAll('[data-glyph] > rect:first-child')
    expect(stones).toHaveLength(3)
    expect(Number(stones[0].getAttribute('width'))).toBe(
      2 * Number(stones[0].getAttribute('height')),
    )
    expect(stones[2].getAttribute('fill')).not.toBe(
      stones[0].getAttribute('fill'),
    )
  })

  it('shows an empty state without a top marker', () => {
    render(<StoneStackRenderer state={{ elements: [] }} />)
    expect(screen.getByText('Empty stack')).toBeTruthy()
    expect(screen.queryByText('Top')).toBeNull()
  })

  it('removes popped stones after their exit transition', async () => {
    const { rerender } = render(
      <StoneStackRenderer state={state} slotCount={3} />,
    )
    rerender(
      <StoneStackRenderer
        state={{ elements: state.elements.slice(0, 2) }}
        slotCount={3}
      />,
    )
    await waitFor(() => {
      expect(
        screen.queryByLabelText('A stone block carved with a star'),
      ).toBeNull()
    })
    expect(
      screen.getByLabelText('A stone block carved with a moon'),
    ).toBeTruthy()
  })
})
