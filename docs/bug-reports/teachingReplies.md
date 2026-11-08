# Constrained practice coaching responses

Last verified: 2026-11-08 — 5/5 passing (`npm run test:report`).

| Case | Expected |
| --- | --- |
| Learner / coach model emits code | Never render model prose; choose curated guiding question |
| Extra JSON answer field | Ignore field; only known intent selects vetted text |
| Unknown intent / prototype key / malformed JSON | Fail closed to reflection question |
| Many hints / answer request | Practice prompt replaces normal two-hint solution policy |
| Correction demonstrated | Learner acknowledges top-only rule with a new guiding question |
| Prompt extraction | Existing moderation intercepts before model call |

Actual parameterized cases and timing appear in
[TEST-RESULTS.md](../TEST-RESULTS.md). The model chooses an intent from five
known values; it cannot inject student-visible code, complete solution text,
or a mastery decision. A client-supplied correctedRule affects dialogue only,
never stored mastery. This is a constrained dialogue system, not open-ended
AI assessment of the child's understanding.
