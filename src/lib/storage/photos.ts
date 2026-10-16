import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET, ALLOWED_PHOTO_MIME, MAX_PHOTO_BYTES } from "@/config/storage";
import { normalizeStorageUrl } from "@/lib/security/storage-url";

export { PHOTO_BUCKET };

type Client = ReturnType<typeof createSupabaseAdminClient>;

// Bucket constraints are the last line of defence: Supabase rejects the signed PUT
// itself, so a tampered client cannot upload an oversized or non-image file.
const BUCKET_OPTIONS = {
  public: true,
  fileSizeLimit: MAX_PHOTO_BYTES,
  allowedMimeTypes: [...ALLOWED_PHOTO_MIME],
};

// Create on first use, and keep constraints current on buckets made before them.
async function ensureBucket(client: Client) {
  const { data } = await client.storage.getBucket(PHOTO_BUCKET);
  if (!data) {
    await client.storage.createBucket(PHOTO_BUCKET, BUCKET_OPTIONS);
    return;
  }
  const limitsMissing =
    data.file_size_limit !== MAX_PHOTO_BYTES ||
    (data.allowed_mime_types?.length ?? 0) !== ALLOWED_PHOTO_MIME.length;
  if (limitsMissing) await client.storage.updateBucket(PHOTO_BUCKET, BUCKET_OPTIONS);
}

// Signed ticket for one server-chosen path. The browser sends the bytes; Supabase
// enforces type and size on receipt.
export async function createSignedPhotoUpload(path: string): Promise<string> {
  const client = createSupabaseAdminClient();
  await ensureBucket(client);

  const { data, error } = await client.storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw error ?? new Error("Could not prepare the upload");
  return data.token;
}

export interface StoredObject {
  size: number;
  mimeType: string;
}

// Verify the object really landed, and inspect what was actually stored rather than
// what the browser claimed. Returns null when the file is absent or empty.
export async function describeStoredPhoto(path: string): Promise<StoredObject | null> {
  const client = createSupabaseAdminClient();
  const folder = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);

  const { data, error } = await client.storage
    .from(PHOTO_BUCKET)
    .list(folder, { search: name, limit: 1 });
  if (error || !data || data.length === 0) return null;

  const file = data.find((entry) => entry.name === name);
  if (!file) return null;

  const size = file.metadata?.size ?? 0;
  const mimeType = String(file.metadata?.mimetype ?? "");
  if (size <= 0) return null;

  return { size, mimeType };
}

export function publicPhotoUrl(path: string): string {
  const client = createSupabaseAdminClient();
  const url = client.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
  return normalizeStorageUrl(url);
}

// Best-effort removal of the stored file behind a public URL.
export async function removeListingPhoto(publicUrl: string): Promise<void> {
  const marker = `/${PHOTO_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;

  let path = publicUrl.slice(index + marker.length);
  try {
    path = decodeURIComponent(path);
  } catch {
    return;
  }
  path = path.replace(/[\\]+$/, "");
  if (!path || path.includes("..")) return;
  const client = createSupabaseAdminClient();
  await client.storage.from(PHOTO_BUCKET).remove([path]);
}

// Drop an object that failed post-upload validation, so rejects don't accumulate.
export async function discardStoredPhoto(path: string): Promise<void> {
  const client = createSupabaseAdminClient();
  await client.storage.from(PHOTO_BUCKET).remove([path]);
}
