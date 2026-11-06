export type RoomNodeType = 'entrance' | 'hall' | 'corridor' | 'deadEnd' | 'exit'
export interface RoomNode {
  id: string
  type: RoomNodeType
  connections: string[]
}
export interface PathState {
  nodes: Record<string, RoomNode>
  visited: Set<string>
  currentNodeId: string
  pathStack: string[]
}

/** Bounded construction: a branching tree, never rejection sampling. */
export function generateMaze(
  random: () => number = Math.random,
): Record<string, RoomNode> {
  const nodes: Record<string, RoomNode> = {}
  const add = (parent?: string) => {
    const id = `room-${Object.keys(nodes).length}`
    nodes[id] = { id, type: 'corridor', connections: parent ? [parent] : [] }
    if (parent) nodes[parent].connections.push(id)
    return id
  }
  const pick = (length: number) =>
    Math.min(length - 1, Math.max(0, Math.floor(random() * length) || 0))
  const entrance = add()
  const fork = add(entrance)
  add(fork)
  add(fork)
  for (let i = 0; i < 5; i++) {
    const parents = Object.keys(nodes).filter(
      (id) => id !== entrance && nodes[id].connections.length < 3,
    )
    add(parents[pick(parents.length)])
  }
  const leaves = Object.values(nodes).filter(
    (node) => node.connections.length === 1 && node.id !== entrance,
  )
  const exit = leaves[pick(leaves.length)].id
  for (const node of Object.values(nodes)) {
    node.type =
      node.id === entrance
        ? 'entrance'
        : node.id === exit
          ? 'exit'
          : node.connections.length === 1
            ? 'deadEnd'
            : node.connections.length > 2
              ? 'hall'
              : 'corridor'
  }
  return nodes
}
export function createPathState(nodes = generateMaze()): PathState {
  const entrance = Object.values(nodes).find((node) => node.type === 'entrance')
  if (!entrance) throw new Error('Maze needs an entrance')
  return {
    nodes,
    visited: new Set([entrance.id]),
    currentNodeId: entrance.id,
    pathStack: [entrance.id],
  }
}
export const isPathComplete = (state: PathState) =>
  state.nodes[state.currentNodeId].type === 'exit'
export function moveToRoom(state: PathState, target: string): PathState {
  if (
    isPathComplete(state) ||
    !state.nodes[state.currentNodeId].connections.includes(target)
  )
    return state
  const parent = state.pathStack.at(-2)
  if (target === parent) return backtrack(state)
  if (state.pathStack.includes(target)) return state
  return {
    ...state,
    currentNodeId: target,
    pathStack: [...state.pathStack, target],
    visited: new Set([...state.visited, target]),
  }
}
export function backtrack(state: PathState): PathState {
  if (isPathComplete(state) || state.pathStack.length <= 1) return state
  const pathStack = state.pathStack.slice(0, -1)
  return {
    ...state,
    currentNodeId: pathStack[pathStack.length - 1],
    pathStack,
    visited: new Set(state.visited),
  }
}
export function roomLabel(node: RoomNode): string {
  const names: Record<RoomNodeType, string> = {
    entrance: 'Entrance',
    hall: 'Fork',
    corridor: 'Corridor',
    deadEnd: 'Dead end',
    exit: 'Exit',
  }
  return `${names[node.type]} ${node.id.replace('room-', '')}`
}
