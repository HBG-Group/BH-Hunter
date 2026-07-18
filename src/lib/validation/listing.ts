import { z } from "zod";
import { AMENITY_KEYS } from "@/config/amenities";

// One room row inside the listing form. Occupied can't exceed capacity.
export const roomSchema = z
  .object({
    label: z.string().trim().min(1, "Room name is required").max(60),
    capacity: z.coerce.number().int().min(1).max(50),
    occupied: z.coerce.number().int().min(0).max(50),
    priceMonthly: z.coerce.number().int().positive().optional(),
  })
  .refine((room) => room.occupied <= room.capacity, {
    message: "Occupied cannot exceed capacity",
    path: ["occupied"],
  });

export const listingSchema = z.object({
  name: z.string().trim().min(3, "Name is too short").max(120),
  addressLine: z.string().trim().min(3).max(160),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),

  genderPolicy: z.enum(["MALE", "FEMALE", "MIXED"]),
  priceMonthly: z.coerce.number().int().positive(),
  advanceMonths: z.coerce.number().int().min(0).max(12).default(1),
  depositMonths: z.coerce.number().int().min(0).max(12).default(1),
  utilitiesIncluded: z.coerce.boolean().default(false),
  internetIncluded: z.coerce.boolean().default(false),

  curfew: z.string().trim().max(40).optional(),
  houseRules: z.string().trim().max(1000).optional(),

  contactPhone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  messengerUrl: z.string().trim().url().optional().or(z.literal("")),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),

  amenityKeys: z.array(z.enum(AMENITY_KEYS as [string, ...string[]])).default([]),
  rooms: z.array(roomSchema).min(1, "Add at least one room"),
});

export type ListingInput = z.infer<typeof listingSchema>;
