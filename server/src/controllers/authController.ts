import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlocaljwtkey';
const JWT_EXPIRES_IN = '7d';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      res.status(400).json({ success: false, error: 'Valid email and password (min 6 chars) required' });
      return;
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(400).json({ success: false, error: 'Email already in use' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, display_name`,
      [email, hash]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, displayName: user.display_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' });
      return;
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rowCount === 0) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, displayName: user.display_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

export async function verifyMe(req: Request, res: Response): Promise<void> {
  // If they pass auth middleware, we just return success
  try {
    const user = (req as any).user;
    
    const result = await pool.query('SELECT id, email, display_name, photo_url FROM users WHERE id = $1', [user.id]);
    
    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const dbUser = result.rows[0];

    res.status(200).json({
      success: true,
      user: {
        uid: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.display_name,
        photoURL: dbUser.photo_url
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
}
