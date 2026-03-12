import { Request, Response } from 'express';
import pool from '../db';

// GET /api/users/:username
export const getByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, username, name, location, role, created_at FROM users WHERE username = $1',
      [req.params.username]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Users] getByUsername error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/users/me
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, location } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
        name     = COALESCE($1, name),
        phone    = COALESCE($2, phone),
        location = COALESCE($3, location)
       WHERE id = $4
       RETURNING id, username, name, email, phone, location, role`,
      [name ?? null, phone ?? null, location ?? null, req.user!.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Users] updateMe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
