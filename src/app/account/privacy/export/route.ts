import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/profile";
import { exportAccountData } from "@/lib/account/privacy";

export async function GET() {
  const profile = await requireProfile("/account/privacy");
  const data = await exportAccountData(profile.id);

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="meino-account-export-${profile.id}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
