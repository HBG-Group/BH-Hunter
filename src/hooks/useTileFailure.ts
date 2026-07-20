"use client";

import { useCallback, useRef, useState } from "react";

// Tracks Leaflet tile-load failures. A few stray missing tiles are normal, so we
// only flag failure after several errors with no successful batch load.
export function useTileFailure(threshold = 4) {
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const errors = useRef(0);

  const onTileError = useCallback(() => {
    errors.current += 1;
    if (errors.current >= threshold) setFailed(true);
  }, [threshold]);

  // A full batch loaded fine — reset the counter.
  const onLoad = useCallback(() => {
    errors.current = 0;
  }, []);

  const retry = useCallback(() => {
    errors.current = 0;
    setFailed(false);
    setRetryKey((k) => k + 1); // remount the tile layer to re-fetch
  }, []);

  return { failed, retryKey, retry, handlers: { tileerror: onTileError, load: onLoad } };
}
