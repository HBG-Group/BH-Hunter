// Registers cooperative gesture handling on Leaflet: one finger scrolls the page,
// two fingers move the map (ctrl + scroll zooms on desktop). The plugin needs the
// global `L`, which leafletGlobal sets first. Import for its side effect.
import "@/lib/map/leafletGlobal";
import "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
