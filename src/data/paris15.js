// Paris 15th arrondissement - Real data with OSRM routing
export const PARIS_15_CENTER = {
  lng: 2.2927,
  lat: 48.8421,
  zoom: 14
};

// Metro Line 6 stations (real coordinates)
export const METRO_LINE_6_STATIONS = [
  { name: 'Bir-Hakeim', lng: 2.2891, lat: 48.8539 },
  { name: 'Dupleix', lng: 2.2935, lat: 48.8507 },
  { name: 'La Motte-Picquet', lng: 2.2989, lat: 48.8491 },
  { name: 'Cambronne', lng: 2.3023, lat: 48.8474 },
  { name: 'Sèvres-Lecourbe', lng: 2.3087, lat: 48.8451 },
  { name: 'Pasteur', lng: 2.3127, lat: 48.8426 },
];

// Metro Line 6 - follows elevated viaduct
export const METRO_LINE_6_ROUTE = {
  type: 'Feature',
  properties: { name: 'Ligne 6' },
  geometry: {
    type: 'LineString',
    coordinates: [
      [2.2891, 48.8539], [2.2902, 48.8528], [2.2915, 48.8518], [2.2935, 48.8507],
      [2.2952, 48.8501], [2.2968, 48.8496], [2.2989, 48.8491], [2.3006, 48.8483],
      [2.3023, 48.8474], [2.3045, 48.8465], [2.3065, 48.8458], [2.3087, 48.8451],
      [2.3107, 48.8439], [2.3127, 48.8426]
    ]
  }
};

// Bus route definitions (start/end points for OSRM routing)
export const BUS_ROUTE_DEFINITIONS = [
  { id: 'bus-42', name: 'Bus 42', color: '#00B4D8',
    waypoints: [[2.2904, 48.8550], [2.2780, 48.8490], [2.2650, 48.8430]] },
  { id: 'bus-70', name: 'Bus 70', color: '#E63946',
    waypoints: [[2.3180, 48.8430], [2.2980, 48.8405], [2.2780, 48.8380]] },
  { id: 'bus-80', name: 'Bus 80', color: '#2A9D8F',
    waypoints: [[2.3127, 48.8426], [2.3000, 48.8370], [2.2880, 48.8310]] },
  { id: 'bus-39', name: 'Bus 39', color: '#F4A261',
    waypoints: [[2.2965, 48.8520], [2.2960, 48.8420], [2.2955, 48.8330]] },
  { id: 'bus-62', name: 'Bus 62', color: '#9B5DE5',
    waypoints: [[2.2760, 48.8475], [2.2880, 48.8490], [2.3000, 48.8485]] },
  { id: 'bus-88', name: 'Bus 88', color: '#FF6B6B',
    waypoints: [[2.2920, 48.8520], [2.2915, 48.8450], [2.2905, 48.8380]] },
];

// Taxi origin-destination pairs for OSRM routing
export const TAXI_OD_PAIRS = [
  { from: [2.3190, 48.8425], to: [2.2800, 48.8480] }, // Montparnasse → Beaugrenelle
  { from: [2.2800, 48.8480], to: [2.2880, 48.8320] }, // Beaugrenelle → Porte de Versailles
  { from: [2.2880, 48.8320], to: [2.2960, 48.8490] }, // Porte de Versailles → La Motte-Picquet
  { from: [2.2960, 48.8490], to: [2.3190, 48.8425] }, // La Motte-Picquet → Montparnasse
  { from: [2.2780, 48.8370], to: [2.3100, 48.8420] }, // Balard → Pasteur
  { from: [2.3100, 48.8420], to: [2.2920, 48.8510] }, // Pasteur → Commerce
  { from: [2.2920, 48.8510], to: [2.2780, 48.8370] }, // Commerce → Balard
  { from: [2.2850, 48.8400], to: [2.3050, 48.8380] }, // Vaugirard → Lecourbe
  { from: [2.3050, 48.8380], to: [2.2750, 48.8470] }, // Lecourbe → Zola
  { from: [2.2750, 48.8470], to: [2.2850, 48.8400] }, // Zola → Vaugirard
];

// Fetch route from OSRM
export async function fetchRoute(waypoints) {
  const coords = waypoints.map(p => `${p[0]},${p[1]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates;
    }
  } catch (e) {
    console.warn('OSRM fetch failed:', e);
  }
  return null;
}

// Fetch all bus routes
export async function fetchAllBusRoutes() {
  const routes = [];
  for (const def of BUS_ROUTE_DEFINITIONS) {
    const coords = await fetchRoute(def.waypoints);
    routes.push({
      ...def,
      route: coords || def.waypoints // fallback to waypoints if fetch fails
    });
  }
  return routes;
}

// Fetch taxi routes
export async function fetchTaxiRoutes() {
  const routes = [];
  for (const od of TAXI_OD_PAIRS) {
    const coords = await fetchRoute([od.from, od.to]);
    if (coords) {
      routes.push(coords);
    }
  }
  return routes;
}

// Pollution hotspots
export const POLLUTION_HOTSPOTS = [
  { lng: 2.2960, lat: 48.8380, intensity: 0.9 },
  { lng: 2.3127, lat: 48.8426, intensity: 0.85 },
  { lng: 2.2930, lat: 48.8495, intensity: 0.7 },
  { lng: 2.2794, lat: 48.8480, intensity: 0.75 },
  { lng: 2.2880, lat: 48.8320, intensity: 0.8 },
  { lng: 2.3031, lat: 48.8378, intensity: 0.65 },
];

// Heat islands
export const HEAT_ISLANDS = [
  { lng: 2.2794, lat: 48.8480, intensity: 0.85 },
  { lng: 2.2880, lat: 48.8320, intensity: 0.8 },
  { lng: 2.2960, lat: 48.8400, intensity: 0.7 },
  { lng: 2.3127, lat: 48.8426, intensity: 0.65 },
];

// Road quality (disabled for now - coordinates don't match)
export const ROAD_QUALITY = [];

// Main road corridors for pollution concentration
const ROAD_CORRIDORS = [
  // Rue de Vaugirard
  { start: [2.2780, 48.8380], end: [2.3180, 48.8430], width: 0.003, intensity: 0.7 },
  // Rue Lecourbe
  { start: [2.2880, 48.8310], end: [2.3127, 48.8426], width: 0.003, intensity: 0.65 },
  // Avenue Emile Zola
  { start: [2.2760, 48.8475], end: [2.3000, 48.8490], width: 0.0025, intensity: 0.6 },
  // Rue de la Convention
  { start: [2.2955, 48.8330], end: [2.2970, 48.8520], width: 0.0025, intensity: 0.55 },
  // Boulevard de Grenelle
  { start: [2.2650, 48.8430], end: [2.2900, 48.8550], width: 0.003, intensity: 0.5 },
];

// Distance from point to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.sqrt(Math.pow(px - projX, 2) + Math.pow(py - projY, 2));
}

// Generate pollution heatmap - follows roads
export function generatePollutionGrid() {
  const points = [];
  const step = 0.0015; // Denser grid

  for (let lng = 2.2600; lng <= 2.3240; lng += step) {
    for (let lat = 48.8270; lat <= 48.8590; lat += step) {
      let intensity = 0.05; // Lower base

      // Add intensity from hotspots (smooth falloff)
      POLLUTION_HOTSPOTS.forEach(h => {
        const dist = Math.sqrt(Math.pow(lng - h.lng, 2) + Math.pow(lat - h.lat, 2));
        if (dist < 0.02) {
          intensity += h.intensity * 0.6 * Math.pow(1 - dist / 0.02, 2);
        }
      });

      // Add intensity from road corridors
      ROAD_CORRIDORS.forEach(road => {
        const dist = distToSegment(lng, lat, road.start[0], road.start[1], road.end[0], road.end[1]);
        if (dist < road.width) {
          intensity += road.intensity * 0.4 * Math.pow(1 - dist / road.width, 1.5);
        }
      });

      if (intensity > 0.08) {
        points.push({
          type: 'Feature',
          properties: { intensity: Math.min(1, intensity) },
          geometry: { type: 'Point', coordinates: [lng, lat] }
        });
      }
    }
  }
  return { type: 'FeatureCollection', features: points };
}

// Generate heat grid - concentrated in built areas
export function generateHeatGrid() {
  const points = [];
  const step = 0.002;

  for (let lng = 2.2600; lng <= 2.3240; lng += step) {
    for (let lat = 48.8270; lat <= 48.8590; lat += step) {
      let intensity = 0.03;

      HEAT_ISLANDS.forEach(h => {
        const dist = Math.sqrt(Math.pow(lng - h.lng, 2) + Math.pow(lat - h.lat, 2));
        if (dist < 0.018) {
          intensity += h.intensity * 0.7 * Math.pow(1 - dist / 0.018, 2);
        }
      });

      if (intensity > 0.08) {
        points.push({
          type: 'Feature',
          properties: { intensity: Math.min(1, intensity) },
          geometry: { type: 'Point', coordinates: [lng, lat] }
        });
      }
    }
  }
  return { type: 'FeatureCollection', features: points };
}
