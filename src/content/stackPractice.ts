export type PracticeKind = 'build' | 'backspace' | 'stars' | 'pairs'
export interface PracticeExample {
  input: string
  other?: string
  target?: string
}
export interface PracticeExercise {
  id: string
  number: number
  title: string
  kind: PracticeKind
  source: string
  story: string
  misconception: string
  hints: string[]
  examples: [PracticeExample, PracticeExample]
}
export const STACK_LIST_SOURCE =
  'https://leetcode.cn/discuss/post/3583665/fen-xiang-gun-ti-dan-chang-yong-shu-ju-j-bvmv/'
export const stackPractice: PracticeExercise[] = [
  {
    id: 'build',
    number: 1441,
    kind: 'build',
    title: 'Pack the supply tower',
    source:
      'https://leetcode.cn/problems/build-an-array-with-stack-operations/',
    story:
      'Read the numbered crates in order. Push each crate before deciding whether to keep it. Stop as soon as the target tower is built.',
    misconception:
      'I think removing the oldest crate will make room for the new one. Am I right?',
    hints: [
      'The right end of the tower is its top.',
      'Even an unwanted crate must be pushed before it can be removed.',
      'Compare the new top crate with the target. You can only remove that top crate.',
    ],
    examples: [
      { input: '1234', target: '24' },
      { input: '12345', target: '135' },
    ],
  },
  {
    id: 'backspace',
    number: 844,
    kind: 'backspace',
    title: 'Repair two messages',
    source: 'https://leetcode.cn/problems/backspace-string-compare/',
    story:
      'Type two messages. A # erases the most recently kept letter. On an empty message, ignore #. Then compare the repaired messages.',
    misconception:
      'A backspace should erase the first letter I typed, because it arrived first!',
    hints: [
      'A typed letter goes on top.',
      'A backspace removes the newest letter, not the first one.',
      'Process both messages from left to right. Compare what remains, not their original lengths.',
    ],
    examples: [
      { input: 'ma#p', other: 'mp' },
      { input: '##ra#', other: 'r#' },
    ],
  },
  {
    id: 'stars',
    number: 2390,
    kind: 'stars',
    title: 'Lift the star spell',
    source: 'https://leetcode.cn/problems/removing-stars-from-a-string/',
    story:
      'Read the rune ribbon from left to right. Each star removes the closest surviving letter on its left. Do not put the star on the stack.',
    misconception:
      'A star should erase the oldest letter at the bottom. That is the one I remember first.',
    hints: [
      'Keep surviving letters in a stack.',
      'The closest surviving letter on the left is the current top.',
      'A star and the top letter vanish together; later stars see the updated tower.',
    ],
    examples: [{ input: 'sun**ray*' }, { input: 'moon***s' }],
  },
  {
    id: 'pairs',
    number: 1047,
    kind: 'pairs',
    title: 'Unpair the rune stones',
    source:
      'https://leetcode.cn/problems/remove-all-adjacent-duplicates-in-string/',
    story:
      'Two equal neighboring runes disappear. Compare each arriving rune with the top survivor. A match removes the top; otherwise keep the arriving rune.',
    misconception:
      'I can remove equal letters anywhere, even when other letters stand between them!',
    hints: [
      'Only neighbors can disappear.',
      'The top survivor is next to the arriving rune.',
      'After a pair disappears, check the newly exposed top against the next incoming rune.',
    ],
    examples: [{ input: 'abccbaq' }, { input: 'azxxzy' }],
  },
]
