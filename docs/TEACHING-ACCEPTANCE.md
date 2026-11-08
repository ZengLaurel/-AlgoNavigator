# Teach Xiao Tuo — acceptance record

Date: 2026-11-08. Local app: `http://127.0.0.1:4174/#/stack`.
Source list: https://leetcode.cn/discuss/post/3583665/fen-xiang-gun-ti-dan-chang-yong-shu-ju-j-bvmv/
Source sections read: §3.1 Stack basics and §3.3 adjacent cancellation.
Problem pages 1441, 844, 2390 and 1047 were also read to verify semantics.
Activities use new stories and examples, not copied solutions/editorials.

## Automated run

`npm run test:report` records all case names, pass/fail, elapsed time and
failure diagnostics in [TEST-RESULTS.md](TEST-RESULTS.md). Current teaching
run: **222 / 222 passed across 31 files**, including the previous game/Tutor
regressions. Build and lint passed. Five companion reports list concrete
inputs and expected outcomes for the new functionality. The report generator
also writes failed cases when Vitest exits unsuccessfully, so failures cannot
leave the previous passing summary in place.

| Test file | Cases | Actual result | Expected behavior record |
| --- | --- | --- | --- |
| stackTeaching.test.ts | 18 | Passed | [Engine and persistence](bug-reports/stackTeaching.md) |
| StackPracticeRoom.test.tsx | 5 | Passed | [Learning loop](bug-reports/StackPracticeRoom.md) |
| PracticeUnlock.test.tsx | 2 | Passed | [Unlock integration](bug-reports/PracticeUnlock.md) |
| TeachingChat.test.tsx | 2 | Passed | [Role, scope and offline chat](bug-reports/TeachingChat.md) |
| teachingReplies.test.ts | 5 | Passed | [No-solution coaching boundary](bug-reports/teachingReplies.md) |

## Browser / live-model cases

| ID | Case / steps | Expected | Observed result |
| --- | --- | --- | --- |
| M01 | Complete Stairway Repair with real Python; enter Forked Path | Existing game remains playable | Passed: Python result opened the gate; continued to generated maze |
| M02 | Traverse the visible maze graph to its exit by keyboard | Room 04 unlocks only at exit; Continue enters practice | Passed: room-04 nav and Continue button appeared at exit; bank loaded |
| M03 | Open practice | Four tasks, source links, labelled mistaken belief, empty visible stack | Passed |
| M04 | Select ignore and peek at build start | No input advance; no progress reward | Passed; then demonstrated stream 1234 → target 24 |
| M05 | Submit rule teaching without rule/reason | Remain in teaching phase with corrective question | Passed; blank rule did not advance |
| M06 | Choose LIFO + top-only, add own Chinese explanation | Xiao Tuo acknowledges correction and opens fresh example | Passed: new stream 12345 → target 135 |
| M07 | Demonstrate transfer correctly; Check | Happy pose, learned feedback, one mastered activity; controls freeze | Passed: 1/4 shown and build task marked taught |
| M08 | UI refresh during development | Restore learned ID, do not persist explanation/chat or partially completed trace | Passed: 1/4 retained; demonstration restarted at empty stack |
| M09 | Live local-model learner request after correction | Curated acknowledgement, no full solution | Passed: Chinese acknowledgement of top-only rule and a guiding question |
| M10 | Live coach request for entire solution with 99 hints | Remain hint-only, never reveal code | Passed: curated question about next symbol and current top |
| M11 | Browser coach chat: request complete code in Chinese | Chinese hint only; re-enable input, no mastery change | Passed: asked the child to inspect next symbol/top; no code returned |
| M12 | Inspect teaching UI at the existing 600px viewport | No horizontal document overflow | Passed: document content width and viewport both 600px |

## Limits

- This is a four-activity concept practice bank, not a full LeetCode judge
  or a complete catalog of the source list.
- Free-form teaching text is not automatically graded. Structured rule and
  trace/transfer evidence determine completion; AI cannot award mastery.
- Chat uses constrained intentions and vetted response templates. It is not
  unrestricted model-generated tutoring prose.
- Existing narrow browser viewport was inspected; no new full cross-browser,
  school-hardware or real-student learning-impact study was performed.
- Automated offline/storage/moderation cases do not prove an always-available
  model connection. Local Codex login, internet and its system proxy remain
  required for AI; the teaching activity itself does not require AI.
