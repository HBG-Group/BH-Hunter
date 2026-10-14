// A single shared Prisma client. In development Next.js reloads modules often, so
// without this guard we would open a new database connection on every reload and
// eventually exhaust them. The globalThis cache keeps one client across reloads.

import { PrismaClient } from "@prisma/client";

// Supabase's shared transaction pooler (6543) can reuse a Postgres connection
// that already has Prisma's prepared statement names. Tell Prisma to disable its
// statement cache for this runtime connection. Keep the original URL untouched
// for direct/session connections and for Prisma CLI configuration.
function runtimeDatabaseUrl(): string | undefined {
  const value = process.env.DATABASE_URL;
  if (!value || !value.includes(":6543/")) return value;

  const hashIndex = value.indexOf("#");
  const base = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : value.slice(hashIndex);
  const pgbouncerParam = /([?&])pgbouncer=[^&]*/i;

  if (pgbouncerParam.test(base)) {
    return `${base.replace(pgbouncerParam, "$1pgbouncer=true")}${hash}`;
  }

  return `${base}${base.includes("?") ? "&" : "?"}pgbouncer=true${hash}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = runtimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
