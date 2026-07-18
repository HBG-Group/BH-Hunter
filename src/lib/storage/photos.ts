import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// All listing photos live in one public bucket. Public-read so the browser can show
// them directly; writes only ever happen here on the server with the service role.
export const PHOTO_BUCKET = "listing-photos";

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
