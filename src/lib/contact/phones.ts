// One boarding house can list several contact numbers, each with its SIM carrier.
// These are stored as a JSON array in the existing `contactPhone` column, so no schema
// change is needed. Listings created before this feature stored a single plain digit
// string — parse falls back to that, so old data keeps working.

export interface ContactNumber {
  number: string; // digits only
  carrier: string; // free text (e.g. "SMART"), may be empty
}

// Read the stored value into a clean list. Handles both the new JSON array and the
// old single-string format.
export function parseContactNumbers(raw: string | null | undefined): ContactNumber[] {
  if (!raw) return [];
  const trimmed = raw.trim();

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => ({
            number: String(item?.number ?? "").replace(/\D/g, ""),
            carrier: String(item?.carrier ?? "").trim(),
          }))
          .filter((entry) => entry.number.length > 0);
      }
    } catch {
      // Not valid JSON — treat it as a legacy plain-string number below.
    }
  }

  const digits = trimmed.replace(/\D/g, "");
  return digits ? [{ number: digits, carrier: "" }] : [];
}

// Turn the form's list into the string stored in the database.
export function serializeContactNumbers(list: ContactNumber[]): string {
  return JSON.stringify(
    list
      .map((entry) => ({ number: entry.number.replace(/\D/g, ""), carrier: entry.carrier.trim() }))
      .filter((entry) => entry.number.length > 0),
  );
}

// "09123456781 - SMART", or just the number when no carrier was given.
export function formatContactNumber(entry: ContactNumber): string {
  return entry.carrier ? `${entry.number} - ${entry.carrier}` : entry.number;
}
