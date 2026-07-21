"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { deletePhotosAction } from "@/lib/owner/photo-actions";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { MIN_LISTING_PHOTOS, PHOTO_REQUIREMENT_MESSAGE } from "@/config/listing";
import {
  ALLOWED_PHOTO_MIME,
  MAX_PHOTO_BYTES,
  PHOTO_SIZE_HINT,
  isAllowedPhotoMime,
} from "@/config/storage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export interface PhotoItem {
  id: string;
  url: string;
}

interface Props {
  boardingHouseId: string;
  images: PhotoItem[];
}

export function PhotoManager({ boardingHouseId, images }: Props) {
  const { upload, uploading, error: uploadError, clearError } = usePhotoUpload(boardingHouseId);
  const [pendingDelete, startDelete] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [queued, setQueued] = useState<File[]>([]);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleSelect = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = images.length;
  const met = count >= MIN_LISTING_PHOTOS;
  const progress = Math.min(100, (count / MIN_LISTING_PHOTOS) * 100);

  // Validate the picked files for UX only — the server and Storage re-check everything.
  const queue = (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []);
    clearError();

    const rejected = list.find(
      (file) => !isAllowedPhotoMime(file.type) || file.size <= 0 || file.size > MAX_PHOTO_BYTES,
    );
    setSizeError(rejected ? `"${rejected.name}" can't be used. ${PHOTO_SIZE_HINT}` : null);
    setQueued(list);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    queue(event.dataTransfer.files);
  };

  const startUpload = async () => {
    await upload(queued);
    setQueued([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Upload progress toward the minimum */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-900">
            {count} / {MIN_LISTING_PHOTOS} uploaded
          </p>
          <span className={`text-xs font-medium ${met ? "text-emerald-600" : "text-amber-700"}`}>
            {met ? "Minimum met" : `${MIN_LISTING_PHOTOS - count} more needed`}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${met ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {!met && <p className="mt-2 text-xs text-neutral-500">{PHOTO_REQUIREMENT_MESSAGE}</p>}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <label htmlFor="photo-input" className="block text-sm font-medium text-neutral-700">
          Add photos
        </label>
        <p className="mb-3 text-xs text-neutral-500">{PHOTO_SIZE_HINT} You can pick several at once.</p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragging ? "border-primary bg-blue-50/50" : "border-neutral-200"
          }`}
        >
          <p className="text-sm text-neutral-600">Drag photos here, or</p>
          <input
            id="photo-input"
            ref={inputRef}
            type="file"
            accept={ALLOWED_PHOTO_MIME.join(",")}
            multiple
            onChange={(e) => queue(e.target.files)}
            className="mx-auto mt-2 block w-full max-w-xs text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-800"
          />
          {queued.length > 0 && (
            <p className="mt-2 text-xs text-neutral-500">{queued.length} file(s) ready to upload</p>
          )}
        </div>

        {(sizeError || uploadError) && (
          <p role="alert" className="mt-2 text-sm text-rose-600">
            {sizeError ?? uploadError}
          </p>
        )}

        <button
          type="button"
          onClick={startUpload}
          disabled={uploading || queued.length === 0 || sizeError !== null}
          className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {count === 0 ? (
        <p className="text-sm text-neutral-500">No photos yet.</p>
      ) : (
        <div className="space-y-3">
          {/* Batch selection */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-neutral-600">
              {selected.size > 0 ? `${selected.size} selected` : "Select photos to delete"}
            </p>
            {selected.size > 0 && (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={pendingDelete}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  Delete {selected.size}
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-sm text-neutral-500 underline hover:text-neutral-800"
                >
                  Clear
                </button>
              </>
            )}
            {selected.size === 0 && images.length > 0 && (
              <button
                onClick={() => setSelected(new Set(images.map((i) => i.id)))}
                className="text-sm text-neutral-500 underline hover:text-neutral-800"
              >
                Select all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => {
              const isSelected = selected.has(image.id);
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => toggleSelect(image.id)}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? "Deselect" : "Select"} photo ${index + 1}`}
                  className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 ring-2 transition ${
                    isSelected ? "ring-primary" : "ring-transparent hover:ring-neutral-300"
                  }`}
                >
                  <Image src={image.url} alt={`Listing photo ${index + 1}`} fill sizes="200px" className="object-cover" />
                  <span
                    className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border text-xs ${
                      isSelected ? "border-primary bg-primary text-white" : "border-white/80 bg-white/80 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${selected.size} photo${selected.size === 1 ? "" : "s"}?`}
        message="They will be permanently removed from the listing."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          const ids = [...selected];
          setConfirmDelete(false);
          setSelected(new Set());
          startDelete(async () => {
            const result = await deletePhotosAction(boardingHouseId, ids);
            if (result.error) setSizeError(result.error);
          });
        }}
      />
    </div>
  );
}
