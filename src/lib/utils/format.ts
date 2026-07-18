// Small pure formatters used across the UI. Keeping them here avoids re-writing the
// same peso/relative-time logic in every component.

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount);
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
});

// "Jul 20, 2026, 2:00 PM" from a Date.
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

// "Updated 2 hours ago" style text from an ISO timestamp.
export function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) return "Not yet confirmed";

  const then = new Date(isoDate).getTime();
  const minutes = Math.round((Date.now() - then) / 60000);

  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
}
