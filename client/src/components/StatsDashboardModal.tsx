import React from 'react';
import { X, Activity, CheckCircle, Clock, ZapOff, ShieldMinus, HelpCircle, BarChart2 } from 'lucide-react';
import type { OutageStats } from '../types';

interface StatsDashboardProps {
  stats: OutageStats;
  onClose: () => void;
}

export const StatsDashboardModal: React.FC<StatsDashboardProps> = ({ stats, onClose }) => {
  const getReasonIcon = (reason: string) => {
    const size = 20;
    const color = "currentColor";
    const strokeWidth = 2;
    switch (reason.toLowerCase()) {
      case 'vehicle':
        return <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24'><path d='M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0-4 0m-6 0a2 2 0 1 0-4 0' fill='none' stroke={color} strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round'/></svg>;
      case 'maintenance':
        return <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' fill='none' stroke={color} strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round'/></svg>;
      case 'animal':
        return <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24'><path d='M11 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z M20 11a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z M7 16a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z M18 16a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z M11.52 18.21A4 4 0 0 1 9.49 20H15a4.01 4.01 0 0 1-2.12-1.78l-1.36-2z' fill={color}/></svg>;
      case 'tree':
        return <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24'><path d='m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z' fill='none' stroke={color} strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round'/><path d='M12 22v-3' stroke={color} strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round'/></svg>;
      default:
        return <HelpCircle size={size} color="var(--color-text-muted)" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal-card" style={{ maxWidth: 650, textAlign: 'left' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
             <BarChart2 size={24} color="var(--color-electric)" />
             <h2 className="modal-title" style={{ marginBottom: 0 }}>Comprehensive Stats</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        {/* Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <StatBox icon={<Activity size={20} color="var(--color-danger)" />} title="Active" value={stats.active_outages || 0} />
          <StatBox icon={<ShieldMinus size={20} color="var(--color-warning)" />} title="Last 24h" value={stats.recent_reports || 0} />
          <StatBox icon={<CheckCircle size={20} color="var(--color-success)" />} title="Resolved" value={stats.resolved_outages || 0} />
          <StatBox icon={<Clock size={20} color="var(--color-text-muted)" />} title="Expired" value={stats.expired_outages || 0} />
          <StatBox icon={<ZapOff size={20} color="var(--color-electric)" />} title="Total Ever" value={stats.total_reports || 0} />
        </div>

        {/* Breakdown by cause */}
        <div>
           <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-text-secondary)' }}>Causes Breakdown</h3>
           {Object.keys(stats.reasons_breakdown || {}).length === 0 ? (
             <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No cause data available.</p>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
               {Object.entries(stats.reasons_breakdown).map(([reason, count]) => (
                 <div key={reason} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <div style={{ width: '32px', height: '32px', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {getReasonIcon(reason)}
                      </div>
                      <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{reason}</span>
                   </div>
                   <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{count as number}</div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: number }) => (
  <div style={{ padding: 'var(--space-md) var(--space-sm)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
     <div style={{ marginBottom: '4px' }}>{icon}</div>
     <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{value}</div>
     <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{title}</div>
  </div>
);
