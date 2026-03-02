// Paris 15th arrondissement boundaries and key locations
export const PARIS_15_CENTER = {
  lng: 2.2927,
  lat: 48.8421,
  zoom: 14
};

// 15th arrondissement boundary (simplified polygon)
export const PARIS_15_BOUNDARY = {
  type: 'Feature',
  properties: { name: '15ème Arrondissement' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [2.2734, 48.8281],
      [2.2734, 48.8561],
      [2.3187, 48.8561],
      [2.3187, 48.8281],
      [2.2734, 48.8281]
    ]]
  }
};

// Metro Line 6 stations in 15th (elevated line - perfect for City Scanner visualization)
export const METRO_LINE_6_STATIONS = [
  { name: 'Bir-Hakeim', lng: 2.2891, lat: 48.8539, order: 0 },
  { name: 'Dupleix', lng: 2.2926, lat: 48.8505, order: 1 },
  { name: 'La Motte-Picquet-Grenelle', lng: 2.2987, lat: 48.8491, order: 2 },
  { name: 'Cambronne', lng: 2.3023, lat: 48.8473, order: 3 },
  { name: 'Sèvres-Lecourbe', lng: 2.3085, lat: 48.8451, order: 4 },
  { name: 'Pasteur', lng: 2.3126, lat: 48.8426, order: 5 },
];

// Metro Line 6 route (simplified path between stations)
export const METRO_LINE_6_ROUTE = {
  type: 'Feature',
  properties: { name: 'Ligne 6', color: '#6ECA97' },
  geometry: {
    type: 'LineString',
    coordinates: [
      [2.2891, 48.8539],
      [2.2910, 48.8520],
      [2.2926, 48.8505],
      [2.2955, 48.8498],
      [2.2987, 48.8491],
      [2.3005, 48.8482],
      [2.3023, 48.8473],
      [2.3055, 48.8462],
      [2.3085, 48.8451],
      [2.3105, 48.8438],
      [2.3126, 48.8426],
    ]
  }
};

// Bus routes in 15th arrondissement
export const BUS_ROUTES = [
  {
    id: 'bus-39',
    name: 'Bus 39',
    color: '#F28E2B',
    route: [
      [2.2780, 48.8350],
      [2.2850, 48.8400],
      [2.2920, 48.8450],
      [2.2990, 48.8500],
      [2.3060, 48.8450],
      [2.3130, 48.8400],
    ]
  },
  {
    id: 'bus-62',
    name: 'Bus 62',
    color: '#E15759',
    route: [
      [2.2750, 48.8450],
      [2.2850, 48.8480],
      [2.2950, 48.8510],
      [2.3050, 48.8480],
      [2.3150, 48.8450],
    ]
  },
  {
    id: 'bus-80',
    name: 'Bus 80',
    color: '#59A14F',
    route: [
      [2.2800, 48.8300],
      [2.2850, 48.8350],
      [2.2900, 48.8400],
      [2.2950, 48.8350],
      [2.3000, 48.8300],
      [2.3050, 48.8350],
      [2.3100, 48.8400],
    ]
  }
];

// Taxi zones (high activity areas)
export const TAXI_ZONES = [
  { name: 'Gare Montparnasse', lng: 2.3200, lat: 48.8420, radius: 0.003 },
  { name: 'Centre Beaugrenelle', lng: 2.2794, lat: 48.8461, radius: 0.002 },
  { name: 'Place Balard', lng: 2.2784, lat: 48.8367, radius: 0.002 },
  { name: 'Convention', lng: 2.2967, lat: 48.8372, radius: 0.002 },
];

// Airparif stations (existing air quality monitoring)
export const AIRPARIF_STATIONS = [
  { name: 'Paris 15ème - Convention', lng: 2.2971, lat: 48.8384, type: 'urban' },
  { name: 'Paris 15ème - Lecourbe', lng: 2.3012, lat: 48.8412, type: 'traffic' },
];

// Simulated pollution hotspots
export const POLLUTION_HOTSPOTS = [
  { lng: 2.2820, lat: 48.8380, intensity: 0.9, name: 'Zone industrielle Grenelle' },
  { lng: 2.3100, lat: 48.8420, intensity: 0.85, name: 'Carrefour Pasteur' },
  { lng: 2.2950, lat: 48.8490, intensity: 0.75, name: 'Avenue Émile Zola' },
  { lng: 2.2780, lat: 48.8460, intensity: 0.7, name: 'Beaugrenelle' },
  { lng: 2.3050, lat: 48.8350, intensity: 0.65, name: 'Porte de Versailles' },
];

// Heat island zones
export const HEAT_ISLANDS = [
  { lng: 2.2950, lat: 48.8420, intensity: 0.8, temp: 32, name: 'Centre commercial' },
  { lng: 2.2800, lat: 48.8370, intensity: 0.7, temp: 30, name: 'Zone béton Balard' },
  { lng: 2.3100, lat: 48.8380, intensity: 0.6, temp: 29, name: 'Vaugirard' },
  { lng: 2.2880, lat: 48.8500, intensity: 0.5, temp: 28, name: 'Grenelle' },
];

// Road quality segments (simulated accelerometer data)
export const ROAD_QUALITY = [
  {
    start: [2.2750, 48.8400],
    end: [2.2850, 48.8400],
    quality: 0.3, // 0 = bad, 1 = good
    name: 'Rue de Vaugirard (ouest)'
  },
  {
    start: [2.2850, 48.8400],
    end: [2.2950, 48.8400],
    quality: 0.7,
    name: 'Rue de Vaugirard (centre)'
  },
  {
    start: [2.2950, 48.8400],
    end: [2.3100, 48.8400],
    quality: 0.9,
    name: 'Rue de Vaugirard (est)'
  },
  {
    start: [2.2800, 48.8350],
    end: [2.2800, 48.8450],
    quality: 0.5,
    name: 'Rue de la Convention'
  },
  {
    start: [2.3000, 48.8300],
    end: [2.3000, 48.8500],
    quality: 0.4,
    name: 'Boulevard Pasteur'
  },
];

// Generate pollution heatmap data points
export function generatePollutionGrid() {
  const points = [];
  const baseLng = 2.2734;
  const baseLat = 48.8281;
  const step = 0.004;

  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 8; j++) {
      const lng = baseLng + (i * step);
      const lat = baseLat + (j * step);

      // Calculate distance-based intensity from hotspots
      let intensity = 0.2 + Math.random() * 0.2;
      POLLUTION_HOTSPOTS.forEach(hotspot => {
        const dist = Math.sqrt(
          Math.pow(lng - hotspot.lng, 2) +
          Math.pow(lat - hotspot.lat, 2)
        );
        if (dist < 0.01) {
          intensity += hotspot.intensity * (1 - dist / 0.01);
        }
      });

      points.push({
        type: 'Feature',
        properties: {
          intensity: Math.min(1, intensity),
          pm25: Math.round(10 + intensity * 80),
          no2: Math.round(20 + intensity * 60)
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features: points
  };
}

// Generate heat island data
export function generateHeatGrid() {
  const points = [];
  const baseLng = 2.2734;
  const baseLat = 48.8281;
  const step = 0.005;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 6; j++) {
      const lng = baseLng + (i * step);
      const lat = baseLat + (j * step);

      let temp = 24 + Math.random() * 3;
      HEAT_ISLANDS.forEach(island => {
        const dist = Math.sqrt(
          Math.pow(lng - island.lng, 2) +
          Math.pow(lat - island.lat, 2)
        );
        if (dist < 0.008) {
          temp += island.intensity * 8 * (1 - dist / 0.008);
        }
      });

      points.push({
        type: 'Feature',
        properties: {
          temperature: Math.round(temp * 10) / 10,
          intensity: (temp - 24) / 10
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features: points
  };
}
