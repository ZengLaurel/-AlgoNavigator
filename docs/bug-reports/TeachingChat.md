# Learner and coach chat

Last verified: 2026-11-08 — 2/2 passing (`npm run test:report`).

| Case | Expected |
| --- | --- |
| Three shortcuts / mode context | Learner shortcut sends current task/evidence with teach-sprite mode |
| Partner switch | Clear prior chat; coach request uses practice-coach mode and empty history |
| Offline retry | Show safe service failure, re-enable text input, never change mastery |

Actual case results and timing appear in [TEST-RESULTS.md](../TEST-RESULTS.md).
Chat is per-exercise in-memory state; export is explicit. Live model
connectivity and response quality require separate acceptance checks.
