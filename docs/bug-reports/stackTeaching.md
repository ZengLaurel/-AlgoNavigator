# Stack teaching engine and persistence

Last verified: 2026-11-08 — 18/18 passing (`npm run test:report`).

## Cases and expected behavior

| Case | Input / action | Expected |
| --- | --- | --- |
| Build demo / transfer | stream 1234 → target 24; stream 12345 → target 135 | survivors 24 / 135 |
| Backspace demo / transfer | ma#p vs mp; ##ra# vs r# | mp equals mp; r differs from empty |
| Stars demo / transfer | sun**ray*; moon***s | survivors sra / ms |
| Pairs demo / transfer | abccbaq; azxxzy | chain cancellation gives q / ay |
| Unwanted crate | push 1 when target is 2, then pop | no skipped input; cursor remains 1 after pop; original state unchanged |
| Empty stack / peek | pop or peek at initial state; ignore leading # | wrong action and peek preserve state; valid ignore advances |
| Early target | target 1 from stream 123 | stop immediately with unread input |
| Teaching gate | LIFO + top-only reason; FIFO, arbitrary access, blanks | only the two correct structured choices pass |
| Safe progress | duplicate/unknown IDs, extra explanation field | keep only deduplicated known IDs; save no text |
| Corrupt progress | broken JSON, null, wrong version, non-array IDs | locked empty fallback |
| Blocked storage | getItem/setItem throw | safe load fallback and false save result |

Actual status, each parameterized case, timing and failures are generated in
[TEST-RESULTS.md](../TEST-RESULTS.md). These are bounded teaching scenarios,
not general LeetCode submissions or an assessment of free-form language.
