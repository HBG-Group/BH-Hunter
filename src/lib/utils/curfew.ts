// The curfew is stored as a 24-hour "HH:MM" string from the form's time input. When
// an owner leaves it blank it's stored as null and shown as "N/A". This formats the
// stored value into a friendly 12-hour label for display.
export function formatCurfew(raw: string | null | undefined): string {
  if (!raw) return "N/A";

  const match = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!match) return raw; // legacy free-text curfews are shown as-is

  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${period}`;
}
