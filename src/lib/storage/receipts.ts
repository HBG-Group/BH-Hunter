import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET, ALLOWED_PHOTO_EXTENSIONS } from "@/config/storage";

// Payment receipts share the photo bucket under this folder. Kept separate from listing
// photos so they're easy to find and never mixed into a listing gallery.
const RECEIPT_SCOPE = "receipts";

// Upload a receipt image server-side (the bytes already reached the server via the form
// action). Returns the public URL. Path is server-chosen so a client can't target
// another owner's folder.
export async function uploadReceipt(
  ownerId: string,
  bytes: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const ext = ALLOWED_PHOTO_EXTENSIONS[mimeType] ?? "jpg";
  const path = `${RECEIPT_SCOPE}/${ownerId}/${Date.now()}.${ext}`;
  const client = createSupabaseAdminClient();

  const { error } = await client.storage
    .from(PHOTO_BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: false });
  if (error) throw error;

  return client.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}
