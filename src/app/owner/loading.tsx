// Dashboard skeleton shown while owner data loads.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-40 rounded bg-neutral-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-neutral-100" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-neutral-100" />
        ))}
      </div>
    </div>
  );
}
