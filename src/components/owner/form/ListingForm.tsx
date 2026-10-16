"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { AMENITIES } from "@/config/amenities";
import { AmenityToggle } from "@/components/filters/AmenityToggle";
import { ListingFields } from "@/components/owner/form/ListingFields";
import { LocationPicker } from "@/components/owner/form/LocationPicker";
import { RoomsEditor } from "@/components/owner/form/RoomsEditor";
import { Spinner } from "@/components/ui/Spinner";
import {
  emptyListingForm,
  type ListingFormValues,
} from "@/components/owner/form/types";
import type { ListingFormState } from "@/lib/owner/actions";

type FormAction = (
  state: ListingFormState,
  formData: FormData,
) => Promise<ListingFormState>;

interface Props {
  action: FormAction;
  initialValues?: ListingFormValues;
  submitLabel: string;
  roomLimit?: number;
  planName?: string;
  // Tutorial sandbox: render the real form but never submit to the server.
  tutorial?: boolean;
}

function Section({
  title,
  description,
  tour,
  children,
}: {
  title: string;
  description?: string;
  tour?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-tour={tour}
      className="rounded-2xl border border-neutral-200 bg-white p-5"
    >
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// The create/edit form. It keeps the whole listing in React state and submits it as
// one JSON payload, so the server validates a single well-formed object.
export function ListingForm({
  action,
  initialValues,
  submitLabel,
  tutorial = false,
  roomLimit = 2,
  planName = "Default",
}: Props) {
  const [values, setValues] = useState<ListingFormValues>(
    initialValues ?? emptyListingForm(),
  );
  const [submitted, setSubmitted] = useState(false);
  const [state, formAction, pending] = useActionState(action, {});
  const initialSnapshot = useMemo(
    () => JSON.stringify(initialValues ?? emptyListingForm()),
    [initialValues],
  );
  const isDirty =
    !tutorial &&
    !(submitted && pending) &&
    JSON.stringify(values) !== initialSnapshot;

  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) =>
      event.preventDefault();
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  const update = (patch: Partial<ListingFormValues>) =>
    setValues((current) => ({ ...current, ...patch }));

  const toggleAmenity = (key: string) =>
    update({
      amenityKeys: values.amenityKeys.includes(key)
        ? values.amenityKeys.filter((amenity) => amenity !== key)
        : [...values.amenityKeys, key],
    });

  return (
    <form
      action={tutorial ? undefined : formAction}
      onSubmit={
        tutorial ? (event) => event.preventDefault() : () => setSubmitted(true)
      }
      className="space-y-4"
    >
      <input type="hidden" name="payload" value={JSON.stringify(values)} />

      <Section
        title="Details"
        description="The basics students see first — name, address, price, and contact."
      >
        <ListingFields values={values} update={update} />
      </Section>

      <Section
        title="Location"
        description="Tap the map or drag the pin to your exact address."
        tour="lf-location"
      >
        <LocationPicker
          latitude={values.latitude}
          longitude={values.longitude}
          onChange={(latitude, longitude) => update({ latitude, longitude })}
        />
      </Section>

      <Section
        title="Amenities"
        description="Select everything your boarding house offers."
        tour="lf-amenities"
      >
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

      <Section
        title="Rooms"
        description={`${planName} allows up to ${roomLimit} rooms per listing. Vacancy is calculated from these rooms, so keep them accurate.`}
        tour="lf-rooms"
      >
        <RoomsEditor
          rooms={values.rooms}
          roomLimit={roomLimit}
          onChange={(rooms) => update({ rooms })}
        />
      </Section>

      {/* Sticky submit so it stays reachable on long forms. Hidden during the tutorial —
          the guided tour handles the (simulated) publish, so nothing can be saved. */}
      {!tutorial && (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur">
          {state.error && (
            <p
              role="alert"
              className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 sm:w-auto"
          >
            {pending && <Spinner />}
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
