import { describe, expect, it } from 'vitest'
import { mapPythonError } from './errorMessages'

describe('mapPythonError', () => {
  it.each([
    [
      'SyntaxError: invalid syntax',
      'There is a small Python spelling or punctuation mistake. Check the highlighted line.',
    ],
    [
      'IndexError: pop from empty stack',
      'That position does not exist in the stack. Check which items are in it first.',
    ],
    [
      "NameError: name 'stack' is not defined",
      'Python does not know that name yet. Check its spelling and make sure you created it.',
    ],
    [
      "AttributeError: 'MyStack' object has no attribute 'pushh'",
      'That object does not have that operation. Check the stack operation name.',
    ],
    [
      'TypeError: push() takes 2 positional arguments but 3 were given',
      'That operation received a kind of value it cannot use. Check the value you passed in.',
    ],
  ])('maps %s to a child-friendly message', (rawMessage, expected) => {
    expect(mapPythonError(rawMessage)).toBe(expected)
  })

  it('uses a safe generic message for an unknown exception', () => {
    expect(mapPythonError('RuntimeError: something unexpected')).toBe(
      'Something went wrong while running your code. Check the highlighted line and try again.',
    )
  })
})
