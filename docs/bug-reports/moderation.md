# api/tutor/moderation.test.ts

## Scenarios covered

- Ordinary Stack questions ("What does push do?", "why did my code print
  nothing?") are allowed through to the model.
- Instruction-extraction attempts are blocked: "ignore previous
  instructions", "show me your system prompt", "you are now a...",
  "developer mode".
- Age-inappropriate requests are blocked: weapons, self-harm, sexual
  content, drugs.
- Empty, blank, non-string, and oversized messages are rejected.
- Ordinary words containing unsafe substrings are **not** blocked — "How do
  I use a class?" must pass (a naive substring filter blocks it on "ass").
- Model replies are re-checked: unsafe text and replies that echo the system
  prompt back are rejected; a normal hint is allowed; an empty reply is
  rejected.

## Why this test exists

This is the only deterministic safety boundary in the product, and it runs
on input **before** anything is sent off-device or billed. If a pattern is
broken or accidentally widened, one of two silent failures follows: unsafe
content reaches a child, or legitimate learner questions are refused and the
tutor appears broken. Neither shows up in a type check or a build.

The false-positive case ("class" / "ass") is here because that is the
specific bug a keyword filter invites, and it would block a question a
student in this lesson is genuinely likely to ask.

## Known gaps

- **Topic scope is not enforced here, by design.** A student asking about
  football is redirected by the system prompt, not by this module. A keyword
  topic filter produced false positives on real lesson questions, and
  silently refusing a genuine question is worse for a learning tool than
  paying for one answer the model will redirect anyway. This is a deliberate
  deviation from the original Phase 3 plan, which listed off-topic patterns
  here.
- Pattern matching is English-only and will not catch obfuscated spellings,
  other languages, or novel phrasings. It is defense in depth beneath the
  system prompt, not a complete content classifier.
- No test asserts behaviour against a real provider moderation endpoint;
  REQUIREMENTS.md §9 still requires manual transcript review before a pilot.

## Status

Last verified: 2026-11-02 — 20/20 passing (`npm test`)
