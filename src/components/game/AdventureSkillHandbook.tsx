import { useState } from 'react'
import './AdventureSkillHandbook.css'

const topics = [
  {
    title: 'Core Principle',
    icon: 'M4 4h16v4H4z M4 10h16v4H4z M4 16h16v4H4z',
    notes: [
      'A stack follows Last In, First Out (LIFO). The last item you add is the first one you can remove.',
      'Think of the stones in the ruins. If you place Moon, Sun, then Star on the stack, they come off in reverse order: Star, Sun, then Moon. You add and remove stones only at the top.',
    ],
  },
  {
    title: 'Core Operations',
    icon: 'M7 4v12m-4-4 4 4 4-4m6 8V8m-4 4 4-4 4 4',
    notes: [
      'push(item) places an item on top.',
      'pop() removes the top item and gives it back to you.',
      'peek() shows you the top item and leaves it in place.',
      'An empty stack has no top item. Check that it has an item before calling pop() or peek().',
    ],
  },
  {
    title: 'Common Uses',
    icon: 'M5 15v-4h7V5h4m-4 6v8h4 M5 15l3 3-3 3-3-3z M19 2l3 3-3 3-3-3z M19 16l3 3-3 3-3-3z',
    notes: [
      'Path backtracking: At a dead end, return to the most recent fork that still has a path to try.',
      'Undo: Reverse the most recent edit first.',
      'Matching parentheses: Each closing parenthesis matches the most recent opening one that has no match yet.',
      'Function calls: When a function finishes, the program returns to the function that called it.',
    ],
  },
]

export function AdventureSkillHandbook() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  return (
    <aside className="skill-handbook" aria-label="Adventure Skills Handbook">
      <button
        type="button"
        className="skill-handbook-toggle"
        aria-expanded={isOpen}
        aria-controls="skill-handbook-topics"
        onClick={() => {
          setIsOpen(!isOpen)
          setActiveTopic(null)
        }}
      >
        <span>Adventure Skills Handbook</span>
        <span aria-hidden="true">{isOpen ? '›' : '‹'}</span>
      </button>
      <ul id="skill-handbook-topics" hidden={!isOpen}>
        {topics.map(({ title, icon, notes }, index) => {
          const isActive = activeTopic === title
          const descriptionId = `skill-handbook-topic-${index}`

          return (
            <li key={title}>
              <button
                type="button"
                className="skill-handbook-topic"
                aria-expanded={isActive}
                aria-controls={descriptionId}
                onClick={() => setActiveTopic(isActive ? null : title)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={icon} />
                </svg>
                {title}
              </button>
              <div id={descriptionId} hidden={!isActive}>
                {notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
