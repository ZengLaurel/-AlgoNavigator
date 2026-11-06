import { ASSETS } from '../../assets'

interface RuinsSwitchProps {
  active: boolean
}

/** Pure state → asset mapping: lit/unlit ruins switch, no business logic. */
export function RuinsSwitch({ active }: RuinsSwitchProps) {
  const descriptor = ASSETS[active ? 'switch-active' : 'switch-inactive']

  if (descriptor.src) {
    return (
      <img src={descriptor.src} alt={descriptor.alt} width={48} height={48} />
    )
  }

  return (
    <svg
      role="img"
      aria-label={descriptor.alt}
      data-active={active}
      width={48}
      height={48}
      viewBox="0 0 48 48"
    >
      <circle cx={24} cy={24} r={20} fill="#3b4a63" />
      <circle
        cx={24}
        cy={24}
        r={10}
        fill={active ? '#f2c265' : '#4dd0e1'}
        opacity={active ? 1 : 0.4}
      />
      {active && (
        <circle
          cx={24}
          cy={24}
          r={16}
          fill="none"
          stroke="#f2c265"
          strokeWidth={2}
          opacity={0.5}
        />
      )}
    </svg>
  )
}
