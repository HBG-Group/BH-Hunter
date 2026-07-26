import { Skeleton } from "@/components/ui/Skeleton";

// Detail page skeleton: gallery, title, then the two-column body.
export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 aspect-[16/9] w-full rounded-2xl" />
        <div className="mt-5 space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
