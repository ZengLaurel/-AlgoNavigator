# src/components/CodeEditorPanel.test.tsx

## Scenarios covered

- Real provider lifecycle renders Loading Python, Running your code, timeout error and recovered ready/result states.
- Run and Reset are disabled during both loading and execution and enabled after timeout.
- Retrying after timeout sends unchanged starter code and displays the successful result.
- An unexpected rejected run promise becomes a visible error result instead of an unhandled rejection.

## Why this test exists

A stalled Python request previously left the editor indefinitely busy, and initialization did not consistently disable both controls. The editor must reflect provider phases and surface unexpected failures without discarding code.

## Known gaps

- CodeMirror's view is mocked to avoid jsdom layout requirements; the unchanged-code assertion covers starter code, not simulated CodeMirror typing.
- Uses a fake Worker rather than loading Python. Actual production Chrome validation, including typed code, timeout and retry, is recorded in [PyodideProvider](PyodideProvider.md).

## Status

Last verified: 2026-11-06 — 2/2 passing (`npm test`); see [generated results](../TEST-RESULTS.md).
