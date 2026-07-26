"use client";

import { logContactClickAction } from "@/lib/analytics/actions";
import { safeExternalUrl, safeMailtoHref, safeTelHref } from "@/lib/security/url";
import { parseContactNumbers, formatContactNumber } from "@/lib/contact/phones";

interface Props {
  boardingHouseId: string;
  contactPhone: string;
  messengerUrl: string | null;
  contactEmail: string | null;
}

const linkClass =
  "block rounded-xl bg-white py-2.5 text-center text-sm font-medium text-neutral-800 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300";

// The contact links. Clicking any of them records a CONTACT_CLICK for the owner's
// analytics (fire-and-forget — it never blocks opening the phone/messenger app).
export function ContactButtons({ boardingHouseId, contactPhone, messengerUrl, contactEmail }: Props) {
  const track = () => void logContactClickAction(boardingHouseId);

  // One listing can have several numbers, each with its SIM carrier.
  const numbers = parseContactNumbers(contactPhone)
    .map((entry) => ({ entry, tel: safeTelHref(entry.number) }))
    .filter((item): item is { entry: (typeof item)["entry"]; tel: string } => item.tel !== null);

  const messenger = safeExternalUrl(messengerUrl);
  const mailto = contactEmail ? safeMailtoHref(contactEmail) : null;

  return (
    <div className="mt-4 space-y-2">
      {numbers.length > 0 ? (
        numbers.map(({ entry, tel }) => (
          <a
            key={entry.number}
            href={tel}
            onClick={track}
            className="block rounded-xl bg-neutral-900 py-2.5 text-center text-sm font-medium text-white hover:bg-neutral-800"
          >
            Call {formatContactNumber(entry)}
          </a>
        ))
      ) : (
        <p className="rounded-xl bg-neutral-100 py-2.5 text-center text-sm text-neutral-500">
          No valid contact number
        </p>
      )}

      {messenger && (
        <a href={messenger} target="_blank" rel="noopener noreferrer" onClick={track} className={linkClass}>
          Message on Messenger
        </a>
      )}

      {mailto && (
        <a href={mailto} onClick={track} className={linkClass}>
          Email owner
        </a>
      )}
    </div>
  );
}
