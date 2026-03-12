import { Request, Response } from 'express';
import pool from '../db';
import { sendVendorRegistrationEmail } from '../services/email';

// GET /api/admin/vendors/pending
export const getPendingVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.email as user_email 
       FROM vendors v
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.approved_status = false
       ORDER BY v.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Admin] getPendingVendors error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/vendors/:id/approve
export const approveVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `UPDATE vendors SET approved_status = true WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }

    const vendor = result.rows[0];

    // TODO: Send an approval email to the vendor

    res.json(vendor);
  } catch (err) {
    console.error('[Admin] approveVendor error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/events
export const getUnapprovedEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.username as creator_username
       FROM events e
       JOIN users u ON e.created_by = u.id
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Admin] getUnapprovedEvents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/events/:id/approve
export const approveEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `UPDATE events SET approved_status = true WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Admin] approveEvent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/bookings
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.username as user_username, v.business_name, p.name as pet_name 
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN vendors v ON b.vendor_id = v.id
       JOIN pets p ON b.pet_id = p.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Admin] getAllBookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
