import { requireAdmin } from "@/lib/auth/profile";
import { prisma } from "@/lib/db/prisma";

function csv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const owner = await prisma.profile.findFirst({
    where: { id, role: "OWNER" },
    select: {
      fullName: true,
      subscriptionEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!owner) return new Response("Owner not found", { status: 404 });
  const headers = [
    "createdAt",
    "eventType",
    "plan",
    "status",
    "amount",
    "paymentReference",
    "payerName",
    "reviewedAt",
    "reviewedById",
  ];
  const lines = [headers.map(csv).join(",")];
  for (const event of owner.subscriptionEvents) {
    lines.push(
      [
        event.createdAt.toISOString(),
        event.eventType,
        event.plan,
        event.status,
        event.amount,
        event.paymentReference,
        event.payerName,
        event.reviewedAt?.toISOString(),
        event.reviewedById,
      ]
        .map(csv)
        .join(","),
    );
  }
  return new Response(lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${owner.fullName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-subscription-history.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
