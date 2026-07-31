export async function retryIdempotent<T>(
  operation: () => Promise<T>,
  attempts = 2,
): Promise<T> {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("Retry attempts must be a positive integer");
  }

  // Callers must opt in only for reads or other idempotent operations. Never use
  // this helper for mutations, where repeating a request can duplicate side effects.
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
