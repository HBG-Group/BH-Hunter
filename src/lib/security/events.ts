import "server-only";
import { headers } from "next/headers";

export interface SecurityEvent {
  action: string;
  outcome: "allowed" | "denied" | "error";
  actorId?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
}

async function requestMetadata() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return {
    ip: forwardedFor?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? undefined,
    requestId:
      headerList.get("x-request-id") ??
      headerList.get("x-vercel-id") ??
      headerList.get("cf-ray") ??
      undefined,
  };
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const meta = await requestMetadata();
  console.info(
    JSON.stringify({
      category: "security",
      at: new Date().toISOString(),
      ...meta,
      ...event,
    }),
  );
}
