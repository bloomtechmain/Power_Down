import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import type { OutageStats } from '../types';

interface OverviewPanelProps {
  stats: OutageStats;
  onClose: () => void;
  onReportOutage: () => void;
  onMyReports: () => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ 
  stats, onClose, onReportOutage, onMyReports 
}) => {
  const [powerExpanded, setPowerExpanded] = useState(true);

  // Mocking variables to simulate real utility constraints aesthetically
  const TOTAL_SERVED = 543120;
  // Let's assume an average radius affects 42 customers per active incident
  const affectedCustomers = (stats.active_outages || 0) * 42;
  const withPowerPct = Math.max(0, ((TOTAL_SERVED - affectedCustomers) / TOTAL_SERVED) * 100).toFixed(2);
  const hazardsCount = Object.keys(stats.reasons_breakdown || {}).length;

  return (
    <div className="overview-panel">
      <div className="overview-header">
        <div className="overview-tabs">
          <button className="overview-tab active">Overview</button>
          <button className="overview-tab">Help</button>
        </div>
        <button className="overview-close" onClick={onClose} aria-label="Close Overview">
          <X size={20} />
        </button>
      </div>

      <div className="overview-content">
        <div className="overview-card" onClick={() => setPowerExpanded(!powerExpanded)}>
          <div className="overview-card-header">
            <span className="overview-card-title">Total Customers with Power:</span>
            {powerExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          <div className="overview-card-value">{withPowerPct}%</div>
          
          {powerExpanded && (
            <div className="overview-substats">
              <div className="overview-substat">
                <span className="overview-substat-label">Active Outages</span>
                <span className="overview-substat-value">{stats.active_outages || 0}</span>
              </div>
              <div className="overview-substat">
                <span className="overview-substat-label">Total Affected Customers</span>
                <span className="overview-substat-value">{affectedCustomers}</span>
              </div>
            </div>
          )}
        </div>

        <div className="overview-card">
          <div className="overview-card-title" style={{ marginBottom: '12px' }}>Hazards Summary</div>
          <div className="overview-substat">
             <span className="overview-substat-label">Number of Hazards</span>
             <span className="overview-substat-value">{hazardsCount}</span>
          </div>
        </div>

        <div className="overview-meta">
          <div style={{ marginBottom: '4px' }}>Last Updated: {new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute:'2-digit' })}</div>
          <div>Information updated every 10 minutes.</div>
        </div>

        <div className="overview-buttons">
          <button className="overview-btn" style={{ opacity: 0.9 }}>
            Map Feedback
            <ChevronRight size={20} />
          </button>
          <button className="overview-btn" onClick={onReportOutage}>
            Report Outage
            <ChevronRight size={20} />
          </button>
          <button className="overview-btn" onClick={onMyReports} style={{ opacity: 0.9 }}>
            Check Status
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
