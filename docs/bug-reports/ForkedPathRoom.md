# src/components/game/ForkedPathRoom.test.tsx

## Scenarios covered

- Injected deterministic maze renders exactly its SVG nodes and unique edges.
- Keyboard child moves push; dead-end Backtrack pops; explored child re-entry is allowed.
- Sidebar ordering and accessible Top label match the path; entrance cannot pop.
- Exit freezes available map actions and replay calls the generator again and resets stack/completion.

## Why this test exists

Tests a known route rather than guessing through random UI output. Integrates the dedicated map and computeStackLayout-backed room stack so logic/rendering divergence is caught.

## Known gaps

Framer Motion is mocked and reduced motion enabled. Real tween timing, interrupted-animation locking, browser SVG focus, screen-reader behavior, responsive layout and OS reduced-motion need manual QA. No browser driver (chromium-cli, Playwright or Puppeteer) was available; only development-server HTTP smoke verification was performed, not a visual/full-playthrough acceptance.

## Status

Last verified: 2026-11-06 — 1/1 passing (`npm test`).
