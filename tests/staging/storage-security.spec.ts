import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const baseURL = process.env.SECURITY_TEST_BASE_URL;
const supabaseUrl = process.env.SECURITY_TEST_SUPABASE_URL;
const serviceRoleKey = process.env.SECURITY_TEST_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SECURITY_TEST_SUPABASE_ANON_KEY;
const enabled =
  process.env.SECURITY_TEST_ENVIRONMENT === "staging" &&
  Boolean(baseURL && supabaseUrl && serviceRoleKey && anonKey) &&
  !new URL(baseURL ?? "https://invalid.local").hostname.endsWith(
    "meino.vercel.app",
  );

const bucketName = "listing-photos";
const maxPhotoBytes = 5 * 1024 * 1024;
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const testFolder = `issue-12-check/${randomUUID()}`;
const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p7sAAAAASUVORK5CYII=",
  "base64",
);

test("staging Storage allows signed valid uploads and rejects public writes, bad MIME, and oversized files", async () => {
  test.skip(!enabled, "Set staging-only SECURITY_TEST_* variables to run this suite.");

  const projectHost = new URL(supabaseUrl!).hostname;
  if (!projectHost.startsWith("zxtzltksequjisrchyqm.")) {
    throw new Error("Refusing to run Storage tests outside the staging Supabase project.");
  }

  const preview = await fetch(baseURL!, { redirect: "follow" });
  if (!preview.ok || !(await preview.text()).includes(projectHost)) {
    throw new Error("The Preview deployment does not appear to use the staging Supabase project.");
  }

  const admin: SupabaseClient = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anonymous = createClient(supabaseUrl!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const createdPaths: string[] = [];
  const expectObjectAbsent = async (path: string) => {
    const { data, error } = await admin.storage.from(bucketName).list(testFolder, {
      search: path.split("/").at(-1),
      limit: 5,
    });
    if (error) throw error;
    expect(data?.some((entry) => entry.name === path.split("/").at(-1))).toBe(false);
  };

  try {
    const { data: existingBucket } = await admin.storage.getBucket(bucketName);
    if (!existingBucket) {
      const { error } = await admin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: maxPhotoBytes,
        allowedMimeTypes,
      });
      if (error) throw error;
    }

    const { data: bucket, error: bucketError } = await admin.storage.getBucket(bucketName);
    if (bucketError || !bucket) throw bucketError ?? new Error("Storage bucket is missing.");
    expect(bucket.public).toBe(true);
    expect(Number(bucket.file_size_limit)).toBe(maxPhotoBytes);
    expect([...(bucket.allowed_mime_types ?? [])].sort()).toEqual([...allowedMimeTypes].sort());

    const deniedPath = `${testFolder}/anonymous.png`;
    const { error: anonymousUploadError } = await anonymous.storage
      .from(bucketName)
      .upload(deniedPath, validPng, { contentType: "image/png", upsert: false });
    expect(anonymousUploadError).not.toBeNull();
    await expectObjectAbsent(deniedPath);

    const validPath = `${testFolder}/valid.png`;
    createdPaths.push(validPath);
    const { data: validTicket, error: validTicketError } = await admin.storage
      .from(bucketName)
      .createSignedUploadUrl(validPath);
    if (validTicketError || !validTicket) throw validTicketError ?? new Error("Could not create a staging upload ticket.");
    const { error: validUploadError } = await anonymous.storage
      .from(bucketName)
      .uploadToSignedUrl(validPath, validTicket.token, validPng, { contentType: "image/png" });
    expect(validUploadError).toBeNull();

    const publicUrl = anonymous.storage.from(bucketName).getPublicUrl(validPath).data.publicUrl;
    const publicRead = await fetch(publicUrl);
    expect(publicRead.ok).toBe(true);

    const badMimePath = `${testFolder}/bad-mime.html`;
    createdPaths.push(badMimePath);
    const { data: badMimeTicket, error: badMimeTicketError } = await admin.storage
      .from(bucketName)
      .createSignedUploadUrl(badMimePath);
    if (badMimeTicketError || !badMimeTicket) throw badMimeTicketError ?? new Error("Could not create a staging upload ticket.");
    const { error: badMimeError } = await anonymous.storage
      .from(bucketName)
      .uploadToSignedUrl(badMimePath, badMimeTicket.token, Buffer.from("<script>bad()</script>"), {
        contentType: "text/html",
      });
    expect(badMimeError).not.toBeNull();
    await expectObjectAbsent(badMimePath);

    const oversizedPath = `${testFolder}/oversized.png`;
    createdPaths.push(oversizedPath);
    const { data: oversizedTicket, error: oversizedTicketError } = await admin.storage
      .from(bucketName)
      .createSignedUploadUrl(oversizedPath);
    if (oversizedTicketError || !oversizedTicket) throw oversizedTicketError ?? new Error("Could not create a staging upload ticket.");
    const oversizedFile = Buffer.alloc(maxPhotoBytes + 1);
    const { error: oversizedError } = await anonymous.storage
      .from(bucketName)
      .uploadToSignedUrl(oversizedPath, oversizedTicket.token, oversizedFile, {
        contentType: "image/png",
      });
    expect(oversizedError).not.toBeNull();
    await expectObjectAbsent(oversizedPath);
  } finally {
    if (createdPaths.length > 0) {
      const { error } = await admin.storage.from(bucketName).remove(createdPaths);
      if (error) throw error;
    }
    const { data: remaining, error: listError } = await admin.storage
      .from(bucketName)
      .list(testFolder, { limit: 20 });
    if (listError) throw listError;
    expect(remaining ?? []).toHaveLength(0);
  }
});
