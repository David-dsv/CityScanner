import { useState, useEffect } from 'react';
import { Wind, Bus, Train, Car, MapPin, TrendingUp } from 'lucide-react';

export default function Dashboard({ data, layers }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getPm25Status = (value) => {
    if (value <= 25) return { label: 'Bon', color: '#22c55e' };
    if (value <= 50) return { label: 'Modéré', color: '#eab308' };
    if (value <= 75) return { label: 'Médiocre', color: '#f97316' };
    return { label: 'Mauvais', color: '#ef4444' };
  };

  const pm25Status = getPm25Status(data?.avgPm25 || 0);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>City Scanner</h1>
          <p className="subtitle">Paris 15ème - Demo</p>
        </div>
        <div className="time">
          <p className="time-value">{time.toLocaleTimeString('fr-FR')}</p>
          <p className="time-date">{time.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {/* Air Quality */}
        <div className="card">
          <div className="card-header">
            <Wind size={18} color="#888" />
            <span>Qualité de l'air</span>
            <span className="status-badge" style={{ color: pm25Status.color }}>
              {pm25Status.label}
            </span>
          </div>
          <div className="metrics">
            <div className="metric">
              <span className="metric-value">{data?.avgPm25 || '--'}</span>
              <span className="metric-label">PM2.5 (µg/m³)</span>
            </div>
            <div className="metric">
              <span className="metric-value">{data?.avgNo2 || '--'}</span>
              <span className="metric-label">NO₂ (µg/m³)</span>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="card">
          <div className="card-header">
            <span>Capteurs mobiles actifs</span>
          </div>
          <div className="vehicles">
            <div className="vehicle">
              <Train size={16} color="#22c55e" />
              <span className="vehicle-count">{data?.metroCount || 0}</span>
              <span className="vehicle-label">Métro</span>
            </div>
            <div className="vehicle">
              <Bus size={16} color="#f97316" />
              <span className="vehicle-count">{data?.busCount || 0}</span>
              <span className="vehicle-label">Bus</span>
            </div>
            <div className="vehicle">
              <Car size={16} color="#eab308" />
              <span className="vehicle-count">{data?.taxiCount || 0}</span>
              <span className="vehicle-label">Taxis</span>
            </div>
          </div>
        </div>

        {/* Data Points */}
        <div className="card">
          <div className="card-header">
            <MapPin size={18} color="#888" />
            <span>Points de données</span>
            <span className="data-count">
              {((data?.dataPoints || 0) * 1.6).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Comparison */}
        <div className="card comparison">
          <p className="comparison-title">Comparaison Airparif</p>
          <div className="comparison-row">
            <div>
              <span className="comparison-label">Stations fixes</span>
              <span className="comparison-value">2</span>
            </div>
            <div className="comparison-arrow">
              <TrendingUp size={20} color="#22c55e" />
              <span style={{ color: '#22c55e' }}>+{Math.round((data?.dataPoints || 375) / 2)}x</span>
            </div>
            <div>
              <span className="comparison-label">City Scanner</span>
              <span className="comparison-value">{data?.dataPoints || 375}</span>
            </div>
          </div>
        </div>

        {/* Active Layers */}
        <div className="card">
          <p className="layers-title">Couches actives</p>
          <div className="layers-list">
            {layers.pollution && <span className="layer-tag green">Pollution</span>}
            {layers.heat && <span className="layer-tag orange">Îlots chaleur</span>}
            {layers.roads && <span className="layer-tag blue">Routes</span>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <span>MIT Senseable City Lab</span>
        <span className="live-indicator">
          <span className="live-dot"></span>
          Live
        </span>
      </div>
    </div>
  );
}
