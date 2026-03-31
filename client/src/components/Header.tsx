import React from 'react';
import { signOut } from '../services/auth';
import type { User } from '../types';

const PowerDownLogo: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 2px 6px rgba(250,204,21,0.5))' }}>
    {/* Rounded triangle */}
    <path d="M19.6 7.4 Q22 3 24.4 7.4 L39.6 34.6 Q42 39 37 39 L7 39 Q2 39 4.4 34.6 Z" fill="#FACC15" />
    {/* Zap bolt centered inside triangle */}
    <path
      d="M25.3 14.6 L18.1 25 L24 25 L18.8 35.4 L29.8 22.4 L23.9 22.4 Z"
      fill="#1a1a1a"
      stroke="#1a1a1a"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  </svg>
);

interface HeaderProps {
  user: User | null;
  onToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onOpenMyReports: () => void;
  onSignIn: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onToast, onOpenMyReports, onSignIn }) => {
  const handleSignOut = async () => {
    try {
      await signOut();
      window.dispatchEvent(new Event('powerdown_auth_changed'));
      onToast('Signed out successfully', 'info');
    } catch {
      onToast('Failed to sign out', 'error');
    }
  };

  const displayName = user ? (user.displayName || user.email?.split('@')[0] || 'User') : null;
  const initials = displayName ? displayName.charAt(0).toUpperCase() : null;

  return (
    <header className="app-header" id="app-header">
      <div className="header-brand">
        <PowerDownLogo />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-brand-name">PowerDown</span>
            <div className="header-status">
              <span className="header-status-dot" />
              <span>Live</span>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
            Powered by <a href="https://www.bloomswiftpos.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-electric)', textDecoration: 'none' }}>Bloomtech.lk</a>
          </span>
        </div>
      </div>
      <div className="header-user">
        {user ? (
          <>
            <div className="header-user-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt={displayName!} />
              ) : (
                initials
              )}
            </div>
            <button
              className="header-signout-btn"
              onClick={onOpenMyReports}
              style={{ marginRight: '8px' }}
            >
              My Reports
            </button>
            <button
              className="header-signout-btn"
              id="signout-btn"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button className="header-signout-btn" onClick={onSignIn}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
