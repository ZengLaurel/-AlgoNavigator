import Anthropic from '@anthropic-ai/sdk'
import type { AskModelInput } from './handler.js'
import { TutorRefusalError } from './errors.js'

/** Default per SDK guidance. Override only via server env, never from the
 * client. SPECIFICATION.md §1 assumed a Haiku-class model for cost; set
 * ALGONAV_TUTOR_MODEL=claude-haiku-4-5 to take that tradeoff. */
const MODEL = process.env.ALGONAV_TUTOR_MODEL ?? 'claude-opus-5'

/** Replies are deliberately short (the system prompt caps them at ~60 words),
 * but adaptive thinking also draws from max_tokens, so leave headroom. */
const MAX_TOKENS = 2048

/** Raised when the model declines. Mapped by the handler to the same safe
 * redirect a moderation rejection produces. */

let client: Anthropic | undefined

function getClient(): Anthropic {
  // Resolves ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / an `ant auth login`
  // profile. The key never reaches the browser.
  client ??= new Anthropic()
  return client
}

export async function askClaude({
  system,
  userContent,
}: AskModelInput): Promise<string> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    // Short, well-specified task — low effort keeps latency and cost down.
    output_config: { effort: 'low' },
    messages: [{ role: 'user', content: userContent }],
  })

  // A refusal is the correct outcome for unsafe input that slipped past the
  // deterministic gate, so it is surfaced rather than routed to a fallback
  // model that might answer the question instead.
  if (response.stop_reason === 'refusal') {
    throw new TutorRefusalError()
  }

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()
}
