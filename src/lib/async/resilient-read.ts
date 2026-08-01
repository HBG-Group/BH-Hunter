import { retryIdempotent } from "@/lib/async/retry";
import { withTimeout } from "@/lib/async/timeout";

export interface ResilientReadOptions {
  attempts?: number;
  timeoutMs?: number;
  timeoutMessage?: string;
}

// Server-rendered reads are safe to repeat. Mutations must never use this helper,
// because retrying them can duplicate state changes or external side effects.
export function resilientRead<T>(
  operation: () => Promise<T>,
  {
    attempts = 2,
    timeoutMs = 5_000,
    timeoutMessage = "A dependency did not respond in time",
  }: ResilientReadOptions = {},
): Promise<T> {
  return retryIdempotent(
    () => withTimeout(operation(), timeoutMs, timeoutMessage),
    attempts,
  );
}
