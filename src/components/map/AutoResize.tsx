"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Keep Leaflet's size in sync when its container resizes (e.g. expand/collapse).
export function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
