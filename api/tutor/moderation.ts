/** Deterministic child-safety boundary for the tutor proxy.
 *
 * Scope decision: this layer only catches *unambiguous* safety and
 * instruction-extraction patterns. Topic scope (redirecting a student who
 * asks about football instead of stacks) is enforced by the system prompt,
 * not by keyword matching here — a keyword topic filter produces false
 * positives on legitimate learner questions ("why did my code crash?"),
 * and silently refusing a real question is worse for a learning tool than
 * paying for one off-topic answer the model will redirect anyway.
 *
 * This is defense in depth, not a replacement for the system prompt or for
 * the manual transcript review planned before any pilot.
 */

export type ModerationVerdict =
  { allowed: true } | { allowed: false; reason: ModerationReason }

export type ModerationReason =
  'empty' | 'too_long' | 'unsafe_content' | 'instruction_extraction'

/** Age-inappropriate topics. Word-boundary anchored to avoid matching inside
 * ordinary words (e.g. "class" must not trip an "ass" pattern). */
const UNSAFE_PATTERNS: RegExp[] = [
  /\b(kill|murder|stab|shoot|strangle)\s+(me|myself|you|him|her|them|someone)\b/i,
  /\b(suicide|self[-\s]?harm|cut\s+myself|hurt\s+myself)\b/i,
  /\b(bomb|explosive|detonat\w*|firearm|handgun|ammunition)\b/i,
  /\bhow\s+(to|do\s+i)\s+(make|build|get)\s+(a\s+)?(gun|bomb|weapon|poison|drug)/i,
  /\b(porn|pornography|nude|naked|sex|sexual|rape)\b/i,
  /\b(cocaine|heroin|meth|marijuana|weed|vape|alcohol|beer|vodka)\b/i,
  /\b(hate|kill)\s+(all\s+)?(jews|muslims|christians|blacks|whites|asians|gays)\b/i,
]

/** Attempts to extract or override the system prompt. */
const INSTRUCTION_EXTRACTION_PATTERNS: RegExp[] = [
  /\bignore\s+(all\s+|your\s+|the\s+)?(previous|prior|earlier|above)\s+(instruction|prompt|rule|direction)/i,
  /\b(disregard|forget|override)\s+(all\s+|your\s+|the\s+)?(previous|prior|earlier|above)?\s*(instruction|prompt|rule)/i,
  /\b(show|tell|reveal|print|repeat|output|give)\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instruction|rule|configuration)/i,
  /\bwhat\s+(are|were)\s+(your|the)\s+(system\s+)?(prompt|instruction|rule)s?\b/i,
  /\byou\s+are\s+now\s+(a|an)\b/i,
  /\b(developer|admin|god)\s+mode\b/i,
  /\bpretend\s+(you\s+are|to\s+be)\s+(not|no\s+longer)\b/i,
  /\bDAN\s+mode\b/i,
]

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

/** Gate run on the student's message *before* any provider call, so unsafe
 * input is never sent off-device and never billed. */
export function checkStudentMessage(
  message: unknown,
  maxChars: number,
): ModerationVerdict {
  if (typeof message !== 'string' || message.trim().length === 0) {
    return { allowed: false, reason: 'empty' }
  }
  if (message.length > maxChars) {
    return { allowed: false, reason: 'too_long' }
  }
  if (matchesAny(message, INSTRUCTION_EXTRACTION_PATTERNS)) {
    return { allowed: false, reason: 'instruction_extraction' }
  }
  if (matchesAny(message, UNSAFE_PATTERNS)) {
    return { allowed: false, reason: 'unsafe_content' }
  }
  return { allowed: true }
}

/** Gate run on the model's reply before it reaches the child. Also rejects a
 * reply that echoes the system prompt back, which is how a successful
 * extraction attempt would surface even if the input gate missed it. */
export function checkTutorReply(reply: unknown): ModerationVerdict {
  if (typeof reply !== 'string' || reply.trim().length === 0) {
    return { allowed: false, reason: 'empty' }
  }
  if (matchesAny(reply, UNSAFE_PATTERNS)) {
    return { allowed: false, reason: 'unsafe_content' }
  }
  if (/system prompt|my instructions are|## Safety rules/i.test(reply)) {
    return { allowed: false, reason: 'instruction_extraction' }
  }
  return { allowed: true }
}
