import { Request, Response } from 'express';
import pool from '../db';
import { sendBookingEmail } from '../services/email';

// POST /api/bookings
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const { vendor_id, pet_id, requested_date, requested_time, message } = req.body;

  if (!vendor_id || !pet_id || !requested_date || !requested_time) {
    res.status(400).json({ error: 'vendor_id, pet_id, requested_date, requested_time are required' });
    return;
  }

  try {
    // Validate: vendor is approved
    const vendorRes = await pool.query('SELECT * FROM vendors WHERE id = $1 AND approved_status = true', [vendor_id]);
    if (vendorRes.rows.length === 0) {
      res.status(404).json({ error: 'Vendor not found or not approved' });
      return;
    }

    // Validate: pet belongs to user
    const petRes = await pool.query('SELECT * FROM pets WHERE id = $1 AND owner_id = $2', [pet_id, req.user!.id]);
    if (petRes.rows.length === 0) {
      res.status(403).json({ error: 'Pet not found or not owned by you' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO bookings (user_id, vendor_id, pet_id, requested_date, requested_time, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user!.id, vendor_id, pet_id, requested_date, requested_time, message ?? null]
    );

    const booking = result.rows[0];
    const vendor  = vendorRes.rows[0];
    const pet     = petRes.rows[0];

    // Fire-and-forget email to vendor
    sendBookingEmail({
      vendorEmail:     vendor.email,
      vendorOwnerName: vendor.owner_name,
      username:        req.user!.username,
      petName:         pet.name,
      petBreed:        pet.breed,
      petAge:          pet.age,
      petNotes:        pet.notes,
      requestedDate:   requested_date,
      requestedTime:   requested_time,
      message:         message ?? null,
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error('[Bookings] createBooking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/bookings/me
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT b.*, v.business_name, v.category, p.name AS pet_name, p.breed AS pet_breed
       FROM bookings b
       JOIN vendors v ON b.vendor_id = v.id
       JOIN pets    p ON b.pet_id    = p.id
       WHERE b.user_id = $1
       ORDER BY b.requested_date DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Bookings] getMyBookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/bookings/vendor
export const getVendorBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.user!.id]);
    if (vendorRes.rows.length === 0) {
      res.status(404).json({ error: 'No vendor linked to your account' });
      return;
    }
    const vendor_id = vendorRes.rows[0].id;

    const result = await pool.query(
      `SELECT b.*, u.username, u.email as user_email, p.name AS pet_name, p.breed, p.age, p.notes
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN pets  p ON b.pet_id  = p.id
       WHERE b.vendor_id = $1
       ORDER BY b.requested_date ASC`,
      [vendor_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Bookings] getVendorBookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/bookings/:id/status
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'status must be "confirmed" or "cancelled"' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Bookings] updateStatus error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
