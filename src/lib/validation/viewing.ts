import { z } from "zod";

// A student proposes a date/time to visit. The datetime-local input gives a string
// like "2026-07-20T14:00", which we coerce into a real Date.
export const viewingRequestSchema = z.object({
  preferredAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), {
    message: "Pick a future date and time",
  }),
  message: z.string().trim().max(500).optional(),
}).strict();

export type ViewingRequestInput = z.infer<typeof viewingRequestSchema>;
