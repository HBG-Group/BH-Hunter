import "server-only";
import { clientErrorMessage, GENERIC_ERROR } from "@/lib/security/errors-core";

// Keep internals off the client. Prisma codes, Supabase messages, connection strings
// and stack traces all leak schema detail, so actions return a generic message and the
// real error is logged server-side only.

export { GENERIC_ERROR };

let counter = 0;

// Short id so a user-facing message can be matched to a server log line.
function nextRef(): string {
  counter = (counter + 1) % 100000;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

/**
 * Logs the real error with a reference and returns a safe message for the client.
 * Never pass the returned string anything derived from the caught error.
 */
export function reportError(context: string, error: unknown): string {
  const ref = nextRef();
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`[${ref}] ${context}: ${detail}`);
  if (error instanceof Error && error.stack) console.error(error.stack);
  return clientErrorMessage(ref);
}

// Wraps an action body so no unexpected throw ever reaches the client verbatim.
export async function guarded<T>(
  context: string,
  run: () => Promise<T>,
  onError: (message: string) => T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    return onError(reportError(context, error));
  }
}
