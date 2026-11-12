# World-map completion integration

Tests isolate the application reward boundary with a mock GameStage final
completion callback. They verify exactly one persistent gem, repeat-callback
deduplication and an in-session gem plus warning when storage is blocked.
ForkedPathRoom separately verifies that the callback only fires at the exit.
App tests exercise the real map and first room, including no early gem.

## Phase 11 verification

Last verified: 2026-11-11 — 2/2 passing in the full `npm run test:report` run (254/254 overall). Actual per-case results: [TEST-RESULTS.md](../TEST-RESULTS.md).

Stack now reads/writes the shared v2 progress layer; old records are migrated without being overwritten. Storage assertions target v2. Original gameplay and unlock behavior remain covered.
