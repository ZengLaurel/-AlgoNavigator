/** Thrown by the model adapter when the provider declines the request.
 *
 * Lives in its own module so the framework-neutral handler can recognise it
 * without importing the Anthropic SDK (which would drag a provider client
 * into every handler test).
 */
export class TutorRefusalError extends Error {
  constructor() {
    super('model declined')
    this.name = 'TutorRefusalError'
  }
}

export function isTutorRefusal(error: unknown): boolean {
  return error instanceof TutorRefusalError
}
