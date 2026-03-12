import { Request, Response } from 'express';
import pool from '../db';

// GET /api/events
export const listEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.username AS creator_username
       FROM events e
       JOIN users u ON e.created_by = u.id
       WHERE e.date_time > NOW() AND (e.approved_status = true OR u.role = 'admin' OR $1 = 'admin')
       ORDER BY e.date_time ASC`,
      [req.user?.role || 'user']
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Events] listEvents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/events/:id
export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.username AS creator_username
       FROM events e
       JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Events] getEvent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/events (admin only)
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { title, location, date_time, description } = req.body;

  if (!title || !location || !date_time) {
    res.status(400).json({ error: 'title, location, date_time are required' });
    return;
  }

  try {
    const isApproved = req.user!.role === 'admin';
    const result = await pool.query(
      `INSERT INTO events (title, location, date_time, description, created_by, approved_status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, location, date_time, description ?? null, req.user!.id, isApproved]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[Events] createEvent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/events/:id/rsvp — idempotent
export const rsvpEvent = async (req: Request, res: Response): Promise<void> => {
  const { id: event_id } = req.params;
  const user_id = req.user!.id;

  try {
    // Check event exists
    const eventRes = await pool.query('SELECT id, rsvp_count FROM events WHERE id = $1', [event_id]);
    if (eventRes.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Check if already RSVP'd
    const existing = await pool.query(
      'SELECT id FROM event_rsvps WHERE event_id = $1 AND user_id = $2',
      [event_id, user_id]
    );

    if (existing.rows.length > 0) {
      // Idempotent — return success without duplicating
      res.json({ message: "Already RSVP'd", rsvp_count: eventRes.rows[0].rsvp_count });
      return;
    }

    // Insert RSVP + increment count (atomic)
    await pool.query('INSERT INTO event_rsvps (event_id, user_id) VALUES ($1, $2)', [event_id, user_id]);
    const updated = await pool.query(
      'UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = $1 RETURNING rsvp_count',
      [event_id]
    );

    res.json({ message: 'RSVP successful', rsvp_count: updated.rows[0].rsvp_count });
  } catch (err) {
    console.error('[Events] rsvpEvent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
