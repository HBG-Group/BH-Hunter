// Shown while the client-only map bundle loads, so the layout doesn't jump.
export function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
    </div>
  );
}
