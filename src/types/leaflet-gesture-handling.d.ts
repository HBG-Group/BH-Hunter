// The plugin adds these options to Leaflet maps; declare them so react-leaflet's
// MapContainer accepts the `gestureHandling` prop.
import "leaflet";

declare module "leaflet" {
  interface MapOptions {
    gestureHandling?: boolean;
    gestureHandlingOptions?: {
      text?: { touch?: string; scroll?: string; scrollMac?: string };
      duration?: number;
    };
  }
}
