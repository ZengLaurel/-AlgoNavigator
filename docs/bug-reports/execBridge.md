# src/engine/pyodide/execBridge.test.ts

## Scenarios covered

- Captures `print()` output from the Stack exercise.
- Converts the final Stack values into the shared `StructureState` shape.
- Converts a student `NameError` into a child-friendly error message.
- Keeps the bridge test deterministic by using a small fake Pyodide
  interface rather than downloading and initializing the full WASM runtime
  inside every Vitest run.

## Why this test exists

The execution bridge is the boundary between Python execution and the React
visualization. If stdout capture or final-state conversion breaks, the
student can run code successfully but see the wrong output or an empty live
Stack. If exception mapping breaks, raw Python errors can leak into the
child-facing interface. These tests protect the data contract without
requiring a browser Worker.

## Known gaps

- Does not test Pyodide's WASM runtime itself; the actual runtime is tested
  manually in the browser during Phase 2 acceptance.
- Does not test Worker `postMessage` plumbing; that is covered by the
  provider's mock-Worker timeout/result tests.
- Does not reproduce a true infinite loop; Worker termination is tested via
  the provider and must also be manually verified in a browser.

## Status

Last verified: 2026-10-30 — pending final Phase 2 verification (`npm test`)
