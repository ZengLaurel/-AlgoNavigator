import type { MapNode } from '../../config/mapNodes'
import scrollImage from '../../assets/images/map-scroll.png'

export interface GemNodeButtonProps {
  node: MapNode
  label: string
  onLockedClick: () => void
}

export function GemNodeButton({
  node,
  label,
  onLockedClick,
}: GemNodeButtonProps) {
  const route = node.isImplemented ? node.route : null

  function handleClick() {
    if (!route) {
      onLockedClick()
      return
    }
    const hash = route.indexOf('#')
    if (hash !== -1) window.location.assign(route.slice(hash))
  }

  return (
    <button
      type="button"
      className={`map-scroll map-scroll-${node.type}`}
      style={{
        left: `${node.scrollPosition.x}%`,
        top: `${node.scrollPosition.y}%`,
      }}
      aria-label={`${node.name} · ${label}`}
      aria-haspopup={route ? undefined : 'dialog'}
      onClick={handleClick}
    >
      <img src={scrollImage} alt="" draggable={false} />
      <span>{node.scrollTitle}</span>
    </button>
  )
}
