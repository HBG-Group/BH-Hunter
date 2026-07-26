"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET, MAX_PHOTO_BYTES, isAllowedPhotoMime } from "@/config/storage";
import { prepareAdUploadsAction } from "@/lib/admin/ad-upload-actions";
import type { TicketClaims } from "@/lib/security/upload-ticket";

export interface UploadedAdImage {
  previewUrl: string; // public URL of the stored object, for the thumbnail
  claims: TicketClaims;
  signature: string;
}

interface Result {
  images: UploadedAdImage[];
  uploading: boolean;
  error: string | null;
  addFiles: (files: File[]) => Promise<void>;
  removeAt: (index: number) => void;
}

// Uploads picked ad images to Storage via server-signed tickets and keeps the verified
// tickets so the ad form can submit them. Mirrors the listing-photo flow; admin only.
export function useAdImageUpload(): Result {
  const [images, setImages] = useState<UploadedAdImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (files: File[]) => {
    setError(null);

    // Client-side gate (UX only — the server and bucket enforce the real rules).
    const rejected = files.find(
      (f) => !isAllowedPhotoMime(f.type) || f.size <= 0 || f.size > MAX_PHOTO_BYTES,
    );
    if (rejected) {
      setError(`"${rejected.name}" isn't a valid image under 5 MB.`);
      return;
    }

    setUploading(true);
    try {
      const prepared = await prepareAdUploadsAction(
        files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      );
      if (prepared.error || !prepared.tickets) {
        setError(prepared.error ?? "Could not start the upload");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const uploaded: UploadedAdImage[] = [];
      for (const [i, ticket] of prepared.tickets.entries()) {
        const { error: upErr } = await supabase.storage
          .from(PHOTO_BUCKET)
          .uploadToSignedUrl(ticket.path, ticket.token, files[i]);
        if (upErr) {
          setError(`"${ticket.fileName}" was rejected: ${upErr.message}`);
          break;
        }
        uploaded.push({
          previewUrl: URL.createObjectURL(files[i]),
          claims: ticket.claims,
          signature: ticket.signature,
        });
      }
      if (uploaded.length > 0) setImages((current) => [...current, ...uploaded]);
    } catch {
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) => setImages((current) => current.filter((_, i) => i !== index));

  return { images, uploading, error, addFiles, removeAt };
}
