// Everything that is specific to a single campus lives here.
// Today that campus is VSU Main. When we expand to other campuses later,
// this is the only file whose shape needs to change — nothing else hardcodes VSU.

export interface CampusConfig {
  id: string;
  name: string;
  shortName: string;
  // Where the map first centers, and the reference point for "distance to campus".
  center: { latitude: number; longitude: number };
  mainGate: { latitude: number; longitude: number };
  defaultZoom: number;
  // How far out (in km) we consider a boarding house "near" this campus.
  serviceRadiusKm: number;
}

export const VSU_MAIN: CampusConfig = {
  id: "vsu-main",
  name: "Visayas State University — Main Campus",
  shortName: "VSU Main",
  center: { latitude: 10.7449, longitude: 124.7936 },
  mainGate: { latitude: 10.7442, longitude: 124.7975 },
  defaultZoom: 15,
  serviceRadiusKm: 3,
};

// The active campus for this deployment. Single source of truth.
export const activeCampus = VSU_MAIN;
