import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CELL_SIZE,
  computeStackLayout,
} from '../../engine/structures/stackLayout'
import type { StructureState } from '../../engine/structures/types'
import { StoneBlock } from './StoneBlock'

interface StoneStackRendererProps {
  state: StructureState
  slotCount?: number
}

const STONE_WIDTH = CELL_SIZE * 2
const LEFT = 8
const TOP = 28

export function StoneStackRenderer({
  state,
  slotCount,
}: StoneStackRendererProps) {
  const reducedMotion = useReducedMotion()
  const slots = Math.max(slotCount ?? 1, state.elements.length, 1)
  const positions = computeStackLayout(state, slots)
  const topY = positions.length
    ? TOP + (positions[positions.length - 1].y * CELL_SIZE) / (CELL_SIZE + 8)
    : null

  return (
    <svg
      role="img"
      aria-label="Stone stack"
      viewBox={`0 0 210 ${TOP + slots * CELL_SIZE + 8}`}
      width={210}
      height={TOP + slots * CELL_SIZE + 8}
    >
      <AnimatePresence>
        {positions.map((element, index) => {
          // Compress the legacy layout's gaps without changing its shared math.
          const y = TOP + (element.y * CELL_SIZE) / (CELL_SIZE + 8)
          return (
            <motion.g
              key={element.id}
              data-stone-id={element.id}
              initial={{
                opacity: 0,
                x: LEFT,
                y: reducedMotion ? y : -CELL_SIZE,
              }}
              animate={{ opacity: 1, x: LEFT, y }}
              exit={{ opacity: 0, y: reducedMotion ? y : y + CELL_SIZE }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 260, damping: 26 }
              }
            >
              <StoneBlock
                glyph={state.elements[index].glyph}
                width={STONE_WIDTH}
                height={CELL_SIZE}
                highlighted={element.highlighted}
              />
            </motion.g>
          )
        })}
      </AnimatePresence>
      {topY !== null ? (
        <g
          transform={`translate(${LEFT + STONE_WIDTH + 8}, ${topY + CELL_SIZE / 2})`}
        >
          <path d="M 0 0 L 10 -6 L 10 6 Z" fill="#f2c265" />
          <text x={16} y={5} fill="#f5ead8" fontSize={14}>
            Top
          </text>
        </g>
      ) : (
        <text
          x={LEFT + STONE_WIDTH / 2}
          y={TOP + slots * CELL_SIZE - 16}
          textAnchor="middle"
          fill="#d7dfeb"
          fontSize={14}
        >
          Empty stack
        </text>
      )}
    </svg>
  )
}
