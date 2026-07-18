"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@/lib/map/gestureHandling";

type WithGesture = { gestureHandling?: { enable: () => void } };

// Enable two-finger (cooperative) gestures once the map exists. Done imperatively
// because react-leaflet v5 doesn't forward the option to the Leaflet map.
export function GestureHandler() {
  const map = useMap();
  useEffect(() => {
    (map as unknown as WithGesture).gestureHandling?.enable();
  }, [map]);
  return null;
}
