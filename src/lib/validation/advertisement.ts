import { z } from "zod";
import { isSafeExternalUrl } from "@/lib/security/url";

// Optional https link — same allowlist the listing URLs use, so ads can't smuggle a
// javascript: or data: scheme into the homepage.
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || isSafeExternalUrl(v), "Enter a full https:// link")
  .optional()
  .or(z.literal(""));

// Images are handled separately via signed upload tickets, so they aren't in this
// schema — this validates only the text fields and dates of the ad form.
export const advertisementSchema = z
  .object({
    title: z.string().trim().min(2, "Title is too short").max(120),
    description: z.string().trim().max(300).optional().or(z.literal("")),
    websiteUrl: optionalUrl,
    facebookUrl: optionalUrl,
    messengerUrl: optionalUrl,
    startAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
  })
  .refine((ad) => !ad.expiresAt || !ad.startAt || ad.expiresAt > ad.startAt, {
    message: "Expiry must be after the start date",
    path: ["expiresAt"],
  });

export type AdvertisementInput = z.infer<typeof advertisementSchema>;
