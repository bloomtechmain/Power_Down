import pool from '../db/pool.js';
import type { OutageReportWithUser, OutageCluster } from '../types/index.js';

// ========================================
// Haversine distance in meters
// ========================================
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CLUSTER_RADIUS_M = 500;

// ensureUser removed

// ========================================
// Create an outage report
// ========================================
export async function createOutageReport(
  userId: string,
  latitude: number,
  longitude: number,
  reason?: string,
  phoneNumber?: string
) {
  // Check for duplicate report from same user in last 5 minutes
  const duplicate = await pool.query(
    `SELECT id FROM outage_reports
     WHERE user_id = $1
       AND status = 'active'
       AND created_at > NOW() - INTERVAL '5 minutes'`,
    [userId]
  );

  if (duplicate.rowCount && duplicate.rowCount > 0) {
    return { success: false, error: 'You already reported recently. Wait a few minutes.' };
  }

  const result = await pool.query(
    `INSERT INTO outage_reports (user_id, latitude, longitude, reason, phone_number)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, latitude, longitude, reason || null, phoneNumber || null]
  );

  return { success: true, report: result.rows[0] };
}

// ========================================
// Get all active outage reports (auto-expire old ones)
// ========================================
export async function getActiveOutages(): Promise<OutageReportWithUser[]> {
  // Expire pending_expiration reports that have been waiting for > 30 minutes
  await pool.query(
    `UPDATE outage_reports SET status = 'expired', updated_at = NOW()
     WHERE status = 'pending_expiration' AND expires_at < NOW() - INTERVAL '30 minutes'`
  );

  // Set active reports to pending_expiration if they reached expiration
  await pool.query(
    `UPDATE outage_reports SET status = 'pending_expiration', updated_at = NOW()
     WHERE status = 'active' AND expires_at < NOW()`
  );

  const result = await pool.query(
    `SELECT r.*, u.display_name, u.email
     FROM outage_reports r
     JOIN users u ON r.user_id = u.id
     WHERE r.status IN ('active', 'pending_expiration')
     ORDER BY r.created_at DESC`
  );

  return result.rows;
}

// ========================================
// Get user's own outages
// ========================================
export async function getUserOutages(userId: string): Promise<OutageReportWithUser[]> {
  const result = await pool.query(
    `SELECT r.*, u.display_name, u.email
     FROM outage_reports r
     JOIN users u ON r.user_id = u.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return result.rows;
}

// ========================================
// Update outage status (keep or remove)
// ========================================
export async function updateOutageStatus(reportId: string, userId: string, action: 'keep' | 'remove') {
  if (action === 'keep') {
    const result = await pool.query(
      `UPDATE outage_reports
       SET status = 'active', updated_at = NOW(), expires_at = NOW() + INTERVAL '2 hours'
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [reportId, userId]
    );
    return { success: Boolean(result.rowCount && result.rowCount > 0) };
  } else if (action === 'remove') {
    const result = await pool.query(
      `UPDATE outage_reports
       SET status = 'expired', updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [reportId, userId]
    );
    return { success: Boolean(result.rowCount && result.rowCount > 0) };
  }
  return { success: false, error: 'Invalid action' };
}

// ========================================
// Get clustered outages
// ========================================
export async function getOutageClusters(): Promise<OutageCluster[]> {
  const reports = await getActiveOutages();
  const clusters: OutageCluster[] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < reports.length; i++) {
    if (assigned.has(i)) continue;

    const clusterReports = [reports[i]];
    assigned.add(i);

    for (let j = i + 1; j < reports.length; j++) {
      if (assigned.has(j)) continue;

      const dist = haversineDistance(
        reports[i].latitude,
        reports[i].longitude,
        reports[j].latitude,
        reports[j].longitude
      );

      if (dist <= CLUSTER_RADIUS_M) {
        clusterReports.push(reports[j]);
        assigned.add(j);
      }
    }

    const totalLat = clusterReports.reduce((sum, r) => sum + r.latitude, 0);
    const totalLng = clusterReports.reduce((sum, r) => sum + r.longitude, 0);
    const count = clusterReports.length;

    const reasons = Array.from(new Set(clusterReports.map(r => r.reason).filter(Boolean))) as string[];

    clusters.push({
      center_lat: totalLat / count,
      center_lng: totalLng / count,
      report_count: count,
      intensity: Math.min(count, 10),
      radius: Math.min(200 + count * 50, 800),
      latest_report: clusterReports[0].created_at,
      report_ids: clusterReports.map((r) => r.id),
      reasons,
    });
  }

  return clusters;
}

// ========================================
// Get stats
// ========================================
export async function getOutageStats() {
  const activeResult = await pool.query(
    `SELECT COUNT(*) as count FROM outage_reports WHERE status IN ('active', 'pending_expiration')`
  );

  const recentResult = await pool.query(
    `SELECT COUNT(*) as count FROM outage_reports
     WHERE created_at > NOW() - INTERVAL '24 hours'`
  );

  const totalResult = await pool.query(`SELECT COUNT(*) as count FROM outage_reports`);

  const reasonsResult = await pool.query(
    `SELECT reason, COUNT(*) as count FROM outage_reports GROUP BY reason ORDER BY count DESC`
  );

  const resolvedResult = await pool.query(
    `SELECT COUNT(*) as count FROM outage_reports WHERE status = 'resolved'`
  );

  const expiredResult = await pool.query(
    `SELECT COUNT(*) as count FROM outage_reports WHERE status = 'expired'`
  );

  return {
    active_outages: parseInt(activeResult.rows[0].count),
    recent_reports: parseInt(recentResult.rows[0].count),
    total_reports: parseInt(totalResult.rows[0].count),
    resolved_outages: parseInt(resolvedResult.rows[0].count),
    expired_outages: parseInt(expiredResult.rows[0].count),
    reasons_breakdown: reasonsResult.rows.map(r => ({
      reason: r.reason || 'unknown',
      count: parseInt(r.count)
    })).reduce((acc: any, cur) => {
      acc[cur.reason] = cur.count;
      return acc;
    }, {})
  };
}

// ========================================
// Get nearby outages count
// ========================================
export async function getNearbyCount(lat: number, lng: number, radiusM: number = 2000) {
  const reports = await getActiveOutages();
  return reports.filter(
    (r) => haversineDistance(lat, lng, r.latitude, r.longitude) <= radiusM
  ).length;
}
