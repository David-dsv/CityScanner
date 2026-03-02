import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import {
  PARIS_15_CENTER,
  METRO_LINE_6_ROUTE,
  METRO_LINE_6_STATIONS,
  BUS_ROUTES,
  TAXI_ZONES,
  generatePollutionGrid,
  generateHeatGrid,
  ROAD_QUALITY
} from '../data/paris15';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Map({ layers, onDataUpdate }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationRef = useRef(null);
  const vehiclesRef = useRef({ metro: [], buses: [], taxis: [] });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  const addDataSources = useCallback(() => {
    if (!map.current) return;

    map.current.addSource('pollution', {
      type: 'geojson',
      data: generatePollutionGrid()
    });

    map.current.addSource('heat-islands', {
      type: 'geojson',
      data: generateHeatGrid()
    });

    map.current.addSource('metro-line-6', {
      type: 'geojson',
      data: METRO_LINE_6_ROUTE
    });

    map.current.addSource('metro-stations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: METRO_LINE_6_STATIONS.map(station => ({
          type: 'Feature',
          properties: { name: station.name },
          geometry: { type: 'Point', coordinates: [station.lng, station.lat] }
        }))
      }
    });

    BUS_ROUTES.forEach(route => {
      map.current.addSource(`bus-route-${route.id}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: route.name },
          geometry: { type: 'LineString', coordinates: route.route }
        }
      });
    });

    map.current.addSource('road-quality', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: ROAD_QUALITY.map(road => ({
          type: 'Feature',
          properties: { quality: road.quality, name: road.name },
          geometry: { type: 'LineString', coordinates: [road.start, road.end] }
        }))
      }
    });

    map.current.addSource('vehicles', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
  }, []);

  const addDataLayers = useCallback(() => {
    if (!map.current) return;

    // Pollution heatmap
    map.current.addLayer({
      id: 'pollution-heat',
      type: 'heatmap',
      source: 'pollution',
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': 0.8,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(34, 197, 94, 0)',
          0.2, 'rgba(34, 197, 94, 0.3)',
          0.4, 'rgba(234, 179, 8, 0.5)',
          0.6, 'rgba(249, 115, 22, 0.7)',
          0.8, 'rgba(239, 68, 68, 0.85)',
          1, 'rgba(220, 38, 38, 1)'
        ],
        'heatmap-radius': 30,
        'heatmap-opacity': 0.7
      }
    });

    // Heat islands
    map.current.addLayer({
      id: 'heat-islands-layer',
      type: 'heatmap',
      source: 'heat-islands',
      layout: { visibility: 'none' },
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(255, 255, 0, 0)',
          0.3, 'rgba(255, 200, 0, 0.4)',
          0.5, 'rgba(255, 150, 0, 0.6)',
          0.7, 'rgba(255, 100, 0, 0.8)',
          1, 'rgba(255, 50, 0, 1)'
        ],
        'heatmap-radius': 35,
        'heatmap-opacity': 0.6
      }
    });

    // Metro line
    map.current.addLayer({
      id: 'metro-line-6-layer',
      type: 'line',
      source: 'metro-line-6',
      paint: { 'line-color': '#22c55e', 'line-width': 4, 'line-opacity': 0.8 }
    });

    // Metro stations
    map.current.addLayer({
      id: 'metro-stations-layer',
      type: 'circle',
      source: 'metro-stations',
      paint: {
        'circle-radius': 8,
        'circle-color': '#22c55e',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Bus routes
    BUS_ROUTES.forEach(route => {
      map.current.addLayer({
        id: `bus-route-${route.id}-layer`,
        type: 'line',
        source: `bus-route-${route.id}`,
        paint: {
          'line-color': route.color,
          'line-width': 3,
          'line-opacity': 0.7,
          'line-dasharray': [2, 1]
        }
      });
    });

    // Road quality
    map.current.addLayer({
      id: 'road-quality-layer',
      type: 'line',
      source: 'road-quality',
      layout: { visibility: 'none' },
      paint: {
        'line-color': [
          'interpolate', ['linear'], ['get', 'quality'],
          0, '#ef4444', 0.5, '#f59e0b', 1, '#22c55e'
        ],
        'line-width': 6,
        'line-opacity': 0.8
      }
    });

    // Vehicles
    map.current.addLayer({
      id: 'vehicles-layer',
      type: 'circle',
      source: 'vehicles',
      paint: {
        'circle-radius': ['match', ['get', 'type'], 'metro', 10, 'bus', 8, 'taxi', 6, 6],
        'circle-color': ['match', ['get', 'type'], 'metro', '#22c55e', 'bus', '#f97316', 'taxi', '#eab308', '#ffffff'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9
      }
    });

    // Station labels
    map.current.addLayer({
      id: 'metro-stations-labels',
      type: 'symbol',
      source: 'metro-stations',
      layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.5], 'text-anchor': 'top' },
      paint: { 'text-color': '#ffffff', 'text-halo-color': '#000', 'text-halo-width': 1 }
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    if (!mapboxgl.accessToken) {
      setError('Token Mapbox manquant');
      return;
    }

    console.log('Initializing map with token:', mapboxgl.accessToken.slice(0, 20) + '...');

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [PARIS_15_CENTER.lng, PARIS_15_CENTER.lat],
      zoom: 13,
      pitch: 0,
      bearing: 0,
      antialias: false,
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: false
    });

    map.current.on('error', (e) => {
      console.error('Mapbox error:', e);
      setError('Erreur Mapbox: ' + (e.error?.message || e.message || 'Erreur inconnue'));
    });

    // Handle WebGL context loss
    const canvas = map.current.getCanvas();
    canvas.addEventListener('webglcontextlost', (e) => {
      console.warn('WebGL context lost, preventing default...');
      e.preventDefault();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');

      // 3D buildings - simplified for performance
      const styleLayers = map.current.getStyle().layers;
      const labelLayerId = styleLayers.find(l => l.type === 'symbol' && l.layout['text-field'])?.id;

      map.current.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#1a1a2e',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, ['get', 'height']],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }
      }, labelLayerId);

      addDataSources();
      addDataLayers();
      setMapLoaded(true);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      map.current?.remove();
    };
  }, [addDataSources, addDataLayers]);

  // Animation
  useEffect(() => {
    if (!mapLoaded) return;

    const speed = 0.002;

    vehiclesRef.current.metro = [
      { progress: 0, direction: 1 },
      { progress: 0.5, direction: -1 }
    ];

    vehiclesRef.current.buses = BUS_ROUTES.map(() => ({
      progress: Math.random(),
      direction: Math.random() > 0.5 ? 1 : -1
    }));

    vehiclesRef.current.taxis = TAXI_ZONES.flatMap(zone =>
      Array(2).fill(null).map(() => ({
        lng: zone.lng + (Math.random() - 0.5) * zone.radius * 2,
        lat: zone.lat + (Math.random() - 0.5) * zone.radius * 2,
        targetLng: zone.lng + (Math.random() - 0.5) * zone.radius * 2,
        targetLat: zone.lat + (Math.random() - 0.5) * zone.radius * 2,
        zone
      }))
    );

    const animate = () => {
      const features = [];

      // Metro
      vehiclesRef.current.metro.forEach(m => {
        m.progress += speed * m.direction;
        if (m.progress >= 1 || m.progress <= 0) m.direction *= -1;
        const route = turf.lineString(METRO_LINE_6_ROUTE.geometry.coordinates);
        const point = turf.along(route, Math.abs(m.progress) * turf.length(route));
        features.push({ type: 'Feature', properties: { type: 'metro' }, geometry: point.geometry });
      });

      // Buses
      vehiclesRef.current.buses.forEach((b, i) => {
        b.progress += speed * 0.8 * b.direction;
        if (b.progress >= 1 || b.progress <= 0) b.direction *= -1;
        const route = turf.lineString(BUS_ROUTES[i].route);
        const point = turf.along(route, Math.abs(b.progress) * turf.length(route));
        features.push({ type: 'Feature', properties: { type: 'bus' }, geometry: point.geometry });
      });

      // Taxis
      vehiclesRef.current.taxis.forEach(t => {
        const dx = t.targetLng - t.lng;
        const dy = t.targetLat - t.lat;
        if (Math.sqrt(dx*dx + dy*dy) < 0.0002) {
          t.targetLng = t.zone.lng + (Math.random() - 0.5) * t.zone.radius * 2;
          t.targetLat = t.zone.lat + (Math.random() - 0.5) * t.zone.radius * 2;
        } else {
          t.lng += dx * 0.02;
          t.lat += dy * 0.02;
        }
        features.push({ type: 'Feature', properties: { type: 'taxi' }, geometry: { type: 'Point', coordinates: [t.lng, t.lat] } });
      });

      if (map.current?.getSource('vehicles')) {
        map.current.getSource('vehicles').setData({ type: 'FeatureCollection', features });
      }

      if (onDataUpdate) {
        onDataUpdate({
          vehicleCount: features.length,
          metroCount: vehiclesRef.current.metro.length,
          busCount: vehiclesRef.current.buses.length,
          taxiCount: vehiclesRef.current.taxis.length,
          avgPm25: 28,
          avgNo2: 35,
          dataPoints: 150
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [mapLoaded, onDataUpdate]);

  // Toggle layers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    ['pollution-heat', 'heat-islands-layer', 'road-quality-layer'].forEach(id => {
      if (map.current.getLayer(id)) {
        const visible = (id === 'pollution-heat' && layers.pollution) ||
                       (id === 'heat-islands-layer' && layers.heat) ||
                       (id === 'road-quality-layer' && layers.roads);
        map.current.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    });
  }, [layers, mapLoaded]);

  if (error) {
    return (
      <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#ef4444' }}>
        <p>{error}</p>
        <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
          Token: {mapboxgl.accessToken ? mapboxgl.accessToken.slice(0, 25) + '...' : 'NON DÉFINI'}
        </p>
      </div>
    );
  }

  return <div ref={mapContainer} className="map-container" />;
}
