# api/tutor/handler.test.ts

## Scenarios covered

- Non-POST requests are rejected without calling the model.
- Malformed JSON and an unsupported `lessonId` are rejected without calling
  the model.
- A valid question returns the model's reply with `moderationFlag: false`.
- The request sent to the model contains the versioned system prompt, the
  hint count, and the student's code/output/question wrapped in labelled
  data blocks.
- Unsafe input is blocked **before** the model is called, and returns the
  fixed safe redirect with `moderationFlag: true`.
- An unsafe model reply is replaced with the same safe redirect.
- A provider refusal is treated as a moderation event (safe redirect),
  not as an outage.
- A provider/network failure returns a generic child-safe message and does
  not leak the underlying error text.
- Unexpected request fields (a name, an email) are not forwarded to the
  model.
- Oversized code context is capped, and only the most recent conversation
  turns are sent.

## Why this test exists

The handler is where three separate guarantees are enforced at once: the
privacy boundary (what leaves the browser), the safety boundary (what
reaches the child), and the cost boundary (what gets billed). All three fail
silently — a leaked field, an unsafe reply, or an unbounded payload all
still return HTTP 200 with plausible-looking text.

Two cases guard specific decisions rather than generic behaviour:

- **Refusal is not an outage.** A provider refusal almost always means
  unsafe input slipped past the deterministic gate. Routing it to "try
  again in a moment" would invite the child to rephrase and retry, so it is
  deliberately mapped to the safe redirect instead. The project also does
  **not** enable server-side model fallbacks here: a fallback model that
  answers a refused question is the wrong outcome for a children's product.
- **Provider detail never reaches a child.** The test asserts the raw error
  string (`ECONNREFUSED ...`) is absent from the response body.

The injected `askModel` dependency keeps every case runnable with no API key
and no network, so CI never spends money or depends on provider uptime.

## Known gaps

- Does not exercise the real Anthropic SDK call shape, model id, effort
  setting, or response parsing — that lives in `api/tutor/claudeClient.ts`
  and is only verified manually against the live API.
- Does not test the deployment adapter (`api/tutor/index.ts`) or the Vite
  dev middleware; both are thin request/response translation.
- Tutoring **quality** — whether a hint is genuinely age-appropriate and
  hint-first rather than answer-first — cannot be asserted here and remains
  a manual human check.

## Status

Last verified: 2026-11-06 — 12/12 passing (`npm test`); see
[`docs/TEST-RESULTS.md`](../TEST-RESULTS.md) for the per-case record.
