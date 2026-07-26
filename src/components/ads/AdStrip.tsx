import { findLiveAdvertisements } from "@/lib/db/advertisements";
import { safeExternalUrl } from "@/lib/security/url";
import { reportError } from "@/lib/security/errors";
import { AdCard } from "./AdCard";

// A calm row of local business ads below the hero. Renders nothing when there are no
// live ads, so it never leaves an empty gap. Links are sanitized here on the server
// before being handed to the client card, which opens a detail view on click.
export async function AdStrip() {
  // Ads are non-critical — never let a DB hiccup take down the homepage.
  let ads: Awaited<ReturnType<typeof findLiveAdvertisements>> = [];
  try {
    ads = (await findLiveAdvertisements(3)).filter((ad) => ad.imageUrls.length > 0);
  } catch (error) {
    reportError("adStrip", error);
    return null;
  }
  if (ads.length === 0) return null;

  return (
    <section aria-label="From local businesses" className="mb-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
        From local businesses
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <AdCard
            key={ad.id}
            ad={{
              id: ad.id,
              title: ad.title,
              description: ad.description,
              imageUrls: ad.imageUrls,
              links: {
                website: safeExternalUrl(ad.websiteUrl),
                facebook: safeExternalUrl(ad.facebookUrl),
                messenger: safeExternalUrl(ad.messengerUrl),
              },
            }}
          />
        ))}
      </div>
    </section>
  );
}
