import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createOutageReport,
  getActiveOutages,
  getOutageClusters,
  getOutageStats,
  getNearbyCount,
  getUserOutages,
  updateOutageStatus,
} from '../controllers/outageController.js';

const router = Router();

// ========================================
// GET /api/outages — Get all active outage reports
// ========================================
router.get('/', async (_req: Request, res: Response) => {
  try {
    const outages = await getActiveOutages();
    res.json({ success: true, outages });
  } catch (error) {
    console.error('Error fetching outages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch outages' });
  }
});

// ========================================
// GET /api/outages/clusters — Get clustered outages  
// ========================================
router.get('/clusters', async (_req: Request, res: Response) => {
  try {
    const clusters = await getOutageClusters();
    res.json({ success: true, clusters });
  } catch (error) {
    console.error('Error fetching clusters:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clusters' });
  }
});

// ========================================
// GET /api/outages/stats — Get outage statistics
// ========================================
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getOutageStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ========================================
// GET /api/outages/nearby — Get nearby outage count
// ========================================
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 2000;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, error: 'Latitude and longitude required' });
      return;
    }

    const count = await getNearbyCount(lat, lng, radius);
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching nearby:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch nearby count' });
  }
});

// ========================================
// GET /api/outages/mine — Get current user's outages
// ========================================
router.get('/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const outages = await getUserOutages(user.id);
    res.json({ success: true, outages });
  } catch (error) {
    console.error('Error fetching user outages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user outages' });
  }
});

// ========================================
// PUT /api/outages/:id/status — Update outage status (keep or remove)
// ========================================
router.put('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { action } = req.body;
    const id = req.params.id as string;
    
    if (action !== 'keep' && action !== 'remove') {
      res.status(400).json({ success: false, error: 'Invalid action' });
      return;
    }

    const result = await updateOutageStatus(id, user.id, action);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, error: 'Failed to update outage status' });
  }
});

// ========================================
// POST /api/outages — Create a new outage report (auth required)
// ========================================
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { latitude, longitude, reason, phone_number } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ success: false, error: 'Valid latitude and longitude required' });
      return;
    }

    // Create the report directly using local JWT user id
    const result = await createOutageReport(user.id, latitude, longitude, reason, phone_number);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(429).json(result);
    }
  } catch (error) {
    console.error('Error creating outage:', error);
    res.status(500).json({ success: false, error: 'Failed to create outage report' });
  }
});

export default router;
