import { ASSETS, type AssetKey } from '../../assets'
import type { RoomNodeType } from '../../engine/path/pathState'

const keys: Record<RoomNodeType, AssetKey> = {
  entrance: 'node-entrance',
  hall: 'node-hall',
  corridor: 'node-corridor',
  deadEnd: 'node-dead-end',
  exit: 'node-exit',
}
const symbols: Record<RoomNodeType, string> = {
  entrance: 'IN',
  hall: 'Y',
  corridor: '↔',
  deadEnd: '×',
  exit: 'OUT',
}
/** Local 48×48 node placeholders; never mix room semantics into glyph stones. */
export function PathRoomIcon({ type }: { type: RoomNodeType }) {
  const asset = ASSETS[keys[type]]
  return asset.src ? (
    <image href={asset.src} x={-24} y={-24} width={48} height={48} />
  ) : (
    <g aria-hidden="true">
      <rect
        x={-24}
        y={-24}
        width={48}
        height={48}
        rx={10}
        fill="#334155"
        stroke="currentColor"
      />
      <text textAnchor="middle" y={5} fill="currentColor" fontSize={12}>
        {symbols[type]}
      </text>
    </g>
  )
}
