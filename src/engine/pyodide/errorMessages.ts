export function mapPythonError(message: string): string {
  if (message.includes('SyntaxError')) {
    return 'There is a small Python spelling or punctuation mistake. Check the highlighted line.'
  }
  if (message.includes('IndexError')) {
    return 'That position does not exist in the stack. Check which items are in it first.'
  }
  if (message.includes('NameError')) {
    return 'Python does not know that name yet. Check its spelling and make sure you created it.'
  }
  if (message.includes('AttributeError')) {
    return 'That object does not have that operation. Check the stack operation name.'
  }
  if (message.includes('TypeError')) {
    return 'That operation received a kind of value it cannot use. Check the value you passed in.'
  }
  return 'Something went wrong while running your code. Check the highlighted line and try again.'
}
