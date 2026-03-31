export interface User {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OutageReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  reason?: string;
  status: 'active' | 'resolved' | 'expired' | 'pending_expiration';
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

export interface OutageReportWithUser extends OutageReport {
  display_name: string | null;
  email: string;
}

export interface OutageCluster {
  center_lat: number;
  center_lng: number;
  report_count: number;
  intensity: number;
  radius: number;
  latest_report: Date;
  report_ids: string[];
  reasons?: string[];
}

export interface CreateOutageDTO {
  latitude: number;
  longitude: number;
  reason?: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    displayName?: string;
  };
}
