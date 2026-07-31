// All the tutorial copy in one place — edit freely. No backend involved.

// STEP 1 — welcome screen bullets.
export const WELCOME_POINTS = [
  "Create listings",
  "Upload photos",
  "Manage viewing requests",
  "Track students",
  "Use your dashboard",
];

// STEP 2 — dashboard tour. Each targets a real element via its data-tour attribute.
export interface TourStep {
  target: string; // matches [data-tour="..."]
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  { target: "dashboard", title: "Your dashboard", body: "Home base for everything — your listings, stats, and settings all live here." },
  { target: "listings", title: "Your listings", body: "Each boarding house you add appears here. Tap a card to edit rooms, photos, and details." },
  { target: "requests", title: "Viewing requests", body: "When a student asks to visit, it shows up here so you can confirm or clear it." },
  { target: "analytics", title: "Analytics", body: "See views, favorites, and contacts — so you know which listings are working." },
  { target: "settings", title: "Settings", body: "Manage verification and your account at the bottom of the dashboard." },
];

// STEP 3/4 — guided practice on the REAL listing form. Each targets a real field via
// its data-tour attribute; `requireInput` steps wait until the owner types something.
export interface FormTourStep {
  target: string; // matches [data-tour="..."] on the real form
  title: string;
  body: string;
  requireInput?: boolean;
}

export const FORM_TOUR_STEPS: FormTourStep[] = [
  { target: "lf-name", title: "Property name", body: "This is what students will see first — make it clear and recognizable.", requireInput: true },
  { target: "lf-address", title: "Address", body: "Help students find you: street or purok, barangay, city.", requireInput: true },
  { target: "lf-price", title: "Monthly rent", body: "Set a fair monthly price in pesos. You can fine-tune per room too.", requireInput: true },
  { target: "lf-contact", title: "Contact numbers", body: "Add the numbers students can reach you on — with the SIM carrier.", requireInput: true },
  { target: "lf-location", title: "Pin your location", body: "Drag the pin to your exact spot so the map is accurate." },
  { target: "lf-amenities", title: "Amenities", body: "Select everything your boarding house offers — WiFi, parking, and more." },
  { target: "lf-rooms", title: "Rooms", body: "Vacancy shown to students is calculated from these, so keep them accurate." },
];

// STEP 7 — getting-started checklist items. `key` maps to a computed boolean.
export const CHECKLIST_ITEMS: { key: string; label: string }[] = [
  { key: "tutorial", label: "Completed tutorial" },
  { key: "listing", label: "Create your first listing" },
  { key: "photos", label: "Upload at least 5 photos" },
  { key: "profile", label: "Complete your owner profile" },
  { key: "request", label: "Receive your first viewing request" },
  { key: "favorite", label: "Receive your first favorite" },
];
