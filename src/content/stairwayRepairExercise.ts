import type { StructureElement } from '../engine/structures/types'

type Glyph = NonNullable<StructureElement['glyph']>

/**
 * Stairway Repair (SPEC §11.5.2): the student edits Python to push stones
 * in the order shown here, bottom to top. `MyStack.push` now accepts an
 * optional glyph (see pythonHarness.ts) so the live stack can be compared
 * against this exact pattern.
 */
export const targetPattern: Glyph[] = ['base', 'moon', 'star']

export const instructions =
  "MyStack is already provided. push(number, 'glyph') places a stone on top; the number is its value and the quoted glyph selects its pattern. Each Run executes your whole program from the beginning with a fresh stack and shows its final result, not a line-by-line animation. Edit your code, then Run again."

export const buildSteps = [
  {
    code: 'stack = MyStack()',
    text: 'MyStack() makes a new, empty tower. The name stack lets your next lines use that same tower. There are no stones yet.',
  },
  {
    code: "stack.push(1, 'base')",
    text: "push puts one stone on top. Here 1 is the stored number (the value); 'base' is the quoted pattern name (the glyph). The tower was empty; now base is both the bottom and the top.",
  },
  {
    code: "stack.push(2, 'moon')",
    text: 'Put the moon stone on top of base. Bottom to top: base → moon. The new top holds the number 2; base stays below it.',
  },
  {
    code: "stack.push(3, 'star')",
    text: 'Put the star stone on top of moon. Bottom to top: base → moon → star. The new top holds the number 3. This is the target tower.',
  },
]

export const functionExamples = [
  {
    name: 'push — put a stone on top',
    code: "stack.push(3, 'star')",
    text: 'Starting with base → moon, this adds star: base → moon → star. The number 3 is its value, not its picture. The quoted word chooses the picture.',
  },
  {
    name: 'pop — take the top stone away',
    code: 'taken = stack.pop()',
    text: 'Starting with base → moon → star, pop removes star. Now the tower is base → moon, with moon on top. It also returns the number 3, which taken remembers — not the word star.',
  },
  {
    name: 'peek — look without taking',
    code: 'seen = stack.peek()',
    text: 'Starting with base → moon → star, peek returns the number 3, which seen remembers. Star stays on top. The tower is still base → moon → star.',
  },
]

export const hints = [
  {
    text: 'The starter places only the base stone. Two stones are still missing above it: moon, then star.',
  },
  {
    text: "Keep the base push. Add two push calls after it: first the 'moon' glyph, then 'star'. Use a number as the first argument and the quoted glyph as the second; the last stone pushed becomes the top.",
  },
  {
    text: 'Add these two lines below the base push, then press Run again:',
    code: "stack.push(2, 'moon')\nstack.push(3, 'star')",
  },
]

export const starterCode = `stack = MyStack()
stack.push(1, 'base')
`
