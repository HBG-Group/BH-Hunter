import { createDecipheriv } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, open, rm, stat as statAsync } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";

const magic = Buffer.from("BHBKUP01");
const keyText = process.env.BACKUP_ENCRYPTION_KEY;
if (!keyText) throw new Error("BACKUP_ENCRYPTION_KEY is required.");
const key = Buffer.from(keyText, "base64");
if (key.length !== 32 || key.toString("base64") !== keyText) {
  throw new Error("BACKUP_ENCRYPTION_KEY must be canonical base64 for exactly 32 bytes.");
}
const encryptedPath = process.argv[2];
if (!encryptedPath) throw new Error("Usage: npm run db:restore -- <encrypted-dump-path>");
const targetUrl = process.env.RESTORE_DIRECT_URL;
if (!targetUrl) throw new Error("RESTORE_DIRECT_URL is required and must point to a disposable restore database.");

function safeConnection(raw: string): { url: string; password?: string } {
  const parsed = new URL(raw);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("Restore connection must use PostgreSQL.");
  }
  const password = decodeURIComponent(parsed.password);
  parsed.password = "";
  return { url: parsed.href, password: password || undefined };
}

const connection = safeConnection(targetUrl);
const dir = await mkdtemp(join(tmpdir(), "meino-restore-"));
const plainPath = join(dir, "restore.dump");

try {
  const header = Buffer.alloc(magic.length + 12);
  const source = await open(encryptedPath, "r");
  const { bytesRead } = await source.read(header, 0, header.length, 0);
  await source.close();
  if (bytesRead !== header.length) throw new Error("Encrypted backup is truncated.");
  if (!header.subarray(0, magic.length).equals(magic)) throw new Error("Unrecognized encrypted backup format.");
  const decipher = createDecipheriv("aes-256-gcm", key, header.subarray(magic.length));
  const size = (await statAsync(encryptedPath)).size;
  const tagLength = 16;
  if (size < header.length + tagLength) throw new Error("Encrypted backup is truncated.");
  const tag = Buffer.alloc(tagLength);
  const tagFile = await open(encryptedPath, "r");
  const tagRead = await tagFile.read(tag, 0, tagLength, size - tagLength);
  await tagFile.close();
  if (tagRead.bytesRead !== tagLength) throw new Error("Encrypted backup is truncated.");
  decipher.setAuthTag(tag);

  // Decode only the ciphertext region; GCM's final authentication check completes before restore.
  const ciphertext = createReadStream(encryptedPath, { start: header.length, end: size - tagLength - 1 });
  const plainHandle = await open(plainPath, "wx", 0o600);
  await plainHandle.close();
  await pipeline(ciphertext, decipher, createWriteStream(plainPath, { flags: "a", mode: 0o600 }));

  const childEnv = { NODE_ENV: process.env.NODE_ENV ?? "production" } as NodeJS.ProcessEnv;
  for (const name of ["PATH", "Path", "SystemRoot", "WINDIR", "TEMP", "TMP", "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA"]) {
    if (process.env[name]) childEnv[name] = process.env[name];
  }
  childEnv.PGAPPNAME = "meino-restore";
  if (connection.password) childEnv.PGPASSWORD = connection.password;
  const restore = spawn("pg_restore", ["--exit-on-error", "--no-owner", "--no-privileges", "--dbname", connection.url, plainPath], {
    env: childEnv,
    stdio: "inherit",
  });
  const exitCodePromise = new Promise<number | null>((resolve, reject) => {
    restore.once("error", reject);
    restore.once("close", resolve);
  });
  const exitCode = await exitCodePromise;
  if (exitCode !== 0) throw new Error(`pg_restore exited with status ${exitCode}.`);
  console.log("Encrypted backup restored successfully.");
} finally {
  key.fill(0);
  if (connection.password) connection.password = "";
  await rm(dir, { recursive: true, force: true });
}
