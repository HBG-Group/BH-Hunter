// Turn a listing name into a URL-safe slug. Uniqueness is resolved deterministically
// against the database (sunrise-house -> sunrise-house-2), so creation never fails on
// a duplicate name.

export function slugifyBase(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  // Names made entirely of punctuation or non-latin script would slug to "".
  return base === "" ? "listing" : base;
}

/**
 * Picks the first free slug: the base, then base-2, base-3, ... `isTaken` is supplied
 * by the data layer so this stays free of database imports.
 */
export async function uniqueSlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>,
  maxAttempts = 50,
): Promise<string> {
  const base = slugifyBase(name);
  if (!(await isTaken(base))) return base;

  for (let suffix = 2; suffix <= maxAttempts; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  // Pathological case only — fall back to a random suffix rather than failing.
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
