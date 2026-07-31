import { lookup } from "node:dns/promises";
import { connect } from "node:net";
import { prisma } from "@/lib/db/prisma";
import { findPublishedBoardingHouses } from "@/lib/db/boarding-houses";
import { getCurrentProfile } from "@/lib/auth/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

type CheckResult =
  | { ok: true; durationMs: number }
  | { ok: false; durationMs: number; code: string };

function elapsed(startedAt: number) {
  return Date.now() - startedAt;
}

function classifyPrismaError(error: unknown) {
  const knownError = error as { code?: string; message?: string; name?: string };
  const message = knownError.message ?? "";

  if (message.includes("tenant/user") && message.includes("not found")) {
    return "TENANT_NOT_FOUND";
  }
  if (/authentication failed|password authentication failed/i.test(message)) {
    return "AUTHENTICATION_FAILED";
  }
  if (/can't reach database server/i.test(message)) {
    return "DATABASE_UNREACHABLE";
  }

  return knownError.code ?? knownError.name ?? "PRISMA_ERROR";
}

async function checkTcp(host: string, port: number): Promise<CheckResult> {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const finish = (result: CheckResult) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(5_000);
    socket.once("connect", () => finish({ ok: true, durationMs: elapsed(startedAt) }));
    socket.once("timeout", () =>
      finish({ ok: false, durationMs: elapsed(startedAt), code: "TCP_TIMEOUT" }),
    );
    socket.once("error", (error: NodeJS.ErrnoException) =>
      finish({
        ok: false,
        durationMs: elapsed(startedAt),
        code: error.code ?? "TCP_ERROR",
      }),
    );
  });
}

async function checkPrisma(): Promise<CheckResult> {
  const startedAt = Date.now();

  try {
    await prisma.boardingHouse.count();
    return { ok: true, durationMs: elapsed(startedAt) };
  } catch (error) {
    return {
      ok: false,
      durationMs: elapsed(startedAt),
      code: classifyPrismaError(error),
    };
  }
}

async function checkOperation(operation: Promise<unknown>): Promise<CheckResult> {
  const startedAt = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("DIAGNOSTIC_TIMEOUT")), 10_000);
      }),
    ]);
    return { ok: true, durationMs: elapsed(startedAt) };
  } catch (error) {
    return {
      ok: false,
      durationMs: elapsed(startedAt),
      code: error instanceof Error && error.message === "DIAGNOSTIC_TIMEOUT"
        ? "OPERATION_TIMEOUT"
        : classifyPrismaError(error),
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return new Response(null, { status: 404 });
  }

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    return Response.json({ configured: false }, { status: 503 });
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(rawUrl);
  } catch {
    return Response.json(
      {
        configured: true,
        parsed: false,
        hasWhitespace: /\s/.test(rawUrl),
        hasWrappingQuotes: /^["']|["']$/.test(rawUrl),
      },
      { status: 503 },
    );
  }

  const port = Number(databaseUrl.port || "5432");
  const dnsStartedAt = Date.now();
  let dns:
    | { ok: true; durationMs: number; addresses: string[] }
    | { ok: false; durationMs: number; code: string };

  try {
    const addresses = await lookup(databaseUrl.hostname, { all: true });
    dns = {
      ok: true,
      durationMs: elapsed(dnsStartedAt),
      addresses: addresses.map(({ address, family }) => `${family}:${address}`),
    };
  } catch (error) {
    const knownError = error as NodeJS.ErrnoException;
    dns = {
      ok: false,
      durationMs: elapsed(dnsStartedAt),
      code: knownError.code ?? "DNS_ERROR",
    };
  }

  const [tcp, database] = await Promise.all([
    checkTcp(databaseUrl.hostname, port),
    checkPrisma(),
  ]);
  const [listings, profile] = await Promise.all([
    checkOperation(findPublishedBoardingHouses()),
    checkOperation(getCurrentProfile()),
  ]);

  return Response.json(
    {
      configured: true,
      parsed: true,
      connection: {
        protocol: databaseUrl.protocol,
        hostname: databaseUrl.hostname,
        port,
        database: databaseUrl.pathname,
        username: databaseUrl.username,
        passwordLength: databaseUrl.password.length,
        hasWhitespace: /\s/.test(rawUrl),
        hasWrappingQuotes: /^["']|["']$/.test(rawUrl),
        parameters: [...databaseUrl.searchParams.keys()].sort(),
      },
      dns,
      tcp,
      database,
      listings,
      profile,
    },
    {
      status: database.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
