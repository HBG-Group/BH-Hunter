// The map "seam". Every tile-provider detail lives here, so swapping Leaflet's
// OpenStreetMap for Mapbox or Google later means editing this one file — the map
// components below never hardcode a provider.

export interface MapTileProvider {
  name: string;
  urlTemplate: string;
  attribution: string;
  maxZoom: number;
}

export const openStreetMap: MapTileProvider = {
  name: "OpenStreetMap",
  urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

// The provider the app currently uses.
export const activeTileProvider = openStreetMap;
