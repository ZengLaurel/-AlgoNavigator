import { motion } from 'framer-motion'
import { ASSETS } from '../../assets'
import { computePathLayout } from '../../engine/path/pathLayout'
import { roomLabel, type PathState } from '../../engine/path/pathState'
import { PathRoomIcon } from './PathRoomIcon'

export function ForkedPathMap({
  state,
  moving,
  reducedMotion,
  onMove,
  onMoveEnd,
}: {
  state: PathState
  moving: boolean
  reducedMotion: boolean
  onMove: (id: string) => void
  onMoveEnd: () => void
}) {
  const { positions, edges, width, height } = computePathLayout(state.nodes)
  const current = positions[state.currentNodeId]
  const board = ASSETS['map-board']
  return (
    <svg
      className="forked-map"
      role="group"
      aria-label="Forked Path map"
      viewBox={`0 0 ${width} ${height}`}
    >
      {board.src ? (
        <image href={board.src} width={width} height={height} />
      ) : (
        <rect width={width} height={height} rx={16} fill="#172033" />
      )}
      {edges.map(([from, to]) => {
        const active =
          state.pathStack.includes(from) && state.pathStack.includes(to)
        return (
          <line
            key={`${from}-${to}`}
            data-path-edge="true"
            x1={positions[from].x}
            y1={positions[from].y}
            x2={positions[to].x}
            y2={positions[to].y}
            stroke={active ? '#facc15' : '#94a3b8'}
            strokeWidth={active ? 5 : 2}
          />
        )
      })}
      {Object.values(state.nodes).map((node) => {
        const adjacent = state.nodes[state.currentNodeId].connections.includes(
          node.id,
        )
        const disabled =
          moving ||
          state.nodes[state.currentNodeId].type === 'exit' ||
          !adjacent
        const label = `${roomLabel(node)}${node.id === state.currentNodeId ? ', current' : ''}${state.visited.has(node.id) ? ', explored' : ', unexplored'}`
        return (
          <g
            key={node.id}
            data-room-node={node.id}
            transform={`translate(${positions[node.id].x},${positions[node.id].y})`}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-disabled={disabled}
            onClick={() => {
              if (!disabled) onMove(node.id)
            }}
            onKeyDown={(event) => {
              if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault()
                onMove(node.id)
              }
            }}
          >
            <title>{label}</title>
            <PathRoomIcon type={node.type} />
            <text textAnchor="middle" y={42} fill="#f1f5f9" fontSize={12}>
              {roomLabel(node)}
              {state.visited.has(node.id) ? ' ✓' : ''}
            </text>
          </g>
        )
      })}
      <motion.circle
        aria-hidden="true"
        className="path-marker"
        r={8}
        fill="#facc15"
        stroke="#172033"
        strokeWidth={2}
        initial={false}
        animate={{ cx: current.x, cy: current.y - 28 }}
        transition={{
          type: 'tween',
          duration: reducedMotion ? 0 : 0.35,
          ease: 'linear',
        }}
        onAnimationComplete={onMoveEnd}
      />
    </svg>
  )
}
