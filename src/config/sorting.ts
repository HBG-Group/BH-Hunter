// The sort choices offered on the discovery page.
export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price", label: "Price: low to high" },
  { value: "distance", label: "Nearest to campus" },
  { value: "availability", label: "Most available" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortOption = "recommended";
