import { getToken } from './auth';
import type { OutageReport, OutageCluster, OutageStats } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchOutages(): Promise<OutageReport[]> {
  const res = await fetch(`${API_BASE}/api/outages`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.outages;
}

export async function fetchClusters(): Promise<OutageCluster[]> {
  const res = await fetch(`${API_BASE}/api/outages/clusters`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.clusters;
}

export async function fetchStats(): Promise<OutageStats> {
  const res = await fetch(`${API_BASE}/api/outages/stats`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.stats;
}

export async function fetchNearbyCount(lat: number, lng: number): Promise<number> {
  const res = await fetch(`${API_BASE}/api/outages/nearby?lat=${lat}&lng=${lng}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.count;
}

export async function reportOutage(latitude: number, longitude: number, reason?: string | null, phone_number?: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/outages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ latitude, longitude, reason, phone_number }),
  });
  const data = await res.json();
  return data;
}

export async function fetchMyOutages(): Promise<OutageReport[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/outages/mine`, { headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.outages;
}

export async function updateOutageStatus(id: string, action: 'keep' | 'remove') {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/outages/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ action }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}
