import { z } from "zod";
import { AMENITY_KEYS } from "@/config/amenities";

// Sensible upper bounds so a typo can't create nonsense data.
export const MAX_MONTHLY_PRICE = 100_000;
export const MAX_ROOMS = 50;
export const PHONE_MAX_DIGITS = 11;

// One room row inside the listing form. Occupied can't exceed capacity.
export const roomSchema = z
  .object({
    label: z.string().trim().min(1, "Room name is required").max(60),
    capacity: z.coerce.number().int().min(1, "At least 1 bed").max(50),
    occupied: z.coerce.number().int().min(0).max(50),
    priceMonthly: z.coerce.number().int().positive().max(MAX_MONTHLY_PRICE).optional(),
  })
  .refine((room) => room.occupied <= room.capacity, {
    message: "Occupied cannot exceed capacity",
    path: ["occupied"],
  });

// Digits only, at most 11 (e.g. 09171234567).
const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((digits) => digits.length >= 7 && digits.length <= PHONE_MAX_DIGITS, {
    message: `Enter 7–${PHONE_MAX_DIGITS} digits, e.g. 09171234567`,
  });

export const listingSchema = z.object({
  name: z.string().trim().min(3, "Name is too short").max(120),
  addressLine: z.string().trim().min(5, "Address is too short").max(160),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),

  genderPolicy: z.enum(["MALE", "FEMALE", "MIXED"]),
  priceMonthly: z.coerce
    .number()
    .int("Whole pesos only")
    .min(1, "Enter a monthly rent")
    .max(MAX_MONTHLY_PRICE, "That rent looks too high"),
  advanceMonths: z.coerce.number().int().min(0).max(12).default(1),
  depositMonths: z.coerce.number().int().min(0).max(12).default(1),
  utilitiesIncluded: z.coerce.boolean().default(false),
  internetIncluded: z.coerce.boolean().default(false),

  curfew: z.string().trim().max(40).optional(),
  houseRules: z.string().trim().max(1000, "Keep house rules under 1000 characters").optional(),

  contactPhone: phoneSchema,
  messengerUrl: z.string().trim().url("Enter a full link (https://…)").max(300).optional().or(z.literal("")),
  contactEmail: z.string().trim().email("Enter a valid email").max(160).optional().or(z.literal("")),

  amenityKeys: z.array(z.enum(AMENITY_KEYS as [string, ...string[]])).default([]),
  rooms: z.array(roomSchema).min(1, "Add at least one room").max(MAX_ROOMS),
});

export type ListingInput = z.infer<typeof listingSchema>;
