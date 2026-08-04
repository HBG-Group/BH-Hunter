"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deletePhotosAction,
  reorderPhotosAction,
  updatePhotoAltAction,
} from "@/lib/owner/photo-actions";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import {
  MIN_LISTING_PHOTOS,
  PHOTO_REQUIREMENT_MESSAGE,
  RECOMMENDED_MAX_LISTING_PHOTOS,
} from "@/config/listing";
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
  alt: string | null;
}

function QueuedPhotoPreview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <Image
      src={url}
      alt=""
      width={64}
      height={48}
      unoptimized
      className="h-12 w-16 shrink-0 rounded-md object-cover"
    />
  );
}

interface Props {
  boardingHouseId: string;
  images: PhotoItem[];
}

export function PhotoManager({ boardingHouseId, images }: Props) {
  const router = useRouter();
  const {
    upload,
    uploading,
    progress: uploadProgress,
    error: uploadError,
    clearError,
  } = usePhotoUpload(boardingHouseId);
  const [pendingDelete, startDelete] = useTransition();
  const [pendingOrder, startOrder] = useTransition();
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
    const unique = new Map<string, File>();
    for (const file of Array.from(files ?? [])) {
      unique.set(`${file.name}:${file.size}:${file.lastModified}`, file);
    }
    const list = [...unique.values()];
    clearError();

    const rejected = list.find(
      (file) =>
        !isAllowedPhotoMime(file.type) ||
        file.size <= 0 ||
        file.size > MAX_PHOTO_BYTES,
    );
    setSizeError(
      rejected ? `"${rejected.name}" can't be used. ${PHOTO_SIZE_HINT}` : null,
    );
    setQueued(list);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    queue(event.dataTransfer.files);
  };

  const startUpload = async () => {
    const completed = await upload(queued);
    if (completed) {
      setQueued([]);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const movePhoto = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const ids = images.map((image) => image.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    startOrder(async () => {
      const result = await reorderPhotosAction(boardingHouseId, ids);
      if (result.error) setSizeError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      {/* Upload progress toward the minimum */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-900">
            {count} / {MIN_LISTING_PHOTOS} uploaded
          </p>
          <span
            className={`text-xs font-medium ${met ? "text-emerald-600" : "text-amber-700"}`}
          >
            {met ? "Minimum met" : `${MIN_LISTING_PHOTOS - count} more needed`}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${met ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {!met && (
          <p className="mt-2 text-xs text-neutral-500">
            {PHOTO_REQUIREMENT_MESSAGE}
          </p>
        )}
        {met && count > RECOMMENDED_MAX_LISTING_PHOTOS && (
          <p className="mt-2 text-xs text-neutral-500">
            You have {count} photos. Around {RECOMMENDED_MAX_LISTING_PHOTOS}{" "}
            well-chosen photos is usually enough — consider trimming to your
            best shots.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <label
          htmlFor="photo-input"
          className="block text-sm font-medium text-neutral-700"
        >
          Add photos
        </label>
        <p className="mb-3 text-xs text-neutral-500">
          {PHOTO_SIZE_HINT} You can pick several at once.
        </p>

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
            <div className="mt-3 space-y-2 text-left">
              <p className="text-xs text-neutral-500">
                {queued.length} unique file(s) ready to upload
              </p>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-neutral-600">
                {queued.map((file, index) => (
                  <li
                    key={`${file.name}:${file.lastModified}`}
                    className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3"
                  >
                    <QueuedPhotoPreview file={file} />
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQueued((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="min-h-11 shrink-0 px-2 text-rose-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {(sizeError || uploadError) && (
          <p role="alert" className="mt-2 text-sm text-rose-600">
            {sizeError ?? uploadError}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={startUpload}
            disabled={uploading || queued.length === 0 || sizeError !== null}
            className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {uploading
              ? `Uploading ${uploadProgress.completed} of ${uploadProgress.total}...`
              : uploadError
                ? "Retry upload"
                : "Upload"}
          </button>
          {queued.length > 0 && !uploading && (
            <button
              type="button"
              onClick={() => {
                setQueued([]);
                setSizeError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="min-h-11 rounded-xl px-4 text-sm ring-1 ring-inset ring-line"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {count === 0 ? (
        <p className="text-sm text-neutral-500">No photos yet.</p>
      ) : (
        <div className="space-y-3">
          {/* Batch selection */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-neutral-600">
              {selected.size > 0
                ? `${selected.size} selected`
                : "Select photos to delete"}
            </p>
            {selected.size > 0 && (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={pendingDelete}
                  className="min-h-11 rounded-lg bg-rose-600 px-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  Delete {selected.size}
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="min-h-11 px-2 text-sm text-neutral-500 underline hover:text-neutral-800"
                >
                  Clear
                </button>
              </>
            )}
            {selected.size === 0 && images.length > 0 && (
              <button
                onClick={() => setSelected(new Set(images.map((i) => i.id)))}
                className="min-h-11 px-2 text-sm text-neutral-500 underline hover:text-neutral-800"
              >
                Select all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => {
              const isSelected = selected.has(image.id);
              return (
                <div
                  key={image.id}
                  className="space-y-2 rounded-xl border border-line bg-white p-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleSelect(image.id)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Deselect" : "Select"} photo ${index + 1}`}
                    className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-100 ring-2 transition ${
                      isSelected
                        ? "ring-primary"
                        : "ring-transparent hover:ring-neutral-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `Listing photo ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover"
                    />
                    <span
                      className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border text-xs ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-white/80 bg-white/80 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pendingOrder || index === 0}
                      onClick={() => movePhoto(index, -1)}
                      className="min-h-11 flex-1 rounded-lg text-sm ring-1 ring-inset ring-line disabled:opacity-40"
                    >
                      Move left
                    </button>
                    <button
                      type="button"
                      disabled={pendingOrder || index === images.length - 1}
                      onClick={() => movePhoto(index, 1)}
                      className="min-h-11 flex-1 rounded-lg text-sm ring-1 ring-inset ring-line disabled:opacity-40"
                    >
                      Move right
                    </button>
                  </div>
                  <form
                    action={updatePhotoAltAction.bind(
                      null,
                      boardingHouseId,
                      image.id,
                    )}
                    className="flex gap-2"
                  >
                    <label className="sr-only" htmlFor={`alt-${image.id}`}>
                      Description for photo {index + 1}
                    </label>
                    <input
                      id={`alt-${image.id}`}
                      name="alt"
                      defaultValue={image.alt ?? ""}
                      maxLength={160}
                      placeholder="Describe this photo"
                      className="min-w-0 flex-1 rounded-lg border border-line px-3 text-sm"
                    />
                    <button className="min-h-11 rounded-lg px-3 text-sm ring-1 ring-inset ring-line">
                      Save
                    </button>
                  </form>
                </div>
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
