import { z } from "zod";

const rating = z.coerce.number().int().min(1).max(5);

// A review scores several aspects 1–5, plus an optional written note. The overall
// score is computed from the aspects so it always matches them.
export const reviewSchema = z.object({
  cleanliness: rating,
  internet: rating,
  safety: rating,
  noiseLevel: rating,
  waterSupply: rating,
  ownerFriendliness: rating,
  body: z.string().trim().max(1000).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const REVIEW_ASPECTS = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "internet", label: "Internet" },
  { key: "safety", label: "Safety" },
  { key: "noiseLevel", label: "Noise level" },
  { key: "waterSupply", label: "Water supply" },
  { key: "ownerFriendliness", label: "Owner friendliness" },
] as const;
