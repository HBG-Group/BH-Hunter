export const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Returns the only error text that may be sent to a client. */
export function clientErrorMessage(reference: string): string {
  return `${GENERIC_ERROR} (ref ${reference})`;
}
