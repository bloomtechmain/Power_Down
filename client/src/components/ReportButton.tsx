import React, { useState } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { getIconSvg, REASON_LABELS } from './icons';

interface ReportButtonProps {
  onClick: () => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ onClick }) => {
  return (
    <div className="report-fab" id="report-fab" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.4px', color: '#fff', borderRadius: '999px', padding: '4px 14px', background: 'var(--color-danger)' }}>Add Report</span>
      <button
        className="report-fab-btn"
        id="report-fab-btn"
        onClick={onClick}
        aria-label="Report power outage"
      >
        <AlertTriangle className="icon" size={28} />
      </button>
    </div>
  );
};

interface ConfirmModalProps {
  visible: boolean;
  onConfirm: (reason: string | null, phoneNumber: string) => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ visible, onConfirm, onCancel }) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!visible) return null;

  const handleCancel = () => {
    setSelectedReason(null);
    setPhoneNumber('');
    onCancel();
  };

  const handleConfirm = () => {
    if (!phoneNumber) {
      alert('Please enter your mobile number.');
      return;
    }
    onConfirm(selectedReason, phoneNumber);
    setSelectedReason(null);
    setPhoneNumber('');
  };

  return (
    <div className="modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <AlertCircle size={48} color="var(--color-danger)" />
        </div>
        <h2 className="modal-title">Report Power Outage?</h2>
        <p className="modal-desc" style={{ marginBottom: '12px' }}>
          Select an optional reason for the outage using the symbols below:
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '0 0 24px' }}>
          {(['vehicle', 'maintenance', 'animal', 'tree'] as const).map((key) => {
            const selected = selectedReason === key;
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={() => setSelectedReason(r => r === key ? null : key)}>
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: `2.5px solid ${selected ? 'var(--color-accent)' : 'transparent'}`,
                    background: selected ? 'var(--color-accent)' : '#1a1a1a',
                    transition: 'all 0.2s',
                    boxShadow: selected ? '0 0 10px rgba(0,122,165,0.4)' : 'none',
                  }}
                  dangerouslySetInnerHTML={{ __html: getIconSvg(key, 28) }}
                />
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: selected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: '56px',
                }}>
                  {REASON_LABELS[key]}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Mobile Number (Required)
          </label>
          <input 
            type="tel"
            placeholder="e.g. +1 234 567 8900"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
            required
          />
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={handleCancel}>Cancel</button>
          <button className="modal-btn modal-btn-confirm" onClick={handleConfirm}>Yes, Report</button>
        </div>
      </div>
    </div>
  );
};
