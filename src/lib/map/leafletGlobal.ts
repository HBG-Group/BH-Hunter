// The gesture-handling plugin is a UMD build that expects Leaflet as a global `L`.
// Expose it before that plugin loads.
import L from "leaflet";

if (typeof window !== "undefined") {
  (window as unknown as { L: typeof L }).L = L;
}

export default L;
