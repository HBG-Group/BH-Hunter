"use client";

import { MAX_MONTHLY_PRICE } from "@/lib/validation/listing";
import { ContactNumbersEditor } from "@/components/owner/form/ContactNumbersEditor";
import type { ListingFormValues } from "@/components/owner/form/types";
import type { GenderPolicy } from "@/types/domain";

interface Props {
  values: ListingFormValues;
  update: (patch: Partial<ListingFormValues>) => void;
}

const input =
  "w-full min-w-0 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400";

function Label({
  text,
  hint,
  children,
}: {
  text: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-600">{text}</span>
      {children}
      {hint && <span className="block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  );
}

// Keep numbers inside sane bounds while typing.
const bound = (raw: string, min: number, max: number) =>
  Math.min(max, Math.max(min, Number(raw) || 0));

// The plain text/number fields of a listing. Rooms and amenities are handled by
// their own editors — kept out of here so this file stays about simple inputs.
export function ListingFields({ values, update }: Props) {
  return (
    <div className="space-y-3">
      <Label text="Boarding house name" hint="3–120 characters.">
        <input
          data-tour="lf-name"
          className={input}
          value={values.name}
          maxLength={120}
          required
          onChange={(e) => update({ name: e.target.value })}
        />
      </Label>

      <Label text="Address" hint="Street or purok, barangay, city.">
        <input
          data-tour="lf-address"
          className={input}
          value={values.addressLine}
          maxLength={160}
          required
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
        <Label text="Rent / mo" hint="In pesos.">
          <input
            data-tour="lf-price"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_MONTHLY_PRICE}
            className={input}
            value={values.priceMonthly}
            onChange={(e) => update({ priceMonthly: bound(e.target.value, 0, MAX_MONTHLY_PRICE) })}
          />
        </Label>
        <Label text="Advance (mo)" hint="0–12.">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={12}
            className={input}
            value={values.advanceMonths}
            onChange={(e) => update({ advanceMonths: bound(e.target.value, 0, 12) })}
          />
        </Label>
        <Label text="Deposit (mo)" hint="0–12.">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={12}
            className={input}
            value={values.depositMonths}
            onChange={(e) => update({ depositMonths: bound(e.target.value, 0, 12) })}
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
        <Label text="Curfew (optional)" hint="Leave blank for N/A.">
          <input
            type="time"
            className={input}
            value={values.curfew}
            onChange={(e) => update({ curfew: e.target.value })}
          />
        </Label>
        <Label text="Email (optional)">
          <input
            type="email"
            className={input}
            value={values.contactEmail}
            maxLength={160}
            onChange={(e) => update({ contactEmail: e.target.value })}
          />
        </Label>
      </div>

      <div data-tour="lf-contact">
        <ContactNumbersEditor
          numbers={values.contactNumbers}
          onChange={(contactNumbers) => update({ contactNumbers })}
        />
      </div>

      <Label text="Messenger URL (optional)" hint="Full link (https://…).">
        <input
          type="url"
          className={input}
          value={values.messengerUrl}
          maxLength={300}
          placeholder="https://m.me/yourpage"
          onChange={(e) => update({ messengerUrl: e.target.value })}
        />
      </Label>

      <Label text="House rules (optional)" hint="Max 1000 characters.">
        <textarea
          className={input}
          rows={3}
          maxLength={1000}
          value={values.houseRules}
          onChange={(e) => update({ houseRules: e.target.value })}
        />
      </Label>
    </div>
  );
}
