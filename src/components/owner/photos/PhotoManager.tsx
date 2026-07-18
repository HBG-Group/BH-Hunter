"use client";

import Image from "next/image";
import { useActionState, useTransition } from "react";
import { deletePhotoAction, uploadPhotosAction, type PhotoFormState } from "@/lib/owner/photo-actions";

export interface PhotoItem {
  id: string;
  url: string;
}

interface Props {
  boardingHouseId: string;
  images: PhotoItem[];
}

export function PhotoManager({ boardingHouseId, images }: Props) {
  const uploadAction = uploadPhotosAction.bind(null, boardingHouseId);
  const [state, formAction, uploading] = useActionState<PhotoFormState, FormData>(uploadAction, {});
  const [pendingDelete, startDelete] = useTransition();

  return (
    <div className="space-y-5">
      <form action={formAction} className="rounded-2xl border border-neutral-200 bg-white p-5">
        <label className="block text-sm font-medium text-neutral-700">Add photos</label>
        <p className="mb-3 text-xs text-neutral-500">JPG or PNG, up to 5 MB each. You can pick several at once.</p>

        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          required
          className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-800"
        />

        {state.error && <p className="mt-2 text-sm text-rose-600">{state.error}</p>}
        {state.success && <p className="mt-2 text-sm text-emerald-600">Photos uploaded.</p>}

        <button
          type="submit"
          disabled={uploading}
          className="mt-3 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-neutral-500">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <div key={image.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
              <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
              <button
                onClick={() => startDelete(() => deletePhotoAction(boardingHouseId, image.id))}
                disabled={pendingDelete}
                className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs text-rose-600 opacity-0 backdrop-blur transition group-hover:opacity-100 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
