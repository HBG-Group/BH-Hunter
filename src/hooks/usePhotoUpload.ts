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

// Photos go browser → Supabase Storage directly, using signed tickets from the server.
// The server picks every path and re-verifies each file after upload.
export function usePhotoUpload(boardingHouseId: string): Result {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]) => {
    setUploading(true);
    setError(null);

    try {
      const prepared = await prepareUploadsAction(
        boardingHouseId,
        files.map((file) => ({ name: file.name, type: file.type, size: file.size })),
      );
      if (prepared.error || !prepared.tickets) {
        setError(prepared.error ?? "Could not start the upload");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const uploaded: { claims: (typeof prepared.tickets)[number]["claims"]; signature: string }[] = [];

      for (const [index, ticket] of prepared.tickets.entries()) {
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .uploadToSignedUrl(ticket.path, ticket.token, files[index]);

        if (uploadError) {
          setError(`"${ticket.fileName}" was rejected: ${uploadError.message}`);
          break;
        }
        uploaded.push({ claims: ticket.claims, signature: ticket.signature });
      }

      // Register whatever landed, so a partial failure doesn't lose good uploads.
      if (uploaded.length > 0) {
        const result = await registerPhotosAction(boardingHouseId, uploaded);
        if (result.error) setError(result.error);
        else router.refresh();
      }
    } catch {
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error, clearError: () => setError(null) };
}
