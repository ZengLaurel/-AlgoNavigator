import { motion, useReducedMotion } from 'framer-motion'
import { ASSETS } from '../../assets'

export type SpritePose = 'idle' | 'guide' | 'thinking' | 'happy'

export function Sprite({ pose }: { pose: SpritePose }) {
  const descriptor = ASSETS[`sprite-${pose}`]
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className="ruins-sprite"
      data-pose={pose}
      animate={{ y: reducedMotion ? 0 : [0, -6, 0] }}
      transition={{
        duration: reducedMotion ? 0 : 2.4,
        repeat: reducedMotion ? 0 : Infinity,
        ease: 'easeInOut',
      }}
    >
      {descriptor.src ? (
        <img src={descriptor.src} alt={descriptor.alt} width={96} height={96} />
      ) : (
        <svg
          role="img"
          aria-label={descriptor.alt}
          width={96}
          height={96}
          viewBox="0 0 96 96"
        >
          <ellipse
            cx={20}
            cy={50}
            rx={14}
            ry={22}
            fill="#c6f2ed"
            opacity={0.6}
            transform="rotate(-28 20 50)"
          />
          <ellipse
            cx={76}
            cy={50}
            rx={14}
            ry={22}
            fill="#c6f2ed"
            opacity={0.6}
            transform="rotate(28 76 50)"
          />
          <path
            d="M48 10 C30 27 20 43 20 59 C20 91 76 91 76 59 C76 43 66 27 48 10Z"
            fill="#65d6c1"
          />
          <ellipse cx={48} cy={53} rx={21} ry={18} fill="#fff0d4" />
          {pose === 'happy' ? (
            <path
              d="M34 50 Q39 44 44 50 M52 50 Q57 44 62 50 M40 59 Q48 71 56 59"
              fill="none"
              stroke="#243047"
              strokeWidth={3}
              strokeLinecap="round"
            />
          ) : (
            <g fill="#243047">
              <circle cx={40} cy={50} r={3} />
              <circle cx={56} cy={50} r={3} />
              <path
                d={
                  pose === 'thinking'
                    ? 'M44 63 Q48 59 52 63'
                    : 'M41 59 Q48 65 55 59'
                }
                fill="none"
                stroke="#243047"
                strokeWidth={2}
              />
            </g>
          )}
          <path d="M48 72 L54 78 L48 84 L42 78Z" fill="#f2c265" />
          {pose === 'guide' && (
            <path
              d="M70 63 L88 52 M83 51 L89 52 L86 58"
              fill="none"
              stroke="#65d6c1"
              strokeWidth={5}
              strokeLinecap="round"
            />
          )}
        </svg>
      )}
    </motion.div>
  )
}
