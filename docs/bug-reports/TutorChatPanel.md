# src/components/TutorChatPanel.test.tsx

## Scenarios covered

- The panel starts empty with a labelled question input and an Ask button.
- Asking a question renders the student's text, then the tutor's reply.
- A failed request shows a friendly retry message and leaves the panel
  usable.
- A moderated turn shows only the safe redirect, with no moderation
  internals exposed to the child.
- The hint count sent to the server increases with each tutor answer (0 on
  the first question, 1 on the second).
- "Export session log" is disabled until there is something to export, then
  triggers the export.
- A transcript saved in a previous session is restored after remount.

## Why this test exists

This is the only surface a child actually touches, and three of its
guarantees are invisible to a type check:

- **The hint ladder.** The server withholds complete answers until at least
  two hints have been used, but it can only do that if the client reports
  the count honestly. If this wiring broke, the tutor would quietly start
  handing out finished answers — the exact failure the Socratic design
  exists to prevent, and one nothing else would catch.
- **Failure does not break the lesson.** REQUIREMENTS.md treats the tutor as
  an aid, not a dependency. The unreachable-tutor case asserts the panel
  still works after a failed request.
- **Moderation stays invisible.** A child should see a gentle redirect, not
  a policy message. The test asserts no "moderated" wording reaches the DOM.

`tutorClient` is mocked so no test performs a network call or needs an API
key.

## Known gaps

- Does not test the real `fetch` path or response validation; that lives in
  `src/tutor/tutorClient.ts` and is currently covered only by the handler
  tests on the server side and by manual browser checks.
- Does not assert scroll behaviour, focus management after sending, or
  screen-reader announcement order beyond the `aria-live` attribute.
- Does not cover rapid repeated submissions beyond the `pending` guard.
- Tutoring tone and age-appropriateness are not assertable here and remain a
  manual review item.

## Status

Last verified: 2026-11-06 — 7/7 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
