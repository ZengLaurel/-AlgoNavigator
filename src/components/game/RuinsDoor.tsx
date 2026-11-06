import { AnimatePresence, motion } from 'framer-motion'
import { ASSETS } from '../../assets'

interface RuinsDoorProps {
  opened: boolean
}

/** Cross-fades between closed/open door art at a fixed anchor — the door
 * never shifts position when its state changes (per the asset manifest's
 * "anchors aligned" requirement). */
export function RuinsDoor({ opened }: RuinsDoorProps) {
  const descriptor = ASSETS[opened ? 'stone-door-open' : 'stone-door-closed']

  return (
    <div style={{ position: 'relative', width: 96, height: 128 }}>
      <AnimatePresence>
        {descriptor.src ? (
          <motion.img
            key={opened ? 'open' : 'closed'}
            src={descriptor.src}
            alt={descriptor.alt}
            style={{ position: 'absolute', inset: 0, width: 96, height: 128 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        ) : (
          <motion.svg
            key={opened ? 'open' : 'closed'}
            role="img"
            aria-label={descriptor.alt}
            data-opened={opened}
            width={96}
            height={128}
            viewBox="0 0 96 128"
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <rect x={4} y={4} width={88} height={120} rx={12} fill="#3b4a63" />
            {opened ? (
              <rect
                x={20}
                y={16}
                width={56}
                height={96}
                rx={8}
                fill="#f2c265"
                opacity={0.5}
              />
            ) : (
              <line
                x1={48}
                y1={16}
                x2={48}
                y2={112}
                stroke="#1a2438"
                strokeWidth={3}
              />
            )}
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  )
}
