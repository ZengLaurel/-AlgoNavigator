# Four-module pilot checklist (prepared; not conducted)

Updated 2026-11-12 for Stack, Array, Linked List and Queue. Phase 15 desktop checks do not certify school devices or learning outcomes. No child sessions have been run. Each session covers one chosen module; do not require all four in 15–20 minutes.

## Before inviting children

- Obtain the school's/guardian's appropriate approval and a supervising adult.
- Resolve remaining art quality and browser/device acceptance items in ROADMAP.
- On each intended school device/browser, run production preview, check keyboard
  and touch access, visible focus, 390px layout, both motion preferences and all
  three rooms and a teach-Xiao-Tuo transfer in the selected module. Record browser version, OS, device class, network/cache conditions.
- Measure actual cold and warm Python readiness separately. Confirm timeout/retry
  and controlled Worker-failure recovery without losing editor code/unlocks.
- Explain that no names, student code, screenshots of children, or identifiers
  should be collected. An optional AI Tutor/learner chat is available: explain that Send shares the question and current lesson/code context with the configured service. Keep personal information out of it and allow completing every core activity without chat. Keep observation notes
  local and restricted; agree a deletion date before collecting them.
- Use a separate fresh test browser profile for pilot sessions. Current progress uses `algonavigator.modules-progress.v2`; three legacy Stack records can migrate into it. Clearing only one legacy key does not reset the game. Preserve any existing learner records; do not clear unrelated browser data.

## Facilitate a 15–20 minute session

1. Let the child choose one region. Introduce its three-room adventure and optional teaching practice without teaching the solution. Record the chosen module.
2. Let the child step through Trial and explain what the top stone means.
3. In Stairway, start the timer when the editor is ready, record first hint use
   and successful completion. Do not count Python initialization as solve time.
4. In Forked, ask the child to find a dead end, backtrack, then find the exit.
5. Ask: What does push add? Which stone/card does pop remove? Why can the entrance
   not be popped? Record anonymous correct/partial/not-yet observations.
6. Stop if frustrated or uncomfortable. Note adult intervention separately from
   an unaided solution. Never infer completion from unlocked navigation alone.

## Anonymous observation template (one row per session)

Use random session labels only; do not maintain a mapping to children.

| Session      | Browser/device class      | Room 1/2/3 completed | Stairway seconds before first hint | Stairway unaided solve seconds or not solved | Hints opened | Adult interventions | Crashes/reloads | push/pop/top understanding | Engagement/friction notes |
| ------------ | ------------------------- | -------------------- | ---------------------------------- | -------------------------------------------- | ------------ | ------------------- | --------------- | -------------------------- | ------------------------- |
| random label | version, OS, device class | yes/no each          | number or none                     | number or not solved                         | 0–3          | count/type          | count/symptom   | correct/partial/not-yet    | anonymous only            |

Report aggregate completion rates with denominators, hinted vs unaided timing
separately, runtime recovery failures and comprehension observations. A small
pilot is not proof of educational effectiveness. Decide go/no-go and next scope
only after recording actual results; no pilot results are claimed here.

## Module-specific observation prompts

| Module      | Observe and apply                                                      | Teach-to-learn check                                           |
| ----------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Stack       | Predict top-only removal and LIFO; build a tower and backtrack         | Correct one sprite misconception and test a new example        |
| Array       | Explain index 0, insertion shifts and capacity versus length           | Explain a rule and verify with fresh supplies                  |
| Linked List | Follow head/next instead of picture order; preserve the successor      | Distinguish IDs from equal values; demonstrate on a fresh path |
| Queue       | Contrast FIFO with Stack; explain rear arrival, front service and peek | Preserve waiting and departure history on fresh events         |

Extend each anonymous observation row with module, exercise ID, whether the child corrected the rule, and whether the fresh example succeeded independently. Report hint use, errors and adult interventions separately. A gem or stored taught flag is not proof of conceptual understanding. Chat prose is not an automated learning assessment. School-device and accessibility checks must pass before inviting children; the actual pilot remains **not conducted**.
