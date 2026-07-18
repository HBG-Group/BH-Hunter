"use client";

import type { ListingFormValues } from "@/components/owner/form/types";
import type { GenderPolicy } from "@/types/domain";

interface Props {
  values: ListingFormValues;
  update: (patch: Partial<ListingFormValues>) => void;
}

const input =
  "w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400";

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-600">{text}</span>
      {children}
    </label>
  );
}

// The plain text/number fields of a listing. Rooms and amenities are handled by
// their own editors — kept out of here so this file stays about simple inputs.
export function ListingFields({ values, update }: Props) {
  return (
    <div className="space-y-3">
      <Label text="Boarding house name">
        <input className={input} value={values.name} onChange={(e) => update({ name: e.target.value })} />
      </Label>

      <Label text="Address">
        <input
          className={input}
          value={values.addressLine}
          onChange={(e) => update({ addressLine: e.target.value })}
        />
      </Label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Label text="Gender">
          <select
            className={input}
            value={values.genderPolicy}
            onChange={(e) => update({ genderPolicy: e.target.value as GenderPolicy })}
          >
            <option value="MIXED">Mixed</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </Label>
        <Label text="Rent / mo">
          <input
            type="number"
            className={input}
            value={values.priceMonthly}
            onChange={(e) => update({ priceMonthly: Number(e.target.value) })}
          />
        </Label>
        <Label text="Advance (mo)">
          <input
            type="number"
            className={input}
            value={values.advanceMonths}
            onChange={(e) => update({ advanceMonths: Number(e.target.value) })}
          />
        </Label>
        <Label text="Deposit (mo)">
          <input
            type="number"
            className={input}
            value={values.depositMonths}
            onChange={(e) => update({ depositMonths: Number(e.target.value) })}
          />
        </Label>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={values.utilitiesIncluded}
            onChange={(e) => update({ utilitiesIncluded: e.target.checked })}
          />
          Utilities included
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={values.internetIncluded}
            onChange={(e) => update({ internetIncluded: e.target.checked })}
          />
          Internet included
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Label text="Curfew (optional)">
          <input className={input} value={values.curfew} onChange={(e) => update({ curfew: e.target.value })} />
        </Label>
        <Label text="Contact phone">
          <input
            className={input}
            value={values.contactPhone}
            onChange={(e) => update({ contactPhone: e.target.value })}
          />
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Label text="Messenger URL (optional)">
          <input
            className={input}
            value={values.messengerUrl}
            onChange={(e) => update({ messengerUrl: e.target.value })}
          />
        </Label>
        <Label text="Email (optional)">
          <input
            className={input}
            value={values.contactEmail}
            onChange={(e) => update({ contactEmail: e.target.value })}
          />
        </Label>
      </div>

      <Label text="House rules (optional)">
        <textarea
          className={input}
          rows={3}
          value={values.houseRules}
          onChange={(e) => update({ houseRules: e.target.value })}
        />
      </Label>
    </div>
  );
}
