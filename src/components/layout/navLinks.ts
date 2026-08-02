// Shared primary navigation, used by both desktop and mobile.
export interface NavLink {
  href: string;
  label: string;
}

const BASE_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/#explore", label: "Explore" },
  { href: "/#map", label: "Map" },
  { href: "/#about", label: "About" },
];

// Pricing is owner-only — students and guests never see it.
const PRICING_LINK: NavLink = { href: "/pricing", label: "Pricing" };

// The nav a given role should see. Pricing is inserted before About for owners only.
export function navLinksFor(role: string | null | undefined): NavLink[] {
  if (role !== "OWNER") return BASE_LINKS;
  const links = [...BASE_LINKS];
  links.splice(3, 0, PRICING_LINK); // before About
  return links;
}

// Back-compat export for any caller that just needs the guest set.
export const NAV_LINKS = BASE_LINKS;
