import { useState, useEffect, useCallback, useRef } from 'react';
import { verifyToken } from '../services/auth';
import { fetchOutages, fetchClusters, fetchStats, fetchNearbyCount } from '../services/api';
import type { User, OutageReport, OutageCluster, OutageStats, Position } from '../types';

// ========================================
// useAuth — Firebase auth state
// ========================================
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // A helper to let components manually trigger auth status updates
  const reloadAuth = useCallback(async () => {
    setLoading(true);
    const authStatus = await verifyToken();
    if (authStatus.success && authStatus.user) {
      setUser(authStatus.user);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reloadAuth();
    
    // Add global listener to refresh user state when login happens
    window.addEventListener('powerdown_auth_changed', reloadAuth);
    return () => {
      window.removeEventListener('powerdown_auth_changed', reloadAuth);
    };
  }, [reloadAuth]);

  return { user, loading };
}

// ========================================
// useLocation — Geolocation API
// ========================================
export function useLocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setPosition({ lat: 30.35, lng: -97.68 });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setPosition({ lat: 30.35, lng: -97.68 });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { position, error, loading, requestLocation };
}

// ========================================
// useOutages — Polling for outage data
// ========================================
export function useOutages(pollInterval = 5000) {
  const [outages, setOutages] = useState<OutageReport[]>([]);
  const [clusters, setClusters] = useState<OutageCluster[]>([]);
  const [stats, setStats] = useState<OutageStats>({ active_outages: 0, recent_reports: 0, total_reports: 0, resolved_outages: 0, expired_outages: 0, reasons_breakdown: {} });
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [outageData, clusterData, statsData] = await Promise.all([
        fetchOutages(),
        fetchClusters(),
        fetchStats(),
      ]);
      setOutages(outageData);
      setClusters(clusterData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch outages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, pollInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, pollInterval]);

  return { outages, clusters, stats, loading, refresh };
}

// ========================================
// useNearby — Nearby outage count
// ========================================
export function useNearby(position: Position | null) {
  const [nearbyCount, setNearbyCount] = useState(0);

  useEffect(() => {
    if (!position) return;
    
    const fetch = async () => {
      try {
        const count = await fetchNearbyCount(position.lat, position.lng);
        setNearbyCount(count);
      } catch {
        // silent
      }
    };

    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [position]);

  return nearbyCount;
}

// ========================================
// useToast — Toast notification state
// ========================================
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}
