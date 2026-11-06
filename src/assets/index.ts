/** Logical-name → renderable-asset mapping for the Stack Ruins game.
 *
 * Every sprite-consuming component resolves its art through this module
 * instead of importing an image path directly. Today every entry's `src`
 * is `null`, so components render a placeholder SVG at the manifest's
 * exact final dimensions; swapping in real art later (docs/picture_summary.md)
 * is a one-line change here, never a component rewrite (SPEC §11.6).
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

export interface AssetDescriptor {
  /** Final image path once real art lands; `null` means "render the
   * placeholder" and is the expected value for every key today. */
  src: string | null
  /** Required regardless of placeholder/real state — accessibility text
   * must exist before the art does. */
  alt: string
}

export const ASSETS: Record<AssetKey, AssetDescriptor> = {
  'stone-door-closed': { src: null, alt: 'A closed stone ruins door' },
  'stone-door-open': { src: null, alt: 'An open stone ruins door' },
  'switch-inactive': { src: null, alt: 'An unlit ruins switch' },
  'switch-active': { src: null, alt: 'A glowing, activated ruins switch' },
  'block-base': { src: null, alt: 'A plain carved stone block' },
  'block-moon': { src: null, alt: 'A stone block carved with a moon' },
  'block-sun': { src: null, alt: 'A stone block carved with a sun' },
  'block-star': { src: null, alt: 'A stone block carved with a star' },
  'block-cracked': { src: null, alt: 'A cracked stone block' },
  'sprite-idle': { src: null, alt: 'The guide sprite, resting' },
  'sprite-guide': { src: null, alt: 'The guide sprite, explaining' },
  'sprite-thinking': { src: null, alt: 'The guide sprite, thinking' },
  'sprite-happy': { src: null, alt: 'The guide sprite, celebrating' },
  'magic-stairs': { src: null, alt: 'A glowing magic stairway' },
}
