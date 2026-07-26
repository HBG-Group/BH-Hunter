"use server";

import { requireAdmin } from "@/lib/auth/profile";
import { createSignedPhotoUpload } from "@/lib/storage/photos";
import {
  ALLOWED_PHOTO_EXTENSIONS,
  AD_UPLOAD_SCOPE,
  MAX_AD_IMAGES,
  MAX_PHOTO_BYTES,
  PHOTO_SIZE_HINT,
  isAllowedPhotoMime,
} from "@/config/storage";
import { buildStoragePath, issueTicket, type TicketClaims } from "@/lib/security/upload-ticket";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";

export interface AdUploadTicket {
  fileName: string;
  path: string;
  token: string;
  claims: TicketClaims;
  signature: string;
}

interface PendingFile {
  name: string;
  type: string;
  size: number;
}

// Step 1 — admin only. Validate the declared files and hand back signed upload tickets
// for server-chosen paths. The bucket itself enforces image-only + 5 MB on the PUT, and
// ad creation re-inspects each stored object, so a tampered client can't sneak anything
// past this.
export async function prepareAdUploadsAction(
  files: PendingFile[],
): Promise<{ tickets?: AdUploadTicket[]; error?: string }> {
  const admin = await requireAdmin();
  if (!(await allow("upload", LIMITS.upload, admin.id))) return { error: RATE_LIMITED };

  if (!Array.isArray(files) || files.length === 0) return { error: "Choose at least one image" };
  if (files.length > MAX_AD_IMAGES) return { error: `Upload at most ${MAX_AD_IMAGES} images.` };

  for (const file of files) {
    if (!file || typeof file.type !== "string" || typeof file.size !== "number") {
      return { error: "That file could not be read. Please pick it again." };
    }
    if (!isAllowedPhotoMime(file.type)) return { error: PHOTO_SIZE_HINT };
    if (file.size <= 0) return { error: `"${file.name}" is empty.` };
    if (file.size > MAX_PHOTO_BYTES) {
      return { error: `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. ${PHOTO_SIZE_HINT}` };
    }
  }

  return guarded<{ tickets?: AdUploadTicket[]; error?: string }>(
    "prepareAdUploads",
    async () => {
      const tickets: AdUploadTicket[] = [];
      for (const file of files) {
        const path = buildStoragePath(AD_UPLOAD_SCOPE, ALLOWED_PHOTO_EXTENSIONS[file.type]);
        const token = await createSignedPhotoUpload(path);
        const { claims, signature } = issueTicket(path, admin.id, AD_UPLOAD_SCOPE);
        tickets.push({ fileName: file.name, path, token, claims, signature });
      }
      return { tickets };
    },
    (message) => ({ error: message }),
  );
}
