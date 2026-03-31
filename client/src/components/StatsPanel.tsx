import React from 'react';
import { Activity, MapPin, RefreshCw } from 'lucide-react';
import type { OutageStats } from '../types';

interface StatsPanelProps {
  stats: OutageStats;
  nearbyCount: number;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, nearbyCount }) => {
  return (
    <div className="stats-panel" id="stats-panel">
      <div className="stats-panel-inner">
        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={18} color="var(--color-danger)" />
            <span className="stat-value danger">{stats.active_outages}</span>
          </div>
          <span className="stat-label">Outages</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={18} color="var(--color-warning)" />
            <span className="stat-value warning">{nearbyCount}</span>
          </div>
          <span className="stat-label">Nearby</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={18} color="var(--color-success)" />
            <span className="stat-value success">now</span>
          </div>
          <span className="stat-label">Updated</span>
        </div>
      </div>
    </div>
  );
};
