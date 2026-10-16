import { ADMIN_CONTACT } from "@/config/support";

// Shown across the owner area when an admin has frozen the account. Listings stay live
// publicly; the owner just can't manage anything until it's unfrozen.
export function OwnerFrozenNotice() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-sky-200 bg-sky-50 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path strokeLinecap="round" d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-neutral-900">Account temporarily frozen</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Your owner account has been frozen by the administrator, so you can&apos;t manage listings
        right now. Your existing listings stay visible to students. Please contact the administrator
        to restore access.
      </p>
      <dl className="mt-4 space-y-1 text-sm text-neutral-700">
        <div className="flex justify-center gap-2">
          <dt className="font-medium">Email:</dt>
          <dd>
            <a href={`mailto:${ADMIN_CONTACT.email}`} className="text-sky-700 underline">
              {ADMIN_CONTACT.email}
            </a>
          </dd>
        </div>
        <div className="flex justify-center gap-2">
          <dt className="font-medium">Phone:</dt>
          <dd>{ADMIN_CONTACT.phone}</dd>
        </div>
      </dl>
    </div>
  );
}
