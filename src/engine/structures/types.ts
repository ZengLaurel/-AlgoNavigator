// Generic data model the animation engine renders. Every data-structure
// renderer (Stack, and later Array/LinkedList/Queue) consumes this same
// shape — the renderer doesn't know whether it came from a scripted lesson
// step or from live Pyodide output (see SPECIFICATION.md §5).

export interface StructureElement {
  id: string
  value: number | string
  highlighted?: boolean
  /** Stack Ruins game only (SPEC §11.4): which carved-stone glyph to render
   * for this element. Optional and ignored by the plain-number renderer. */
  glyph?: 'base' | 'moon' | 'sun' | 'star' | 'cracked'
}

export interface StructureState {
  elements: StructureElement[]
  pointers?: Record<string, string>
}

export interface AnimationStep {
  operation: string
  description: string
  beforeState: StructureState
  afterState: StructureState
}
