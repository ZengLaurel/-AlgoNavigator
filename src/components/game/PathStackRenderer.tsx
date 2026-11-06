import { computeStackLayout } from '../../engine/structures/stackLayout'
import { roomLabel, type PathState } from '../../engine/path/pathState'
import { PathRoomIcon } from './PathRoomIcon'

export function PathStackRenderer({ state }: { state: PathState }) {
  const positions = computeStackLayout(
    {
      elements: state.pathStack.map((id) => ({
        id,
        value: roomLabel(state.nodes[id]),
      })),
    },
    Object.keys(state.nodes).length,
  )
  return (
    <svg
      role="img"
      aria-label={`Path stack bottom to top: ${positions.map((item) => item.value).join(', ')}. Top: ${roomLabel(state.nodes[state.currentNodeId])}`}
      viewBox={`0 0 240 ${Object.keys(state.nodes).length * 64 + 16}`}
      className="path-stack"
    >
      {positions.map((item, index) => (
        <g
          key={item.id}
          data-stack-room={item.id}
          transform={`translate(30,${item.y + 28})`}
        >
          <PathRoomIcon type={state.nodes[item.id].type} />
          <text x={32} y={4} fill="currentColor" fontSize={12}>
            {item.value}
            {index === positions.length - 1 ? ' ← Top' : ''}
          </text>
        </g>
      ))}
    </svg>
  )
}
