import { createCipheriv, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, open, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";

const magic = Buffer.from("BHBKUP01");
const ivLength = 12;

function encryptionKey(): Buffer {
  const encoded = process.env.BACKUP_ENCRYPTION_KEY;
  if (!encoded || !/^(?:[A-Za-z0-9+/]{4}){10}[A-Za-z0-9+/]{3}=$/.test(encoded)) {
    throw new Error("BACKUP_ENCRYPTION_KEY must be base64 encoding of exactly 32 random bytes.");
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32 || key.toString("base64") !== encoded) {
    throw new Error("BACKUP_ENCRYPTION_KEY must be canonical base64 for exactly 32 bytes.");
  }
  return key;
}

function safeConnection(raw: string): { url: string; password?: string } {
  const parsed = new URL(raw);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("Database connection must use PostgreSQL.");
  }
  const password = decodeURIComponent(parsed.password);
  parsed.password = "";
  return { url: parsed.href, password: password || undefined };
}

const directUrl = process.env.DIRECT_URL;
if (!directUrl) throw new Error("DIRECT_URL is required.");
const key = encryptionKey();
const connection = safeConnection(directUrl);
const outputDir = join(process.cwd(), ".backups");
await mkdir(outputDir, { recursive: true });
const timestamp = new Date().toISOString().replaceAll(":", "-");
const outputPath = join(outputDir, `meino-${timestamp}.dump.enc`);
const partialPath = `${outputPath}.partial`;
const iv = randomBytes(ivLength);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const file = await open(partialPath, "wx", 0o600);
await file.writeFile(Buffer.concat([magic, iv]));
await file.close();

const childEnv = { NODE_ENV: process.env.NODE_ENV ?? "production" } as NodeJS.ProcessEnv;
for (const name of ["PATH", "Path", "SystemRoot", "WINDIR", "TEMP", "TMP", "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA"]) {
  if (process.env[name]) childEnv[name] = process.env[name];
}
childEnv.PGAPPNAME = "meino-backup";
if (connection.password) childEnv.PGPASSWORD = connection.password;

const dump = spawn("pg_dump", ["--format=custom", "--no-owner", "--no-privileges", "--dbname", connection.url], {
  env: childEnv,
  stdio: ["ignore", "pipe", "inherit"],
});
const exitCodePromise = new Promise<number | null>((resolve, reject) => {
  dump.once("error", reject);
  dump.once("close", resolve);
});

try {
  const [, exitCode] = await Promise.all([
    pipeline(dump.stdout, cipher, createWriteStream(partialPath, { flags: "a", mode: 0o600 })),
    exitCodePromise,
  ]);
  if (exitCode !== 0) throw new Error(`pg_dump exited with status ${exitCode}.`);
  const tag = cipher.getAuthTag();
  const handle = await open(partialPath, "a");
  await handle.write(tag);
  await handle.close();
  await rename(partialPath, outputPath);
  console.log(`Encrypted backup created: ${outputPath}`);
} catch (error) {
  dump.kill();
  await rm(partialPath, { force: true });
  throw error;
} finally {
  key.fill(0);
  if (connection.password) connection.password = "";
}
