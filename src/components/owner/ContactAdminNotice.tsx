import { ADMIN_CONTACT } from "@/config/support";

interface Props {
  title: string;
  message: string;
}

// Shown when an owner hits a limit that only the admin can lift (extra listings, or
// arranging the Verified badge payment). Lists the admin's contact details from config.
export function ContactAdminNotice({ title, message }: Props) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">{title}</p>
      <p className="mt-1 text-sm text-amber-800">{message}</p>

      <dl className="mt-3 space-y-1 text-sm text-amber-900">
        <div className="flex gap-2">
          <dt className="font-medium">Email:</dt>
          <dd>
            <a href={`mailto:${ADMIN_CONTACT.email}`} className="underline">
              {ADMIN_CONTACT.email}
            </a>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">Messenger:</dt>
          <dd>
            <a href={ADMIN_CONTACT.messenger} target="_blank" rel="noopener noreferrer" className="underline">
              {ADMIN_CONTACT.messenger}
            </a>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">Phone:</dt>
          <dd>{ADMIN_CONTACT.phone}</dd>
        </div>
      </dl>
    </div>
  );
}
