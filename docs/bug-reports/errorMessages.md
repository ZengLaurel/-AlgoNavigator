# src/engine/pyodide/errorMessages.test.ts

## Scenarios covered

- Maps common Python `SyntaxError`, `IndexError`, `NameError`,
  `AttributeError`, and `TypeError` messages to child-friendly guidance.
- Falls back to a safe generic message for an unknown exception type.

## Why this test exists

Raw Python tracebacks are too technical for the target audience. A change
to the mapping table could silently expose confusing errors or lose the
specific hint for a common student mistake while TypeScript and the build
remain green. These table-driven tests pin the user-facing safety and
usability contract at the execution boundary.

## Known gaps

- Does not test Pyodide's exact traceback formatting for every Python
  version; the assertions use representative exception names/messages.
- Does not test visual error presentation; that belongs to component-level
  tests and manual browser verification.

## Status

Last verified: 2026-10-30 — pending first run after Phase 2 test additions
(`npm test`)
