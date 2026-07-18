// Shared vocabulary for the whole app. These string unions mirror the enums in
// prisma/schema.prisma. Keeping them here lets UI code import types without pulling
// in Prisma (which must stay on the server side only).

export type Role = "STUDENT" | "OWNER" | "ADMIN";

export type GenderPolicy = "MALE" | "FEMALE" | "MIXED";

export type ListingStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";

// Derived from room occupancy — never stored directly, always computed.
export type AvailabilityState = "AVAILABLE" | "ALMOST_FULL" | "FULL";

export type ImageType = "PHOTO" | "TOUR_360";

export type NearbyCategory =
  | "LAUNDRY"
  | "CONVENIENCE_STORE"
  | "CAFE"
  | "WATER_REFILL"
  | "PRINTING_SHOP"
  | "PHARMACY"
  | "ATM"
  | "JEEPNEY_STOP"
  | "CLINIC";

export type ViewingRequestStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";

export type AnalyticsEventType = "VIEW" | "CONTACT_CLICK" | "FAVORITE" | "VIEWING_REQUEST";
