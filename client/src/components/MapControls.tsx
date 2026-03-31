import React from 'react';
import { Crosshair, Flame, Plus, Minus, Menu } from 'lucide-react';
import type { Position } from '../types';

interface MapControlsProps {
  heatmapVisible: boolean;
  onToggleHeatmap: () => void;
  onRecenter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenStats: () => void;
  onOpenOverview: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  heatmapVisible,
  onToggleHeatmap,
  onRecenter,
  onZoomIn,
  onZoomOut,
  onOpenStats,
  onOpenOverview,
}) => {
  return (
    <div className="map-controls">
      <button className="map-control-btn" onClick={onOpenOverview} title="Open Overview" aria-label="Open Overview">
        <Menu size={20} />
      </button>
      <button className="map-control-btn" onClick={onOpenStats} title="View Statistics" aria-label="View Statistics">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
      </button>
      <button className="map-control-btn" onClick={onRecenter} title="Re-center" aria-label="Re-center map">
        <Crosshair size={20} />
      </button>
      <button
        className={`map-control-btn ${heatmapVisible ? 'active' : ''}`}
        onClick={onToggleHeatmap}
        title="Toggle heatmap"
        aria-label="Toggle heatmap"
      >
        <Flame size={20} />
      </button>
      <button className="map-control-btn" onClick={onZoomIn} title="Zoom in" aria-label="Zoom in">
        <Plus size={20} />
      </button>
      <button className="map-control-btn" onClick={onZoomOut} title="Zoom out" aria-label="Zoom out">
        <Minus size={20} />
      </button>
    </div>
  );
};
