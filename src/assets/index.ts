/** Logical-name → renderable-asset mapping for the Stack Ruins game.
 *
 * Every sprite-consuming component resolves its art through this module
 * instead of importing an image path directly. Real art lands as static
 * files under `public/assets/` (sourced from `picture/`, see
 * docs/picture_summary.md); swapping or re-exporting art later is a
 * one-line change here, never a component rewrite (SPEC §11.6).
 */

export type AssetKey =
  | 'stone-door-closed'
  | 'stone-door-open'
  | 'switch-inactive'
  | 'switch-active'
  | 'block-base'
  | 'block-moon'
  | 'block-sun'
  | 'block-star'
  | 'block-cracked'
  | 'sprite-idle'
  | 'sprite-guide'
  | 'sprite-thinking'
  | 'sprite-happy'
  | 'magic-stairs'
  | 'map-board'
  | 'node-entrance'
  | 'node-hall'
  | 'node-corridor'
  | 'node-dead-end'
  | 'node-exit'
  | 'badge-stack'
  | 'fx-sparkle'

export interface AssetDescriptor {
  /** Final image path once real art lands; `null` means "render the
   * placeholder" and is the expected value for every key today. */
  src: string | null
  /** Required regardless of placeholder/real state — accessibility text
   * must exist before the art does. */
  alt: string
}

export const ASSETS: Record<AssetKey, AssetDescriptor> = {
  'map-board': { src: null, alt: 'Blank stone map board' },
  'node-entrance': { src: null, alt: 'Maze entrance' },
  'node-hall': { src: null, alt: 'Forked hall' },
  'node-corridor': { src: null, alt: 'Connecting corridor' },
  'node-dead-end': { src: null, alt: 'Dead end' },
  'node-exit': { src: null, alt: 'Maze exit' },
  'badge-stack': { src: null, alt: 'Stack explorer badge' },
  'fx-sparkle': { src: null, alt: 'Celebration sparkle' },
  'stone-door-closed': {
    src: '/assets/stone-door-closed.png',
    alt: 'A closed stone ruins door',
  },
  'stone-door-open': {
    src: '/assets/stone-door-open.png',
    alt: 'An open stone ruins door',
  },
  'switch-inactive': {
    src: '/assets/switch-inactive.png',
    alt: 'An unlit ruins switch',
  },
  'switch-active': {
    src: '/assets/switch-active.png',
    alt: 'A glowing, activated ruins switch',
  },
  'block-base': {
    src: '/assets/block-base.png',
    alt: 'A plain carved stone block',
  },
  'block-moon': {
    src: '/assets/block-moon.png',
    alt: 'A stone block carved with a moon',
  },
  'block-sun': {
    src: '/assets/block-sun.png',
    alt: 'A stone block carved with a sun',
  },
  'block-star': {
    src: '/assets/block-star.png',
    alt: 'A stone block carved with a star',
  },
  'block-cracked': {
    src: '/assets/block-cracked.png',
    alt: 'A cracked stone block',
  },
  'sprite-idle': {
    src: '/assets/sprite-idle.png',
    alt: 'The guide sprite, resting',
  },
  'sprite-guide': {
    src: '/assets/sprite-guide.png',
    alt: 'The guide sprite, explaining',
  },
  'sprite-thinking': {
    src: '/assets/sprite-thinking.jpg',
    alt: 'The guide sprite, thinking',
  },
  'sprite-happy': {
    src: '/assets/sprite-happy.png',
    alt: 'The guide sprite, celebrating',
  },
  'magic-stairs': {
    src: '/assets/magic-stairs.png',
    alt: 'A glowing magic stairway',
  },
}
