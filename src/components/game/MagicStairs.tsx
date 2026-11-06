import { AnimatePresence, motion } from 'framer-motion'
import { ASSETS } from '../../assets'

interface MagicStairsProps {
  visible: boolean
}

/** Fades the completion stairway in/out; fully unmounts when hidden rather
 * than hiding via CSS, per the asset manifest's "hidden = unmounted" note. */
export function MagicStairs({ visible }: MagicStairsProps) {
  const descriptor = ASSETS['magic-stairs']

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {descriptor.src ? (
            <img
              src={descriptor.src}
              alt={descriptor.alt}
              width={160}
              height={120}
            />
          ) : (
            <svg
              role="img"
              aria-label={descriptor.alt}
              width={160}
              height={120}
              viewBox="0 0 160 120"
            >
              {[0, 1, 2].map((step) => (
                <rect
                  key={step}
                  x={20 + step * 40}
                  y={100 - step * 30}
                  width={40}
                  height={20 + step * 30}
                  fill="#4dd0e1"
                  opacity={0.35 + step * 0.15}
                  rx={4}
                />
              ))}
            </svg>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
