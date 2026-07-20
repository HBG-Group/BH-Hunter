import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/config/storage";

export { PHOTO_BUCKET };

// Creates the bucket on first use so setup is one less manual step. Safe to call
// repeatedly — an "already exists" error is expected and ignored.
async function ensureBucket(client: ReturnType<typeof createSupabaseAdminClient>) {
  const { data } = await client.storage.getBucket(PHOTO_BUCKET);
  if (data) return;
  await client.storage.createBucket(PHOTO_BUCKET, { public: true });
}

function extensionFor(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName);
  return match ? match[1].toLowerCase() : "jpg";
}

export interface SignedUpload {
  path: string;
  token: string;
}

// Hands the browser a one-shot ticket to PUT a file straight into Storage. Large
// files never touch the Next server, which is what multipart Server Actions choke on.
export async function createSignedPhotoUpload(
  boardingHouseId: string,
  fileName: string,
): Promise<SignedUpload> {
  const client = createSupabaseAdminClient();
  await ensureBucket(client);

  const path = `${boardingHouseId}/${crypto.randomUUID()}.${extensionFor(fileName)}`;
  const { data, error } = await client.storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw error ?? new Error("Could not prepare the upload");

  return { path: data.path, token: data.token };
}

// The public URL for an already-uploaded object path.
export function publicPhotoUrl(path: string): string {
  const client = createSupabaseAdminClient();
  return client.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Uploads one image and returns its public URL.
export async function uploadListingPhoto(
  boardingHouseId: string,
  file: File,
): Promise<string> {
  const client = createSupabaseAdminClient();
  await ensureBucket(client);

  const path = `${boardingHouseId}/${crypto.randomUUID()}.${extensionFor(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage
    .from(PHOTO_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw error;

  return client.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

// Best-effort removal of the stored file behind a public URL.
export async function removeListingPhoto(publicUrl: string): Promise<void> {
  const marker = `/${PHOTO_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;

  const path = publicUrl.slice(index + marker.length);
  const client = createSupabaseAdminClient();
  await client.storage.from(PHOTO_BUCKET).remove([path]);
}
