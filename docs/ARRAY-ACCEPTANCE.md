# Phase 12 — Array / Supply Camp acceptance

Verified locally on 2026-11-11 (Asia/Shanghai), on the working tree based on
`main` revision `300b1d0` plus the Phase 10–12 changes. No deployment or GitHub push
is implied. Array is now playable at `/#/array`; linked-list and queue remain locked.

## Delivered experience

- Camp storage: six scripted operation families, captions, predictions, play/pause,
  both step directions and speed control. Used positions, length, capacity and
  moved indexes are explicit. Growing displays a new, larger storage area.
- Supply Sorting: real CodeMirror/Python; insert/replace/remove target, fresh runs,
  validated state/identity/operation evidence, replay, Reset and three progressive hints.
  Editing while a run is pending invalidates that result; leaving the room cancels it.
- Camp Packing: growth, insertion and removal preserve the retained supplies;
  traversal verifies the result before explicit completion awards one Array gem.
- Four original teaching activities: index, insert, remove and growth. Each includes
  an explicit misconception, demonstration, structured rule/reason, optional own-word
  explanation, independent transfer and happy learned feedback. Hints/chat do not grade.
- Topic-specific knowledge, examples and Python-list distinction; optional role-separated
  Tutor/Xiao Tuo chat throughout. Progress and known mastered IDs persist independently
  of the Stack record. Other module entrances do not depend on Stack completion.

## Automated verification

`npm run test:report`: **271/271 passing across 41 files**. This adds 17 cases to the
254-case Phase 11 baseline. [ARRAY-TEST-CASES.md](./ARRAY-TEST-CASES.md) records their
inputs, steps, expectations, actual assertion outcomes and durations.
[TEST-RESULTS.md](./TEST-RESULTS.md) is the generated full report.
`npm run lint`, `npm run build`, changed-file Prettier and whitespace checks form the
other delivery checks. The build retains existing Pyodide externalization notices.

## Browser checks

Environment: local Windows, Codex in-app Chromium, normal desktop viewport unless
specified; app at `http://127.0.0.1:4174/`. Private evidence is under
`artifacts/phase12/`, excluded from Git. All four teaching tasks were completed
without opening AI chat; the live model was called afterward.

| ID      | Inputs / steps                                                                   | Expected                                                                                                                  | Actual                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| ARR-B01 | Enter Supply Camp from map; initial Array record absent                          | Real Array room; only its first stage open                                                                                | PASS; observation shown, Python/apply/teaching initially disabled                                                                        |
| ARR-B02 | Answer and step through six predictions/operations                               | Exact indexes, insertion shifts right, removal left, length 3/capacity 6 after growth; continuation only after all checks | PASS; six predictions checked and continuation enabled                                                                                   |
| ARR-B03 | Real CodeMirror: insert X1, set original C at 3 to D, remove2, print traverse    | Actual Python target A/X/D and verified evidence                                                                          | PASS; output ['A','X','D'], target matched, Continue enabled; python-pass.txt/png                                                        |
| ARR-B04 | Try insertion while full; grow to5, insert map1, remove2, traverse               | Reject full insert without mutation, then rope/map/lamp                                                                   | PASS; CAPACITY_FULL feedback, shift captions and correct traversal                                                                       |
| ARR-B05 | Explicit application completion, return to map                                   | One new gem, preserve existing Stack gem                                                                                  | PASS; Array gem message and teaching entry open; map changed 1/4 to 2/4; apply-pass.txt                                                  |
| ARR-B06 | Index: demo get0; teach zero-based + position reason; fresh get2                 | No mastery at rule stage, return M on fresh example before learned                                                        | PASS; 1/4 taught and happy acknowledgement                                                                                               |
| ARR-B07 | Insert: X at1 in A/B/C; teach shift-right; M at1 in K/L                          | Correct movement, new input, then learned                                                                                 | PASS; 2/4 taught                                                                                                                         |
| ARR-B08 | Remove: index1 in A/B/C/D; teach shift-left; remove0 in K/L/M                    | Closed gap, new example, then learned                                                                                     | PASS; 3/4 taught                                                                                                                         |
| ARR-B09 | Grow: A/B capacity2 to4, append C; teach length vs capacity; K/L/M to5, append N | Preserve old order/length during growth; complete only after transfer                                                     | PASS; 4/4 taught and happy rule restatement; four-taught.txt/png                                                                         |
| ARR-B10 | Reload Array and reopen teaching bank                                            | Start observation again; retain all unlocked entrances and four IDs                                                       | PASS; four room entrances and 4/4 taught retained; reload-persisted.txt                                                                  |
| ARR-B11 | Set 390x844 viewport, inspect DOM bounds and forms                               | No horizontal page overflow; storage row scrolls independently                                                            | PASS; documentWidth=viewport=375 CSS px (scrollbar excluded), body font18px, storage viewport265px; narrow.png; viewport reset afterward |
| ARR-B12 | Focus Knowledge handbook and press Enter, then close with Enter                  | Keyboard-operable topic disclosure, current task preserved                                                                | PASS; four topic groups and concrete before/after examples expanded                                                                      |
| ARR-B13 | Coach question: 为什么数组插入时后面的元素要移动？                               | Chinese Array hint without full code or grading                                                                           | PASS after provider repair; response: 比较已用长度与可用容量。插入时怎样保留后面的物品？; tutor-online.txt/png                           |
| ARR-B14 | Switch role, teach zero-based indexing and ask how to verify                     | Old conversation cleared; learner remains learner and asks for evidence                                                   | PASS; 小老师，我想听你讲讲。试一组不同的物品。你的第一次操作会使用哪个位置？; learner-online.txt                                         |
| ARR-B15 | Local provider initially unavailable in restricted process                       | Clear fallback, core actions remain available                                                                             | PASS; array-specific unavailable message; all room/teaching progress unaffected; tutor-fallback.txt                                      |

## Local provider repair

The installed CLI could not infer its default configuration directory in the desktop
process. The adapter now supplies the canonical default CODEX_HOME to the child process
when missing, preserves explicit overrides and still never reads/copies auth files.
A regression covers both environment cases. The normal-permission diagnostic succeeded
with the existing ChatGPT login; the restricted web service was then restarted on the
same 4174 address with normal local permissions. Both browser role samples above passed.
This does not change the provider, create credentials or enable student tool access.

## Limits

- Two live-role samples are bounded acceptance, not a general model safety/quality proof.
- Full keyboard-only playthrough, separate Edge/Firefox, actual OS reduced-motion preference,
  school-device cold start, final artwork approval and real-student outcomes remain broader
  Phase 7/8/9/15 checks. Native controls/keyboard handbook and mocked reduced-motion component
  paths are covered here. No false claim of school-device certification is made.
- Worker timeout/respawn logic is unchanged from Phase 11's real browser array timeout/retry
  check and is included in the full suite. This phase's code room browser run checked a
  successful target; it did not repeat a full timeout scenario inside that room.
- Teaching records are evidence of completed deterministic tasks, not automatic grading of
  the learner's optional explanation. No accounts or cross-device sync were added.
- Saved browser state now includes the QA Array gem/four taught IDs; replay remains available.

Phase 12 functionality is complete under this bounded acceptance. Next: Phase 13,
Linked List / Misty Forest. Linked-list and Queue are still not playable.

Later verification — 2026-11-12, Phase 15: [joint desktop acceptance](./FOUR-MODULE-ACCEPTANCE.md) adds actual four-module timeout/retry and 390px checks. It fixes concatenated Python print lines, generic Queue peek guidance, module focus and pending rule restatement. This dated record retains its original results/limitations; consult the joint report for superseding fixes.
