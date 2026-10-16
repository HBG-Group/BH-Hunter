import Link from "next/link";
import { subscriptionState, type SubscriptionState } from "@/lib/owner/subscription";

interface Props {
  status: string;
  expiresAt: Date | null;
}

function dateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Nudges an owner to renew once their 5-month subscription is lapsing or has lapsed.
// Silent while the subscription is comfortably active or was never set.
export function SubscriptionBanner({ status, expiresAt }: Props) {
  const state: SubscriptionState = subscriptionState({ status, expiresAt });
  if (state === "NONE" || state === "ACTIVE" || !expiresAt) return null;

  const expired = state === "EXPIRED";
  const tone = expired
    ? "border-rose-200 bg-rose-50 text-rose-800"
    : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${tone}`}>
      <div className="text-sm">
        <p className="font-medium">
          {expired ? "Your subscription has expired." : "Your subscription is expiring soon."}
        </p>
        <p className="mt-0.5">
          {expired
            ? `It lapsed on ${dateLabel(expiresAt)}. Re-subscribe to keep your plan's perks.`
            : `It expires on ${dateLabel(expiresAt)}. Renew now to avoid interruption.`}
        </p>
      </div>
      <Link
        href="/pricing"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
      >
        Re-subscribe
      </Link>
    </div>
  );
}
