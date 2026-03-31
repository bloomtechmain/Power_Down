import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { signInWithEmail, registerWithEmail } from '../services/auth';

interface AuthScreenProps {
  onToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onToast, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    
    setLoading(true);
    const result = mode === 'login'
      ? await signInWithEmail(email, password)
      : await registerWithEmail(email, password);

    if (!result.success) {
      setError(result.error || 'Authentication failed');
      setLoading(false);
    } else {
      window.dispatchEvent(new Event('powerdown_auth_changed'));
      if (onClose) onClose();
    }
  };

  return (
    <div className="auth-screen" id="auth-screen" onClick={onClose ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}>
      <div className="auth-card">
        {onClose && (
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '20px', lineHeight: 1 }}>✕</button>
        )}
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Zap className="auth-logo-icon" size={48} color="var(--color-electric)" />
          <h1 className="auth-logo-title">PowerDown</h1>
          <p className="auth-logo-subtitle">Real-time power outage reporting</p>
        </div>

        {error && (
          <div className="auth-error visible">{error}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="auth-email">Email</label>
            <input
              type="email"
              id="auth-email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          <button
            type="submit"
            className="auth-submit-btn"
            id="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? mode === 'login' ? 'Signing in...' : 'Creating account...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <span
            className="auth-toggle-link"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? ' Create one' : ' Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
};
