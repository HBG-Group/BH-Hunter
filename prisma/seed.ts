// Seed data for local development. Real-shaped boarding houses positioned around
// VSU Main Campus so the map and listings have something believable to render.
// Run with: npm run db:seed

import { PrismaClient } from "@prisma/client";
import { AMENITIES } from "../src/config/amenities";

const prisma = new PrismaClient();

const OWNER_ID = "seed-owner-0001";

// Believable demo photos: real images themed by room type, locked so each listing
// keeps the same set. Five per listing to meet the published-listing minimum.
export const PHOTO_THEMES = ["bedroom", "house", "kitchen", "bathroom", "apartment"];

export const photoUrl = (theme: string, lock: number) =>
  `https://loremflickr.com/1200/800/${theme}?lock=${lock}`;

// Coordinates cluster around VSU Main (Visca, Baybay, Leyte).
const listings = [
  {
    slug: "casa-verde-boarding-house",
    name: "Casa Verde Boarding House",
    addressLine: "Purok 5, Pangasugan, Baybay City",
    latitude: 10.7461,
    longitude: 124.7961,
    genderPolicy: "MIXED" as const,
    priceMonthly: 1500,
    utilitiesIncluded: false,
    internetIncluded: true,
    curfew: "10:00 PM",
    houseRules: "No smoking indoors. Visitors until 9 PM.",
    contactPhone: "0917-555-0142",
    amenities: ["wifi", "laundry", "study_area", "shared_bathroom", "kitchen"],
    rooms: [
      { label: "Room A", capacity: 4, occupied: 2, priceMonthly: 1500 },
      { label: "Room B", capacity: 4, occupied: 4, priceMonthly: 1500 },
      { label: "Room C", capacity: 2, occupied: 1, priceMonthly: 1800 },
    ],
    nearby: [
      { category: "CONVENIENCE_STORE" as const, name: "Visca Mini Mart", walkMinutes: 3 },
      { category: "WATER_REFILL" as const, name: "AquaFresh Refilling", walkMinutes: 4 },
    ],
  },
  {
    slug: "student-nest-dormitory",
    name: "Student Nest Dormitory",
    addressLine: "Gabas Road, near VSU Gate 2",
    latitude: 10.7438,
    longitude: 124.7989,
    genderPolicy: "FEMALE" as const,
    priceMonthly: 2000,
    utilitiesIncluded: true,
    internetIncluded: true,
    curfew: "9:30 PM",
    houseRules: "Female only. Quiet hours after 10 PM.",
    contactPhone: "0918-555-0173",
    amenities: ["wifi", "aircon", "study_area", "private_bathroom", "laundry"],
    rooms: [
      { label: "Suite 1", capacity: 2, occupied: 2, priceMonthly: 2500 },
      { label: "Suite 2", capacity: 2, occupied: 2, priceMonthly: 2500 },
      { label: "Shared 1", capacity: 6, occupied: 5, priceMonthly: 2000 },
    ],
    nearby: [
      { category: "PRINTING_SHOP" as const, name: "QuickPrint VSU", walkMinutes: 2 },
      { category: "CAFE" as const, name: "Brew Station", walkMinutes: 5 },
    ],
  },
  {
    slug: "haven-residences",
    name: "Haven Residences",
    addressLine: "Purok 3, Pangasugan, Baybay City",
    latitude: 10.7475,
    longitude: 124.7948,
    genderPolicy: "MALE" as const,
    priceMonthly: 1200,
    utilitiesIncluded: false,
    internetIncluded: false,
    curfew: null,
    houseRules: "No curfew. Keep common areas clean.",
    contactPhone: "0916-555-0199",
    amenities: ["parking", "shared_bathroom", "kitchen", "visitors_allowed"],
    rooms: [
      { label: "Unit 1", capacity: 3, occupied: 0, priceMonthly: 1200 },
      { label: "Unit 2", capacity: 3, occupied: 1, priceMonthly: 1200 },
    ],
    nearby: [
      { category: "JEEPNEY_STOP" as const, name: "Pangasugan Terminal", walkMinutes: 6 },
      { category: "PHARMACY" as const, name: "Baybay MedPlus", walkMinutes: 8 },
    ],
  },
  {
    slug: "sunrise-student-house",
    name: "Sunrise Student House",
    addressLine: "Near VSU Main Gate, Visca",
    latitude: 10.7447,
    longitude: 124.7969,
    genderPolicy: "MIXED" as const,
    priceMonthly: 1800,
    utilitiesIncluded: true,
    internetIncluded: true,
    curfew: "11:00 PM",
    houseRules: "Guests sign in at the front desk.",
    contactPhone: "0917-555-0288",
    amenities: ["wifi", "aircon", "laundry", "study_area", "private_bathroom", "parking"],
    rooms: [
      { label: "Deluxe 1", capacity: 1, occupied: 1, priceMonthly: 3000 },
      { label: "Standard 1", capacity: 4, occupied: 3, priceMonthly: 1800 },
      { label: "Standard 2", capacity: 4, occupied: 4, priceMonthly: 1800 },
    ],
    nearby: [
      { category: "ATM" as const, name: "LandBank VSU", walkMinutes: 4 },
      { category: "CLINIC" as const, name: "VSU Health Center", walkMinutes: 5 },
    ],
  },
];

async function main() {
  // Amenity catalog first — listings reference these by key.
  for (const amenity of AMENITIES) {
    await prisma.amenity.upsert({
      where: { key: amenity.key },
      update: { label: amenity.label },
      create: amenity,
    });
  }

  // A demo owner that all seed listings belong to.
  await prisma.profile.upsert({
    where: { id: OWNER_ID },
    update: {},
    create: {
      id: OWNER_ID,
      role: "OWNER",
      fullName: "Demo Owner",
      email: "owner@meino.local",
      phone: "0917-555-0000",
    },
  });

  for (const [listingIndex, listing] of listings.entries()) {
    const { amenities, rooms, nearby, ...core } = listing;

    // Start clean so re-running the seed is safe (idempotent).
    await prisma.boardingHouse.deleteMany({ where: { slug: core.slug } });

    const created = await prisma.boardingHouse.create({
      data: {
        ...core,
        ownerId: OWNER_ID,
        status: "PUBLISHED",
        verifiedAt: new Date(),
        lastConfirmedAt: new Date(),
        rooms: { create: rooms },
        nearbyPlaces: { create: nearby },
        images: {
          create: PHOTO_THEMES.map((theme, index) => ({
            url: photoUrl(theme, listingIndex * 10 + index + 1),
            alt: `${core.name} — ${theme}`,
            sortOrder: index,
          })),
        },
      },
    });

    // Link amenities through the join table.
    const amenityRows = await prisma.amenity.findMany({ where: { key: { in: amenities } } });
    await prisma.boardingHouseAmenity.createMany({
      data: amenityRows.map((amenity) => ({
        boardingHouseId: created.id,
        amenityId: amenity.id,
      })),
    });
  }

  console.log(`Seeded ${listings.length} boarding houses.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
