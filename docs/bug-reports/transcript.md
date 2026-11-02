# src/tutor/transcript.test.ts

## Scenarios covered

- Missing, cleared, and corrupt `localStorage` all return an empty
  transcript instead of throwing.
- Entries that do not match the message shape are dropped, while valid
  neighbours survive.
- Messages round-trip in order with their role, text, and timestamp intact.
- Stored history is capped at `MAX_STORED_MESSAGES`, dropping the oldest
  turns first.
- `clearTranscript` empties stored history.
- `buildExport` emits only the approved review fields (`role`, `text`,
  `at`, plus `moderated` when set) and omits internal ids.

## Why this test exists

Two separate risks meet in this module.

**Availability:** the transcript is read during the first render of the
tutor panel. A throw on corrupt or unavailable storage — private browsing,
a quota failure, a leftover value from an older build — would take down the
whole lesson page, not just the chat. Every entry point here is written to
degrade to "empty transcript" instead.

**Privacy:** the exported file is the artefact a parent or teacher opens,
and REQUIREMENTS.md §9/NFR-1 commit to not collecting personal data.
`buildExport` copies fields explicitly rather than serialising stored
objects, so a field added to `TutorMessage` later cannot silently appear in
an exported file. The "no internal ids" assertion is what makes that
guarantee hold under future edits.

## Known gaps

- Does not test the browser download itself (`downloadTranscript` builds a
  Blob and clicks a synthetic link); that is DOM plumbing verified manually.
- Does not simulate a real `QuotaExceededError` from a full `localStorage`,
  only the thrown-error path via corrupt data.
- The cap is on stored history only. The number of turns actually sent to
  the model is bounded separately in `src/tutor/tutorClient.ts` and
  `api/tutor/handler.ts`.

## Status

Last verified: 2026-11-02 — 8/8 passing (`npm test`)
