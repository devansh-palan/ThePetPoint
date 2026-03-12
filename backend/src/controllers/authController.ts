import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, name, email, phone, password, location } = req.body;

  if (!username || !name || !email || !password) {
    res.status(400).json({ error: 'username, name, email, password are required' });
    return;
  }

  try {
    // Check uniqueness
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rows.length > 0) {
      const taken = existing.rows[0];
      const field = taken.email === email ? 'Email' : 'Username';
      res.status(409).json({ error: `${field} already registered` });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (username, name, email, phone, password_hash, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, name, role`,
      [username, name, email, phone ?? null, password_hash, location ?? null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ id: user.id, username: user.username, name: user.name, role: user.role });
  } catch (err) {
    console.error('[Auth] signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password || !expectedRole) {
    res.status(400).json({ error: 'email, password, and expectedRole are required' });
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Prevent inter-domain logins
    if (user.role !== expectedRole) {
      res.status(403).json({ error: `Account exists but is registered as a ${user.role}, not a ${expectedRole}.` });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, COOKIE_OPTS);
    res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
  } catch (err) {
    console.error('[Auth] login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/logout
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/me
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, username, name, email, phone, location, role, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Auth] me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
