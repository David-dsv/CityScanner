import { useState, useCallback } from 'react';
import Map from './components/Map';
import Dashboard from './components/Dashboard';
import LayerControls from './components/LayerControls';
import './index.css';

function App() {
  const [layers, setLayers] = useState({
    pollution: true,
    heat: false,
    roads: false
  });

  const [data, setData] = useState({
    vehicleCount: 0,
    metroCount: 0,
    busCount: 0,
    taxiCount: 0,
    avgPm25: 0,
    avgNo2: 0,
    dataPoints: 0
  });

  const handleToggleLayer = useCallback((layerId) => {
    setLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  }, []);

  const handleDataUpdate = useCallback((newData) => {
    setData(newData);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0a', position: 'relative' }}>
      <Map layers={layers} onDataUpdate={handleDataUpdate} />
      <Dashboard data={data} layers={layers} />
      <LayerControls layers={layers} onToggle={handleToggleLayer} />

      <div className="bottom-bar">
        <div className="live">
          <span className="live-dot"></span>
          <span>Simulation en direct</span>
        </div>
        <div className="separator"></div>
        <span>Zone: <span className="highlight">15ème Arrondissement</span></span>
        <div className="separator"></div>
        <span>Capteurs: <span className="highlight">{data.vehicleCount}</span></span>
      </div>

      <div className="mit-badge">
        <span>MIT Senseable City Lab</span>
      </div>
    </div>
  );
}

export default App;
