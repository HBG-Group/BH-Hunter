"use client";

import { useActionState, useState } from "react";
import { AMENITIES } from "@/config/amenities";
import { AmenityToggle } from "@/components/filters/AmenityToggle";
import { ListingFields } from "@/components/owner/form/ListingFields";
import { LocationPicker } from "@/components/owner/form/LocationPicker";
import { RoomsEditor } from "@/components/owner/form/RoomsEditor";
import { emptyListingForm, type ListingFormValues } from "@/components/owner/form/types";
import type { ListingFormState } from "@/lib/owner/actions";

type FormAction = (state: ListingFormState, formData: FormData) => Promise<ListingFormState>;

interface Props {
  action: FormAction;
  initialValues?: ListingFormValues;
  submitLabel: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}

// The create/edit form. It keeps the whole listing in React state and submits it as
// one JSON payload, so the server validates a single well-formed object.
export function ListingForm({ action, initialValues, submitLabel }: Props) {
  const [values, setValues] = useState<ListingFormValues>(initialValues ?? emptyListingForm());
  const [state, formAction, pending] = useActionState(action, {});

  const update = (patch: Partial<ListingFormValues>) =>
    setValues((current) => ({ ...current, ...patch }));

  const toggleAmenity = (key: string) =>
    update({
      amenityKeys: values.amenityKeys.includes(key)
        ? values.amenityKeys.filter((amenity) => amenity !== key)
        : [...values.amenityKeys, key],
    });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="payload" value={JSON.stringify(values)} />

      <Section title="Details">
        <ListingFields values={values} update={update} />
      </Section>

      <Section title="Location">
        <LocationPicker
          latitude={values.latitude}
          longitude={values.longitude}
          onChange={(latitude, longitude) => update({ latitude, longitude })}
        />
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((amenity) => (
            <AmenityToggle
              key={amenity.key}
              label={amenity.label}
              active={values.amenityKeys.includes(amenity.key)}
              onToggle={() => toggleAmenity(amenity.key)}
            />
          ))}
        </div>
      </Section>

      <Section title="Rooms">
        <RoomsEditor rooms={values.rooms} onChange={(rooms) => update({ rooms })} />
      </Section>

      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
