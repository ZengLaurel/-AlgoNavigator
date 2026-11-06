import type { StructureElement, StructureState } from './types'

type Glyph = NonNullable<StructureElement['glyph']>

/** Teaching feedback only; checkStairwayRepair remains the success authority.
 * Check shared positions before length so an incorrect prefix is never
 * described as merely missing or extra stones. */
export function getStairwayFeedback(
  finalState: StructureState | null,
  target: Glyph[],
): string {
  if (!finalState)
    return 'No stack result was returned. Create stack = MyStack(), add your stones, then Run again.'
  const glyphs = finalState.elements.map((element) => element.glyph ?? 'base')
  const wrongIndex = glyphs.findIndex(
    (glyph, index) => index < target.length && glyph !== target[index],
  )
  if (wrongIndex !== -1) {
    return `Stone ${wrongIndex + 1} from the bottom should be '${target[wrongIndex]}', but is '${glyphs[wrongIndex]}'. Change that push call, then Run again.`
  }
  if (glyphs.length < target.length) {
    const missing = target.slice(glyphs.length)
    const prefix =
      glyphs.length === 0
        ? 'Your stack is empty.'
        : 'Your stones so far match the target.'
    return `${prefix} Missing ${missing.length} ${missing.length === 1 ? 'stone' : 'stones'}: ${missing.join(' → ')}. Push ${missing.length === 1 ? 'it' : 'them'} in this order, then Run again.`
  }
  if (glyphs.length > target.length) {
    const extra = glyphs.length - target.length
    return `Your stack has ${extra} extra ${extra === 1 ? 'stone' : 'stones'} on top. Remove the extra push calls or use stack.pop() once per extra stone, then Run again.`
  }
  return 'Your stack matches the target exactly, bottom to top.'
}

/**
 * Stairway Repair's solution check (SPEC §11.5.2): the live stack must
 * match the target glyph pattern exactly, bottom to top. Deterministic and
 * hand-authored, consistent with SPEC §1's MVP decision to avoid AI
 * grading. A missing run (`null` state, e.g. before the first click of
 * Run, or after an error) never counts as a match.
 */
export function checkStairwayRepair(
  finalState: StructureState | null,
  target: Glyph[],
): boolean {
  if (!finalState) return false
  const glyphs = finalState.elements.map((element) => element.glyph ?? 'base')
  if (glyphs.length !== target.length) return false
  return glyphs.every((glyph, index) => glyph === target[index])
}
