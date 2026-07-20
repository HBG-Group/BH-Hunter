interface Props {
  onRetry: () => void;
  googleMapsUrl: string;
}

// Shown over the map when tiles fail to load — never leave users on gray tiles.
export function MapFallback({ onRetry, googleMapsUrl }: Props) {
  return (
    <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-4 bg-neutral-50 p-6 text-center">
      <svg className="h-8 w-8 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
      </svg>
      <div>
        <p className="font-medium text-neutral-900">Unable to load the map</p>
        <p className="mt-1 text-sm text-neutral-500">Please check your connection or try again.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Retry
        </button>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-4 py-2 text-sm text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:ring-neutral-300"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
