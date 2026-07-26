import { ListingGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

// Account page skeleton: profile header, then the saved-listings grid.
export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <ListingGridSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}
