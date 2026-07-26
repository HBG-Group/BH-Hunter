"use client";

import { useActionState } from "react";
import Image from "next/image";
import { createAdAction, type AdFormState } from "@/lib/admin/ad-actions";
import { useAdImageUpload } from "@/hooks/useAdImageUpload";
import { ALLOWED_PHOTO_MIME, MAX_AD_IMAGES, PHOTO_SIZE_HINT } from "@/config/storage";

const field =
  "w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400";

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-600">{text}</span>
      {children}
    </label>
  );
}

// Admin form to add a local business ad. Images upload straight to Storage from the
// gallery; only the verified tickets are submitted with the form.
export function AdForm() {
  const [state, action, pending] = useActionState<AdFormState, FormData>(createAdAction, {});
  const { images, uploading, error: uploadError, addFiles, removeAt } = useAdImageUpload();

  const tickets = JSON.stringify(images.map((i) => ({ claims: i.claims, signature: i.signature })));
  const canSubmit = images.length > 0 && !uploading && !pending;

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
      <Label text="Business / title">
        <input name="title" required maxLength={120} className={field} />
      </Label>
      <Label text="Short description (optional)">
        <input name="description" maxLength={300} className={field} />
      </Label>

      {/* Image upload from gallery — accept restricts the picker, the server + bucket
          enforce image-only and the 5 MB limit. */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-neutral-600">
          Images ({images.length}/{MAX_AD_IMAGES})
        </span>
        <input type="hidden" name="imageTickets" value={tickets} />

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <Image src={img.previewUrl} alt="" fill sizes="120px" className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_AD_IMAGES && (
          <input
            type="file"
            accept={ALLOWED_PHOTO_MIME.join(",")}
            multiple
            disabled={uploading}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) void addFiles(files.slice(0, MAX_AD_IMAGES - images.length));
              e.target.value = "";
            }}
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-800"
          />
        )}
        <p className="text-xs text-neutral-400">{PHOTO_SIZE_HINT}</p>
        {uploading && <p className="text-xs text-neutral-500">Uploading…</p>}
        {uploadError && <p role="alert" className="text-sm text-rose-600">{uploadError}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Label text="Website (optional)">
          <input name="websiteUrl" type="url" maxLength={300} className={field} />
        </Label>
        <Label text="Facebook (optional)">
          <input name="facebookUrl" type="url" maxLength={300} className={field} />
        </Label>
        <Label text="Messenger (optional)">
          <input name="messengerUrl" type="url" maxLength={300} className={field} />
        </Label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Label text="Start (optional)">
          <input name="startAt" type="date" className={field} />
        </Label>
        <Label text="Expires (optional)">
          <input name="expiresAt" type="date" className={field} />
        </Label>
      </div>

      {state.error && <p role="alert" className="text-sm text-rose-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Advertisement created.</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add advertisement"}
      </button>
    </form>
  );
}
