import { AnimatePresence, motion } from 'framer-motion'
import { CELL_SIZE, computeStackLayout } from '../engine/structures/stackLayout'
import type { StructureState } from '../engine/structures/types'

interface StackRendererProps {
  state: StructureState
  /** Reserve vertical space for this many slots so the column doesn't
   * reflow as the stack grows/shrinks during playback. */
  slotCount?: number
}

const CELL_WIDTH = 96

export function StackRenderer({ state, slotCount }: StackRendererProps) {
  const positions = computeStackLayout(state, slotCount)
  const viewHeight =
    (slotCount ?? Math.max(state.elements.length, 1)) * (CELL_SIZE + 8)

  return (
    <svg
      role="img"
      aria-label="Stack visualization"
      viewBox={`0 0 ${CELL_WIDTH} ${viewHeight}`}
      width={CELL_WIDTH}
      height={viewHeight}
    >
      <AnimatePresence>
        {positions.map((element) => (
          <motion.g
            key={element.id}
            initial={{ opacity: 0, x: 0, y: element.y }}
            animate={{ opacity: 1, x: 0, y: element.y }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <rect
              width={CELL_WIDTH - 8}
              height={CELL_SIZE}
              rx={8}
              fill={element.highlighted ? '#aa3bff' : '#e5e4e7'}
              stroke="#6b6375"
            />
            <text
              x={(CELL_WIDTH - 8) / 2}
              y={CELL_SIZE / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={20}
              fill={element.highlighted ? '#fff' : '#08060d'}
            >
              {element.value}
            </text>
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  )
}
