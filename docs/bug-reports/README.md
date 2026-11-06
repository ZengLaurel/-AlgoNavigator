# Bug Reports — Convention

Every automated test file under `src/` gets a companion report here,
named after the test file (`src/foo/bar.test.ts` →
`docs/bug-reports/bar.md`). The point isn't to log bugs after the fact —
it's to record, at the time the test is written, **what regression it's
guarding against**, so a future contributor who sees the test fail (or
wants to delete it) understands why it exists.

Each report follows this template:

```md
# <test file path>

## Scenarios covered

- ...

## Why this test exists

What bug/regression this catches if it breaks. If the test was written
in response to an actual bug, name the bug.

## Known gaps

Scenarios this test file deliberately does NOT cover yet, and why.

## Status

Last verified: <date> — N/N passing (`npm test`)
```

Add a new report here whenever a new `*.test.ts`/`*.test.tsx` file is
added; update the "Status" line whenever the suite is re-verified.

## Where the actual test-case results live

These reports explain _why_ each test exists. The concrete test-case names,
per-case pass/fail, durations, and failure messages are generated into
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md):

```bash
npm run test:report
```

That command runs the full suite with Vitest's JSON reporter and rewrites
`docs/TEST-RESULTS.md` from the real run — do not edit that file by hand.
Commit it alongside the code change so the repository always carries a
record of what was last run and what passed.

Name mismatches to be aware of: `api/tutor/handler.test.ts` →
`tutorHandler.md` and `src/assets/index.test.ts` → `assets.md` (avoid
generic names like `handler.md`/`index.md`).
