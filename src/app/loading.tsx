import { ListingGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

// Shown while the homepage (and any route without its own loading state) fetches.
export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-8 max-w-2xl space-y-3">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>
        <ListingGridSkeleton />
      </div>
    </div>
  );
}
