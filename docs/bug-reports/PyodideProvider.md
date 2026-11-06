# src/engine/pyodide/PyodideProvider.test.tsx

## Scenarios covered

- Actual `run()` promise resolution, correlated ready/results and initialization reuse.
- Independent 30-second initialization and five-second execution deadlines; retry after either timeout.
- Timeout settles without constructing a replacement, even if the next Worker constructor would throw.
- Constructor, init/run postMessage, startup, error and messageerror failures settle and permit recovery.
- Concurrent calls return busy without disturbing the active run; stale and wrong-phase messages are ignored.
- Unmount during loading/running settles cancellation, removes listeners/timers, terminates the Worker and refuses later calls.

## Why this test exists

The former timeout callback constructed a replacement Worker before finishing the active promise. A throwing constructor could therefore leave the UI running forever. The former timeout test only set an unrelated boolean and never awaited the actual promise. This regression now awaits the real promise. That deterministic failure mechanism is not evidence that constructor failure caused the user's original incident.

## Known gaps

- Automated tests use a fake Worker, not WASM or browser module loading.
- Does not establish school-device performance or reproduce the user's original environment.

## Browser validation

2026-11-06: invoked run skill; used installed Chrome headless through its debugging endpoint (no dependencies installed). Launched dev at http://127.0.0.1:5180 and production preview at http://127.0.0.1:4180. Dev served the application and local `pyodide.asm.js`, `pyodide.asm.wasm` (8,647,684 bytes) and `python_stdlib.zip` (2,424,003 bytes), all HTTP 200 with JS/WASM/ZIP content types. Actual end-to-end Python acceptance was on **production preview**, including the built module Worker:

1. Completed Trial of Stones and continued to Stairway Repair.
2. Ran starter code; observed Loading Python then Python is ready after approximately three seconds and a rendered stone.
3. Entered `while True:\n    pass` using browser keyboard input. After the execution deadline, the visible alert was: “Your code took too long to finish. Check for an infinite loop and try again. Your code and progress have been kept.” The editor still contained the loop.
4. Replaced code with MyStack pushes for base, moon and star and ran again without refreshing. Observed Python is ready, Trial complete, Gate awakened and Stairway repaired.
5. Captured and inspected the resulting screenshot. No Runtime exception event was observed during the production scenarios. Production build's Pyodide node:* browser-external warnings did not prevent initialization/execution here; they do not establish behavior on every browser.

The dev browser initially reloaded during investigation; no dev Python acceptance claim is made. The user's original persistent-running trigger was not reproduced. Screenshot is a temporary validation artifact, not committed documentation.

## Status

Last verified: 2026-11-06 — 12/12 passing (`npm test`); see [generated results](../TEST-RESULTS.md).
