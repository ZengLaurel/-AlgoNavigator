import { readFileSync } from 'node:fs'

/** The prompt is read from the versioned markdown file rather than inlined so
 * it stays reviewable as a document and can never be edited from the client. */
export const TUTOR_SYSTEM_PROMPT = readFileSync(
  new URL('../prompts/tutor-system-prompt.v2.md', import.meta.url),
  'utf8',
)
