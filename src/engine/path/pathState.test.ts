import { describe, expect, it } from 'vitest'
import {
  backtrack,
  createPathState,
  generateMaze,
  isPathComplete,
  moveToRoom,
} from './pathState'

export function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}
describe('pathState', () => {
  it('generates connected bidirectional branching trees with one entrance, exit and non-exit dead ends for 100 seeds', () => {
    for (let seed = 0; seed < 100; seed++) {
      const nodes = generateMaze(seeded(seed))
      const list = Object.values(nodes)
      expect(list.filter((n) => n.type === 'entrance')).toHaveLength(1)
      expect(list.filter((n) => n.type === 'exit')).toHaveLength(1)
      expect(list.some((n) => n.type === 'deadEnd')).toBe(true)
      expect(list.some((n) => n.type === 'hall')).toBe(true)
      const seen = new Set<string>()
      const visit = (id: string) => {
        if (seen.has(id)) return
        seen.add(id)
        nodes[id].connections.forEach(visit)
      }
      visit(list[0].id)
      expect(seen.size).toBe(list.length)
      expect(list.reduce((sum, node) => sum + node.connections.length, 0)).toBe(
        2 * (list.length - 1),
      )
      for (const node of list) {
        expect(new Set(node.connections).size).toBe(node.connections.length)
        for (const neighbor of node.connections)
          expect(nodes[neighbor].connections).toContain(node.id)
      }
    }
  })
  it('protects entrance, rejects illegal moves, immutably pushes, pops and revisits explored branches', () => {
    const initial = createPathState(generateMaze(seeded(3)))
    expect(backtrack(initial)).toBe(initial)
    expect(moveToRoom(initial, 'missing')).toBe(initial)
    const child = initial.nodes[initial.currentNodeId].connections[0]
    const pushed = moveToRoom(initial, child)
    const popped = moveToRoom(pushed, initial.currentNodeId)
    expect(initial.pathStack).toHaveLength(1)
    expect(initial.visited.size).toBe(1)
    expect(pushed.pathStack).toEqual([initial.currentNodeId, child])
    expect(popped.pathStack).toEqual(initial.pathStack)
    expect(popped.visited.has(child)).toBe(true)
    expect(moveToRoom(popped, child).pathStack).toEqual(pushed.pathStack)
    expect(popped.visited).not.toBe(pushed.visited)
  })
  it('solves each generated map by graph traversal and freezes at exit', () => {
    for (let seed = 0; seed < 20; seed++) {
      let state = createPathState(generateMaze(seeded(seed)))
      const route = (id: string, parent?: string): string[] | undefined => {
        if (state.nodes[id].type === 'exit') return [id]
        for (const next of state.nodes[id].connections.filter(
          (n) => n !== parent,
        )) {
          const found = route(next, id)
          if (found) return [id, ...found]
        }
      }
      for (const id of route(state.currentNodeId)!.slice(1))
        state = moveToRoom(state, id)
      expect(isPathComplete(state)).toBe(true)
      expect(backtrack(state)).toBe(state)
      expect(moveToRoom(state, state.pathStack.at(-2)!)).toBe(state)
    }
  })
})
