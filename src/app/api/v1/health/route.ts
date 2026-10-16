// Reports that the mobile API is reachable.
export function GET() {
  return Response.json({ ok: true, service: "meino-api" });
}
