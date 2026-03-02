import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import {
  PARIS_15_CENTER,
  METRO_LINE_6_ROUTE,
  METRO_LINE_6_STATIONS,
  fetchAllBusRoutes,
  fetchTaxiRoutes,
  generatePollutionGrid,
  generateHeatGrid
} from '../data/paris15';

export default function Map({ layers, onDataUpdate }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationRef = useRef(null);
  const layersRef = useRef({});
  const vehicleMarkersRef = useRef([]);
  const routesRef = useRef({ buses: [], taxis: [] });
  const vehiclesRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routesLoaded, setRoutesLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [PARIS_15_CENTER.lat, PARIS_15_CENTER.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Dark basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map.current);

    // Metro Line 6 - glow effect
    L.polyline(METRO_LINE_6_ROUTE.geometry.coordinates.map(c => [c[1], c[0]]),
      { color: '#22c55e', weight: 10, opacity: 0.15 }).addTo(map.current);
    L.polyline(METRO_LINE_6_ROUTE.geometry.coordinates.map(c => [c[1], c[0]]),
      { color: '#22c55e', weight: 5, opacity: 0.9 }).addTo(map.current);

    // Metro stations
    METRO_LINE_6_STATIONS.forEach(station => {
      L.circleMarker([station.lat, station.lng], {
        radius: 10, fillColor: '#22c55e', color: 'transparent', fillOpacity: 0.25
      }).addTo(map.current);
      L.circleMarker([station.lat, station.lng], {
        radius: 6, fillColor: '#22c55e', color: '#fff', weight: 2, fillOpacity: 1
      }).bindTooltip(station.name, { permanent: false, direction: 'top', className: 'station-tooltip' })
        .addTo(map.current);
    });

    // Pollution heatmap - diverse colors from green to red
    const pollutionData = generatePollutionGrid();
    const heatData = pollutionData.features.map(f => [
      f.geometry.coordinates[1], f.geometry.coordinates[0], f.properties.intensity
    ]);
    const pollutionHeatLayer = L.heatLayer(heatData, {
      radius: 18,
      blur: 25,
      maxZoom: 19,
      max: 0.85,
      minOpacity: 0.2,
      gradient: {
        0.0: 'rgba(34, 197, 94, 0.4)',    // Green - clean areas
        0.15: 'rgba(34, 197, 94, 0.55)',  // Green
        0.3: 'rgba(132, 204, 22, 0.6)',   // Light green
        0.45: 'rgba(234, 179, 8, 0.65)',  // Yellow - moderate
        0.6: 'rgba(249, 115, 22, 0.7)',   // Orange
        0.75: 'rgba(239, 68, 68, 0.8)',   // Red - polluted
        0.9: 'rgba(185, 28, 28, 0.85)',   // Dark red
        1.0: 'rgba(127, 29, 29, 0.9)'     // Very dark red - hotspots
      }
    });
    pollutionHeatLayer.addTo(map.current);
    layersRef.current.pollution = pollutionHeatLayer;

    // Heat islands - smooth and unified
    const heatGridData = generateHeatGrid();
    const heatIslandData = heatGridData.features.map(f => [
      f.geometry.coordinates[1], f.geometry.coordinates[0], f.properties.intensity
    ]);
    layersRef.current.heat = L.heatLayer(heatIslandData, {
      radius: 30,
      blur: 35,
      maxZoom: 18,
      max: 0.6,
      minOpacity: 0.1,
      gradient: {
        0.0: 'rgba(255, 200, 0, 0)',
        0.2: 'rgba(255, 180, 0, 0.3)',
        0.4: 'rgba(255, 140, 0, 0.45)',
        0.6: 'rgba(255, 100, 0, 0.6)',
        0.8: 'rgba(255, 60, 0, 0.75)',
        1.0: 'rgba(220, 38, 38, 0.9)'
      }
    });

    // Empty road quality layer
    layersRef.current.roads = L.layerGroup();

    setMapLoaded(true);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Fetch real routes from OSRM
  useEffect(() => {
    if (!mapLoaded) return;

    const loadRoutes = async () => {
      console.log('Fetching real routes from OSRM...');

      try {
        const [busRoutes, taxiRoutes] = await Promise.all([
          fetchAllBusRoutes(),
          fetchTaxiRoutes()
        ]);

        routesRef.current.buses = busRoutes;
        routesRef.current.taxis = taxiRoutes;

        console.log(`Loaded ${busRoutes.length} bus routes, ${taxiRoutes.length} taxi routes`);

        // Initialize vehicles with real routes - much slower, realistic speeds
        const metros = Array(4).fill(null).map((_, i) => ({
          progress: i / 4,
          direction: i % 2 === 0 ? 1 : -1,
          baseSpeed: 0.000035 + Math.random() * 0.000008, // Much slower base
          currentSpeed: 0
        }));

        const buses = busRoutes.flatMap((route, routeIdx) => {
          return Array(2).fill(null).map((_, i) => ({
            routeIdx,
            progress: (i + Math.random() * 0.3) / 2,
            direction: i % 2 === 0 ? 1 : -1,
            baseSpeed: 0.000025 + Math.random() * 0.00001, // Even slower
            currentSpeed: 0,
            stopTime: 0,
            color: route.color
          }));
        });

        const taxis = taxiRoutes.flatMap((route, routeIdx) => {
          const count = 3 + Math.floor(Math.random() * 2);
          return Array(count).fill(null).map(() => ({
            routeIdx,
            progress: Math.random(),
            direction: Math.random() > 0.5 ? 1 : -1,
            baseSpeed: 0.00004 + Math.random() * 0.00003, // Slower
            currentSpeed: 0,
            state: 'moving',
            stateTimer: 0
          }));
        });

        vehiclesRef.current = { metros, buses, taxis };
        setRoutesLoaded(true);

      } catch (e) {
        console.error('Failed to load routes:', e);
      }
    };

    loadRoutes();
  }, [mapLoaded]);

  // Animation loop
  useEffect(() => {
    if (!routesLoaded || !map.current || !vehiclesRef.current) return;

    const { metros, buses, taxis } = vehiclesRef.current;
    const { buses: busRoutes, taxis: taxiRoutes } = routesRef.current;

    const getPositionOnRoute = (coords, progress) => {
      if (!coords || coords.length < 2) return [PARIS_15_CENTER.lng, PARIS_15_CENTER.lat];

      const clampedProgress = Math.max(0, Math.min(1, progress));
      const totalSegs = coords.length - 1;
      const exactPos = clampedProgress * totalSegs;
      const segIdx = Math.min(Math.floor(exactPos), totalSegs - 1);
      const t = exactPos - segIdx;

      const lng = coords[segIdx][0] + (coords[segIdx + 1][0] - coords[segIdx][0]) * t;
      const lat = coords[segIdx][1] + (coords[segIdx + 1][1] - coords[segIdx][1]) * t;

      return [lng, lat];
    };

    // Smooth easing function for acceleration/deceleration
    const easeSpeed = (progress, baseSpeed) => {
      // Slow down near endpoints (0 and 1)
      const distToEnd = Math.min(progress, 1 - progress);
      const easeFactor = Math.min(1, distToEnd / 0.08); // Ease within 8% of endpoints
      return baseSpeed * (0.3 + 0.7 * easeFactor); // Never fully stop, minimum 30% speed
    };

    const animate = () => {
      vehicleMarkersRef.current.forEach(m => m.remove());
      vehicleMarkersRef.current = [];

      // Metros - smooth movement with easing
      metros.forEach(m => {
        const targetSpeed = easeSpeed(m.progress, m.baseSpeed);
        // Smooth interpolation towards target speed
        m.currentSpeed += (targetSpeed - m.currentSpeed) * 0.05;
        m.progress += m.currentSpeed * m.direction;

        if (m.progress >= 1) { m.progress = 1; m.direction = -1; }
        if (m.progress <= 0) { m.progress = 0; m.direction = 1; }

        const coords = METRO_LINE_6_ROUTE.geometry.coordinates;
        const [lng, lat] = getPositionOnRoute(coords, m.progress);

        vehicleMarkersRef.current.push(
          L.circleMarker([lat, lng], { radius: 14, fillColor: '#22c55e', color: 'transparent', fillOpacity: 0.35 }).addTo(map.current),
          L.circleMarker([lat, lng], { radius: 9, fillColor: '#22c55e', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map.current)
        );
      });

      // Buses - smooth with stops
      buses.forEach(b => {
        const route = busRoutes[b.routeIdx];
        if (!route || !route.route) return;

        if (b.stopTime > 0) {
          b.stopTime--;
          // Gradually slow down when stopping
          b.currentSpeed *= 0.92;
        } else {
          const targetSpeed = easeSpeed(b.progress, b.baseSpeed);
          b.currentSpeed += (targetSpeed - b.currentSpeed) * 0.03; // Slower acceleration
          b.progress += b.currentSpeed * b.direction;

          if (b.progress >= 1 || b.progress <= 0) {
            b.direction *= -1;
            b.progress = Math.max(0, Math.min(1, b.progress));
            if (Math.random() > 0.3) b.stopTime = 200 + Math.floor(Math.random() * 300);
          }

          // Random bus stops (less frequent)
          if (Math.random() < 0.0003) {
            b.stopTime = 150 + Math.floor(Math.random() * 150);
          }
        }

        const [lng, lat] = getPositionOnRoute(route.route, b.progress);

        vehicleMarkersRef.current.push(
          L.circleMarker([lat, lng], { radius: 11, fillColor: '#f97316', color: 'transparent', fillOpacity: 0.35 }).addTo(map.current),
          L.circleMarker([lat, lng], { radius: 7, fillColor: '#f97316', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map.current)
        );
      });

      // Taxis - smooth with variable speeds
      taxis.forEach(t => {
        const route = taxiRoutes[t.routeIdx];
        if (!route) return;

        if (t.state === 'stopped') {
          t.stateTimer--;
          t.currentSpeed *= 0.9; // Gradual stop
          if (t.stateTimer <= 0) {
            t.state = 'moving';
            if (Math.random() > 0.5) t.direction *= -1;
          }
        } else if (t.state === 'waiting') {
          t.stateTimer--;
          t.currentSpeed *= 0.95; // Slow down while waiting
          if (t.stateTimer <= 0) t.state = 'moving';
        } else {
          const targetSpeed = easeSpeed(t.progress, t.baseSpeed);
          t.currentSpeed += (targetSpeed - t.currentSpeed) * 0.04;
          t.progress += t.currentSpeed * t.direction;

          if (t.progress >= 1 || t.progress <= 0) {
            // Switch to different route
            t.routeIdx = Math.floor(Math.random() * taxiRoutes.length);
            t.progress = t.progress >= 1 ? 0 : 1;
            t.direction = Math.random() > 0.5 ? 1 : -1;
            t.currentSpeed = 0; // Reset speed on route change

            if (Math.random() > 0.5) {
              t.state = 'stopped';
              t.stateTimer = 150 + Math.floor(Math.random() * 250);
            }
          }

          // Random traffic stops (less frequent)
          if (Math.random() < 0.0005) {
            t.state = 'waiting';
            t.stateTimer = 80 + Math.floor(Math.random() * 120);
          }
        }

        const currentRoute = taxiRoutes[t.routeIdx];
        if (!currentRoute) return;

        const [lng, lat] = getPositionOnRoute(currentRoute, Math.max(0, Math.min(1, t.progress)));

        vehicleMarkersRef.current.push(
          L.circleMarker([lat, lng], { radius: 9, fillColor: '#eab308', color: 'transparent', fillOpacity: 0.4 }).addTo(map.current),
          L.circleMarker([lat, lng], { radius: 5, fillColor: '#eab308', color: '#fff', weight: 1.5, fillOpacity: 1 }).addTo(map.current)
        );
      });

      if (onDataUpdate) {
        onDataUpdate({
          vehicleCount: metros.length + buses.length + taxis.length,
          metroCount: metros.length,
          busCount: buses.length,
          taxiCount: taxis.length,
          avgPm25: 28,
          avgNo2: 35,
          dataPoints: 180
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [routesLoaded, onDataUpdate]);

  // Toggle layers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    ['pollution', 'roads', 'heat'].forEach(key => {
      const layer = layersRef.current[key];
      if (!layer) return;
      const shouldShow = layers[key];
      const hasLayer = map.current.hasLayer(layer);
      if (shouldShow && !hasLayer) map.current.addLayer(layer);
      if (!shouldShow && hasLayer) map.current.removeLayer(layer);
    });
  }, [layers, mapLoaded]);

  return <div ref={mapContainer} className="map-container" />;
}
