import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchMyOutages, updateOutageStatus } from '../services/api';
import type { OutageReport } from '../types';

interface MyReportsModalProps {
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onUpdate: () => void;
}

export const MyReportsModal: React.FC<MyReportsModalProps> = ({ onClose, onToast, onUpdate }) => {
  const [reports, setReports] = useState<OutageReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchMyOutages();
      setReports(data);
    } catch (err) {
      onToast('Failed to load your reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleAction = async (id: string, action: 'keep' | 'remove') => {
    try {
      await updateOutageStatus(id, action);
      onToast(`Report ${action === 'keep' ? 'kept active' : 'removed'} successfully`, 'success');
      loadReports();
      onUpdate();
    } catch (err) {
      onToast(`Failed to ${action} report`, 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 className="modal-title" style={{ marginBottom: 0 }}>My Reports</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left' }}>
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-md)' }}>Loading...</p>
          ) : reports.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-md)' }}>You haven't submitted any reports.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {reports.map(report => (
                <div key={report.id} style={{ padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                    <span style={{ fontWeight: 600 }}>{report.reason ? report.reason.charAt(0).toUpperCase() + report.reason.slice(1) : 'General Outage'}</span>
                    <span style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      background: report.status === 'active' ? 'var(--color-success-soft)' : report.status === 'expired' ? 'var(--color-bg-elevated)' : 'var(--color-warning-soft)',
                      color: report.status === 'active' ? 'var(--color-success)' : report.status === 'expired' ? 'var(--color-text-muted)' : 'var(--color-warning)'
                    }}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                    Reported: {new Date(report.created_at).toLocaleString()}
                  </div>
                  
                  {report.status !== 'expired' && (
                     <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                       {report.status === 'pending_expiration' && (
                         <button 
                           onClick={() => handleAction(report.id, 'keep')}
                           style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-success)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}
                         >
                           Keep Active
                         </button>
                       )}
                       <button 
                         onClick={() => handleAction(report.id, 'remove')}
                         style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}
                       >
                         Remove
                       </button>
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
