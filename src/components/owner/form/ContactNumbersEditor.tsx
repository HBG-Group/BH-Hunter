"use client";

import { PHONE_MAX_DIGITS, MAX_CONTACT_NUMBERS, CARRIER_MAX_LENGTH } from "@/lib/validation/listing";
import type { ContactNumber } from "@/lib/contact/phones";

interface Props {
  numbers: ContactNumber[];
  onChange: (numbers: ContactNumber[]) => void;
}

const cell =
  "w-full min-w-0 rounded-lg border border-neutral-200 px-2.5 py-2 text-sm outline-none focus:border-neutral-400";

// Lets an owner list several contact numbers, each with its SIM carrier
// (e.g. 09123456781 – SMART). At least one is required; up to MAX_CONTACT_NUMBERS.
export function ContactNumbersEditor({ numbers, onChange }: Props) {
  const update = (index: number, patch: Partial<ContactNumber>) =>
    onChange(numbers.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));

  const add = () => onChange([...numbers, { number: "", carrier: "" }]);
  const remove = (index: number) => onChange(numbers.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-neutral-600">Contact numbers</span>

      {numbers.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={PHONE_MAX_DIGITS}
            className={`${cell} flex-[2]`}
            value={entry.number}
            placeholder="09171234567"
            aria-label={`Contact number ${index + 1}`}
            onChange={(e) =>
              update(index, { number: e.target.value.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS) })
            }
          />
          <input
            type="text"
            maxLength={CARRIER_MAX_LENGTH}
            className={`${cell} flex-1`}
            value={entry.carrier}
            placeholder="SIM (e.g. SMART)"
            aria-label={`SIM carrier for number ${index + 1}`}
            onChange={(e) => update(index, { carrier: e.target.value })}
          />
          {numbers.length > 1 && (
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove number ${index + 1}`}
              className="shrink-0 rounded-lg px-2 py-1 text-sm text-rose-600 hover:bg-rose-50"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {numbers.length < MAX_CONTACT_NUMBERS && (
        <button
          type="button"
          onClick={add}
          className="text-sm font-medium text-neutral-600 underline hover:text-neutral-900"
        >
          + Add Number
        </button>
      )}
    </div>
  );
}
