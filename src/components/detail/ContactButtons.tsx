"use client";

import { logContactClickAction } from "@/lib/analytics/actions";

interface Props {
  boardingHouseId: string;
  contactPhone: string;
  messengerUrl: string | null;
  contactEmail: string | null;
}

// The contact links. Clicking any of them records a CONTACT_CLICK for the owner's
// analytics (fire-and-forget — it never blocks opening the phone/messenger app).
export function ContactButtons({ boardingHouseId, contactPhone, messengerUrl, contactEmail }: Props) {
  const track = () => void logContactClickAction(boardingHouseId);

  return (
    <div className="mt-4 space-y-2">
      <a
        href={`tel:${contactPhone}`}
        onClick={track}
        className="block rounded-xl bg-neutral-900 py-2.5 text-center text-sm font-medium text-white hover:bg-neutral-800"
      >
        Call {contactPhone}
      </a>
      {messengerUrl && (
        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={track}
          className="block rounded-xl bg-white py-2.5 text-center text-sm font-medium text-neutral-800 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
        >
          Message on Messenger
        </a>
      )}
      {contactEmail && (
        <a
          href={`mailto:${contactEmail}`}
          onClick={track}
          className="block rounded-xl bg-white py-2.5 text-center text-sm font-medium text-neutral-800 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
        >
          Email owner
        </a>
      )}
    </div>
  );
}
