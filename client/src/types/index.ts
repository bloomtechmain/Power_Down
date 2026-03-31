export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface OutageReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  reason?: string;
  status: 'active' | 'resolved' | 'expired' | 'pending_expiration';
  created_at: string;
  updated_at: string;
  expires_at: string;
  display_name: string | null;
  email: string;
}

export interface OutageCluster {
  center_lat: number;
  center_lng: number;
  report_count: number;
  intensity: number;
  radius: number;
  latest_report: string;
  report_ids: string[];
  reasons?: string[];
}

export interface OutageStats {
  active_outages: number;
  recent_reports: number;
  total_reports: number;
  resolved_outages: number;
  expired_outages: number;
  reasons_breakdown: Record<string, number>;
}

export interface Position {
  lat: number;
  lng: number;
  accuracy?: number;
}
