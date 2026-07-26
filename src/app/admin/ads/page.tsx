import { getAdminOrNull } from "@/lib/auth/profile";
import { findAllAdvertisements, isAdLive } from "@/lib/db/advertisements";
import { AdForm } from "@/components/admin/AdForm";
import { AdRow } from "@/components/admin/AdRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminAdsPage() {
  if (!(await getAdminOrNull())) return null;
  const ads = await findAllAdvertisements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Advertisements</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Local businesses shown on the homepage. Keep them relevant to students.
        </p>
      </div>

      <AdForm />

      {ads.length === 0 ? (
        <EmptyState title="No advertisements yet" message="Add one above to show it on the homepage." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
          {ads.map((ad) => (
            <AdRow
              key={ad.id}
              ad={{
                id: ad.id,
                title: ad.title,
                active: ad.active,
                live: isAdLive(ad),
                expiresAt: ad.expiresAt?.toISOString() ?? null,
                coverUrl: ad.imageUrls[0] ?? null,
                imageCount: ad.imageUrls.length,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
