import { Wind, Thermometer, Layers, ChevronDown, ChevronUp, Route } from 'lucide-react';
import { useState } from 'react';

export default function LayerControls({ layers, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const layerConfig = [
    { id: 'pollution', name: 'Pollution', desc: 'PM2.5 & NO₂', icon: Wind, color: '#22c55e' },
    { id: 'heat', name: 'Heat Islands', desc: 'Temperature', icon: Thermometer, color: '#f97316' },
    { id: 'roads', name: 'Road Quality', desc: 'Surface condition', icon: Route, color: '#3b82f6' }
  ];

  return (
    <div className="layer-controls">
      <button className="layer-header" onClick={() => setIsExpanded(!isExpanded)}>
        <Layers size={16} />
        <span>Data Layers</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="layer-content">
          {layerConfig.map((layer) => {
            const Icon = layer.icon;
            const isActive = layers[layer.id];
            return (
              <button
                key={layer.id}
                className={`layer-item ${isActive ? 'active' : ''}`}
                onClick={() => onToggle(layer.id)}
              >
                <Icon size={16} color={isActive ? layer.color : '#666'} />
                <div className="layer-info">
                  <span className="layer-name">{layer.name}</span>
                  <span className="layer-desc">{layer.desc}</span>
                </div>
                <div className={`toggle ${isActive ? 'on' : ''}`} style={isActive ? { backgroundColor: layer.color } : {}}>
                  <div className="toggle-knob" />
                </div>
              </button>
            );
          })}

          <div className="legend">
            <p className="legend-title">Vehicle Legend</p>
            <div className="legend-item"><span className="dot" style={{ background: '#22c55e' }} />Metro Line 6</div>
            <div className="legend-item"><span className="dot" style={{ background: '#f97316' }} />Bus</div>
            <div className="legend-item"><span className="dot" style={{ background: '#eab308' }} />Taxis</div>
          </div>

          {layers.pollution && (
            <div className="scale">
              <p className="scale-title">Pollution Scale</p>
              <div className="scale-bar pollution" />
              <div className="scale-labels"><span>Low</span><span>High</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
