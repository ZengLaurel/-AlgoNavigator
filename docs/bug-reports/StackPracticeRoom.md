# Teach Xiao Tuo room UI

Last verified: 2026-11-08 — 5/5 passing (`npm run test:report`).

| Case | Expected |
| --- | --- |
| Source and hints | Four sourced activities; mistaken belief labelled; only requested hint appears |
| Wrong action / peek | Input and stack unchanged; no mastery notification |
| Demonstrate → teach → transfer | Cannot skip rule correction; only correct fresh example awards mastery; controls freeze afterward |
| Message comparison | Missing/wrong equality decision blocks advancing; correct comparison permits teaching |
| Switch / restart | Run, hints and explanation reset; old exercise evidence cannot complete the new exercise |

Every case's actual result and duration are generated in
[TEST-RESULTS.md](../TEST-RESULTS.md). Tests drive DOM controls and inspect
visible feedback; they do not claim natural-language comprehension scoring.
