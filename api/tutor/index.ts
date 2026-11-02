import { handleTutorRequest } from './handler.js'
import { askClaude } from './claudeClient.js'
import { TUTOR_SYSTEM_PROMPT } from './systemPrompt.js'

/** Web-standard adapter (Vercel / Netlify / Cloudflare style).
 *
 * All provider-specific runtime code stays here; `handleTutorRequest` is kept
 * framework-neutral so it can be unit tested without an HTTP runtime.
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text()

  const result = await handleTutorRequest(
    { method: request.method, body: rawBody },
    { askModel: askClaude, systemPrompt: TUTOR_SYSTEM_PROMPT },
  )

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: {
      'content-type': 'application/json',
      // Transcripts are per-session and stored client-side; nothing here is
      // cacheable or shareable between students.
      'cache-control': 'no-store',
    },
  })
}

export default POST
