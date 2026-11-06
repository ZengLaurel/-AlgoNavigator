import type { RoomNode } from './pathState'

/** Rooted tree layout depends on topology alone, not exploration state. */
export function computePathLayout(nodes: Record<string, RoomNode>) {
  const positions: Record<string, { x: number; y: number }> = {}
  const edges: [string, string][] = []
  let leaf = 0
  let maxDepth = 0
  const visit = (
    id: string,
    parent: string | undefined,
    depth: number,
  ): number => {
    maxDepth = Math.max(maxDepth, depth)
    const children = nodes[id].connections.filter((next) => next !== parent)
    const xs = children.map((child) => {
      edges.push([id, child])
      return visit(child, id, depth + 1)
    })
    const x = xs.length
      ? xs.reduce((sum, next) => sum + next, 0) / xs.length
      : 60 + leaf++ * 120
    positions[id] = { x, y: 60 + depth * 100 }
    return x
  }
  const entrance = Object.values(nodes).find((node) => node.type === 'entrance')
  if (entrance) visit(entrance.id, undefined, 0)
  return {
    positions,
    edges,
    width: Math.max(240, leaf * 120),
    height: 120 + maxDepth * 100,
  }
}
