import { ASSETS } from '../../assets'
import type { StructureElement } from '../../engine/structures/types'

interface StoneBlockProps {
  glyph: StructureElement['glyph']
  width: number
  height: number
  highlighted: boolean
}

const PALETTE = {
  stone: '#b8a998',
  stoneHighlighted: '#4dd0e1',
  mark: '#3b4a63',
  markHighlighted: '#1a2438',
} as const

/** Maps a glyph to a small placeholder mark drawn in local stone-space
 * (origin top-left, size = stone width/height). Swapped for a real sprite
 * image once `ASSETS['block-<glyph>'].src` is non-null — see src/assets. */
function GlyphMark({
  glyph,
  width,
  height,
  color,
}: {
  glyph: NonNullable<StoneBlockProps['glyph']>
  width: number
  height: number
  color: string
}) {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) * 0.28

  switch (glyph) {
    case 'moon':
      return (
        <path
          d={`M ${cx + r * 0.4} ${cy - r} A ${r} ${r} 0 1 0 ${cx + r * 0.4} ${cy + r} A ${r * 0.7} ${r * 0.7} 0 1 1 ${cx + r * 0.4} ${cy - r} Z`}
          fill={color}
        />
      )
    case 'sun':
      return (
        <g stroke={color} strokeWidth={2} fill="none">
          <circle cx={cx} cy={cy} r={r * 0.55} fill={color} stroke="none" />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (Math.PI / 4) * i
            const x1 = cx + Math.cos(angle) * r * 0.75
            const y1 = cy + Math.sin(angle) * r * 0.75
            const x2 = cx + Math.cos(angle) * r * 1.15
            const y2 = cy + Math.sin(angle) * r * 1.15
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </g>
      )
    case 'star': {
      const points = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const radius = i % 2 === 0 ? r : r * 0.45
        return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`
      }).join(' ')
      return <polygon points={points} fill={color} />
    }
    case 'cracked':
      return (
        <path
          d={`M ${cx - r} ${cy - r} L ${cx - r * 0.2} ${cy - r * 0.1} L ${cx + r * 0.3} ${cy - r * 0.5} L ${cx} ${cy + r * 0.2} L ${cx + r} ${cy + r}`}
          stroke={color}
          strokeWidth={3}
          fill="none"
        />
      )
    case 'base':
    default:
      return (
        <rect
          x={cx - r * 0.6}
          y={cy - r * 0.6}
          width={r * 1.2}
          height={r * 1.2}
          rx={4}
          fill={color}
        />
      )
  }
}

/** Renders a single stacked stone. Reads `ASSETS['block-<glyph>']` for its
 * alt text today, and will read `.src` once real art lands (SPEC §11.6) —
 * the placeholder-vs-real branch point lives entirely in this component so
 * `StoneStackRenderer` never needs to change. */
export function StoneBlock({
  glyph,
  width,
  height,
  highlighted,
}: StoneBlockProps) {
  const resolvedGlyph = glyph ?? 'base'
  const assetKey = `block-${resolvedGlyph}` as const
  const descriptor = ASSETS[assetKey]
  const stoneColor = highlighted ? PALETTE.stoneHighlighted : PALETTE.stone
  const markColor = highlighted ? PALETTE.markHighlighted : PALETTE.mark

  if (descriptor.src) {
    return (
      <g data-glyph={resolvedGlyph} data-highlighted={highlighted}>
        {highlighted && (
          <rect
            x={-4}
            y={-4}
            width={width + 8}
            height={height + 8}
            rx={14}
            fill="none"
            stroke={PALETTE.stoneHighlighted}
            strokeWidth={3}
          />
        )}
        <image
          href={descriptor.src}
          width={width}
          height={height}
          aria-label={descriptor.alt}
        />
      </g>
    )
  }

  return (
    <g role="img" aria-label={descriptor.alt} data-glyph={resolvedGlyph}>
      <rect
        width={width}
        height={height}
        rx={10}
        fill={stoneColor}
        stroke="#6b5f52"
      />
      <GlyphMark
        glyph={resolvedGlyph}
        width={width}
        height={height}
        color={markColor}
      />
    </g>
  )
}
