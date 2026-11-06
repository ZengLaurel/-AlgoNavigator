import { describe, expect, it } from 'vitest'
import { computePathLayout } from './pathLayout'
import { createPathState, generateMaze, moveToRoom } from './pathState'

describe('pathLayout', () => {
  it('has stable finite non-overlapping coordinates and unique edges independent of movement', () => {
    const state = createPathState(generateMaze(() => 0.4))
    const layout = computePathLayout(state.nodes)
    expect(computePathLayout(state.nodes)).toEqual(layout)
    expect(
      new Set(Object.values(layout.positions).map((p) => `${p.x},${p.y}`)).size,
    ).toBe(Object.keys(state.nodes).length)
    for (const p of Object.values(layout.positions)) {
      expect(Number.isFinite(p.x + p.y)).toBe(true)
      expect(p.x).toBeLessThan(layout.width)
      expect(p.y).toBeLessThan(layout.height)
    }
    expect(layout.edges).toHaveLength(Object.keys(state.nodes).length - 1)
    expect(new Set(layout.edges.map((e) => [...e].sort().join(':'))).size).toBe(
      layout.edges.length,
    )
    const next = moveToRoom(
      state,
      state.nodes[state.currentNodeId].connections[0],
    )
    expect(computePathLayout(next.nodes)).toEqual(layout)
  })
})
