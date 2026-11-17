# Teaching animation refresh — Test cases

Date: 2026-11-12 (Asia/Shanghai). Full actual regression: **352/352 cases, 49 files**. These 12 new tests supplement the 340-case resilience baseline. Inputs, assertions and outcomes below correspond to the shipped SVG story scenes; real browser checks are separate in [STORY-ANIMATION-ACCEPTANCE.md](./STORY-ANIMATION-ACCEPTANCE.md). Timings/statuses are snapshots from the real [generated report](./TEST-RESULTS.md).

## STORY-A01 — child-friendly structure stories › uses the matching event when a recorded program is stepped backwards and forwards

Input: recorded array insertion in SnapshotPlayback, forward to the event, show Before, then back to initial state. Expected: the matching insertion narration appears only for that event; initial view has no stale replay controls.

Actual: ✅ passed, 237 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A02 — child-friendly structure stories › does not pretend a detached beacon was reached along the HEAD trail

Input: visit x while HEAD points only to a. Expected: the scene explicitly says no HEAD rope reaches x; reading is not shown as connecting it.

Actual: ✅ passed, 26 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A03 — child-friendly structure stories › prepares a new beacon successor before changing the previous rope or head sign

Input: insert x after a in a→b and insert x as head. Expected: middle step first prepares x→b with a→b intact; final step changes a→x. In head insertion the old HEAD stays during preparation and changes to x only after.

Actual: ✅ passed, 86 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A04 — child-friendly structure stories › shows insertion as making a gap before lowering the new box, with stable identities

Input: insert X at index 1 in A/B/C. Expected: Before hides incoming X and keeps B at 1; Watch moves B to 2 and opens a gap; After puts X at 1. Event evidence is not mutated.

Actual: ✅ passed, 53 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A05 — child-friendly structure stories › lifts a removed box before closing the gap without losing the surviving box

Input: remove B from A/B/C. Expected: Watch lifts B while C stays at 2; After hides removed B and moves the surviving C to 1.

Actual: ✅ passed, 40 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A06 — child-friendly structure stories › separates growing capacity from adding supplies

Input: grow two supplies from capacity 2 to 5. Expected: old and new shelf labels differ; the two supply identities/count stay unchanged.

Actual: ✅ passed, 71 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A07 — child-friendly structure stories › changes actual next ropes while keeping beacon locations and identities fixed

Input: reconnect a to prepared x, with x→b. Expected: actual rendered a→b rope changes to a→x, x→b remains, and b’s stone position is unchanged.

Actual: ✅ passed, 38 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A08 — child-friendly structure stories › depicts head removal as changing the starting sign, including an empty trail

Input: remove the only head k. Expected: Before has k as start; After HEAD→None appears while the detached stone still exists.

Actual: ✅ passed, 44 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A09 — child-friendly structure stories › keeps boats and departure history unchanged throughout peek

Input: peek at A while A/B wait. Expected: all three phases retain two boat IDs and no departure; caption explicitly says unchanged.

Actual: ✅ passed, 49 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A10 — child-friendly structure stories › sails out only the front boat before recording its departure

Input: dequeue from A/B. Expected: Watch retains B while A sails away; After only B waits and A appears in departure history.

Actual: ✅ passed, 42 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A11 — child-friendly structure stories › adds newcomers behind existing boats and explains failed empty operations

Input: enqueue B behind A and then render a rejected empty dequeue. Expected: newcomer hidden Before; existing A remains After; empty failure preserves the scene and offers no successful-move replay.

Actual: ✅ passed, 34 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).

## STORY-A12 — child-friendly structure stories › auto-plays the three phases, pauses, and replays without changing lesson data

Input: normal-motion scene with fake timers. Expected: automatic Before→Watch→After, pause holds the middle step, replay restarts and completes; no lesson actions are performed.

Actual: ✅ passed, 49 ms. Source: [StructureStory.test.tsx](../src/components/game/StructureStory.test.tsx).
