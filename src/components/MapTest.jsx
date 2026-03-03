import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapTest() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    if (map.current) return;

    setStatus('Creating map...');

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Simpler style
        center: [2.2927, 48.8421],
        zoom: 12
      });

      map.current.on('load', () => {
        setStatus('Map loaded!');
      });

      map.current.on('error', (e) => {
        setStatus('Error: ' + (e.error?.message || e.message));
      });

      // Monitor canvas for WebGL issues
      const canvas = map.current.getCanvas();
      canvas.addEventListener('webglcontextlost', () => {
        setStatus('WebGL context lost!');
      });

    } catch (e) {
      setStatus('Failed: ' + e.message);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 8,
        zIndex: 100
      }}>
        Status: {status}
      </div>
    </div>
  );
}
