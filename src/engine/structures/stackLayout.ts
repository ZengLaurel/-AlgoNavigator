import { scaleBand } from 'd3-scale'
import type { StructureState } from './types'

export interface PositionedElement {
  id: string
  value: number | string
  highlighted: boolean
  x: number
  y: number
}

const CELL_SIZE = 56
const CELL_GAP = 8
const STEP = CELL_SIZE + CELL_GAP

/**
 * Lays out stack elements as a vertical column: index 0 (bottom of stack)
 * at the largest y, the last element (top of stack) at the smallest y.
 * `slotCount` reserves vertical space for slots the stack doesn't
 * currently occupy, so the stack doesn't jump around as it grows/shrinks.
 */
export function computeStackLayout(
  state: StructureState,
  slotCount = Math.max(state.elements.length, 1),
): PositionedElement[] {
  const scale = scaleBand<number>()
    .domain(Array.from({ length: slotCount }, (_, i) => i))
    .range([slotCount * STEP, 0])

  return state.elements.map((element, index) => ({
    id: element.id,
    value: element.value,
    highlighted: element.highlighted ?? false,
    x: 0,
    y: scale(index) ?? 0,
  }))
}

export { CELL_SIZE }
