"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/config/storage";
import { prepareUploadsAction, registerPhotosAction } from "@/lib/owner/photo-actions";

interface Result {
  upload: (files: File[]) => Promise<void>;
  uploading: boolean;
  error: string | null;
  clearError: () => void;
}

// Photos go browser → Supabase Storage directly, using short-lived signed tickets
// from the server. Sending megabytes through a Server Action truncates the request.
export function usePhotoUpload(boardingHouseId: string): Result {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]) => {
    setUploading(true);
    setError(null);

    const prepared = await prepareUploadsAction(
      boardingHouseId,
      files.map((file) => ({ name: file.name, type: file.type, size: file.size })),
    );
    if (prepared.error || !prepared.tickets) {
      setError(prepared.error ?? "Could not start the upload");
      setUploading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const stored: string[] = [];

    for (const [index, ticket] of prepared.tickets.entries()) {
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .uploadToSignedUrl(ticket.path, ticket.token, files[index]);

      if (uploadError) {
        setError(`"${ticket.fileName}" failed to upload: ${uploadError.message}`);
        break;
      }
      stored.push(ticket.path);
    }

    // Record whatever made it, so a partial failure doesn't lose the good uploads.
    if (stored.length > 0) {
      const result = await registerPhotosAction(boardingHouseId, stored);
      if (result.error) setError(result.error);
      else router.refresh();
    }

    setUploading(false);
  };

  return { upload, uploading, error, clearError: () => setError(null) };
}
