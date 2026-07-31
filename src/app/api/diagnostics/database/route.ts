import { lookup } from "node:dns/promises";
import { connect } from "node:net";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type CheckResult =
  | { ok: true; durationMs: number }
  | { ok: false; durationMs: number; code: string };

function elapsed(startedAt: number) {
  return Date.now() - startedAt;
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
    const knownError = error as { code?: string; name?: string };
    return {
      ok: false,
      durationMs: elapsed(startedAt),
      code: knownError.code ?? knownError.name ?? "PRISMA_ERROR",
    };
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
    },
    {
      status: database.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
