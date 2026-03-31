import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlocaljwtkey';
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.id || !decoded.email) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
      displayName: decoded.displayName,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed or token expired' });
  }
}
