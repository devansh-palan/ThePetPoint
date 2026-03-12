import { Request, Response } from 'express';
import pool from '../db';
import { sendVendorRegistrationEmail } from '../services/email';

// GET /api/vendors?category=&location=&search=&limit=&offset=
export const listVendors = async (req: Request, res: Response): Promise<void> => {
  const { category, location, search, limit = '20', offset = '0' } = req.query as Record<string, string>;
  try {
    const result = await pool.query(
      `SELECT id, business_name, owner_name, category, description, services,
              address, lat, lng, price_range, photo_urls, created_at
       FROM vendors
       WHERE approved_status = true
         AND ($1::text IS NULL OR category = $1)
         AND ($2::text IS NULL OR address ILIKE '%' || $2 || '%')
         AND ($3::text IS NULL OR (business_name ILIKE '%' || $3 || '%' OR description ILIKE '%' || $3 || '%'))
       ORDER BY created_at DESC
       LIMIT $4 OFFSET $5`,
      [category || null, location || null, search || null, parseInt(limit), parseInt(offset)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Vendors] listVendors error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/vendors/:id
export const getVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.username
       FROM vendors v
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.id = $1 AND v.approved_status = true`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Vendors] getVendor error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/vendors/register
export const registerVendor = async (req: Request, res: Response): Promise<void> => {
  const {
    business_name, owner_name, category, description,
    services, address, contact_phone, email, price_range,
  } = req.body;

  if (!business_name || !owner_name || !category || !email) {
    res.status(400).json({ error: 'business_name, owner_name, category, email are required' });
    return;
  }

  const validCategories = ['grooming','training','boarding','veterinary','daycare','walking','other'];
  if (!validCategories.includes(category)) {
    res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO vendors (business_name, owner_name, category, description, services, address, contact_phone, email, price_range)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [business_name, owner_name, category, description ?? null,
       services ?? [], address ?? null, contact_phone ?? null, email, price_range ?? null]
    );

    const vendorId = result.rows[0].id;

    // Fire-and-forget admin email
    sendVendorRegistrationEmail({
      businessName: business_name,
      ownerName: owner_name,
      category,
      email,
      phone: contact_phone,
      address,
      description,
      services: services ?? [],
      priceRange: price_range,
      vendorId,
    });

    res.status(201).json({ message: 'Registration submitted. Pending admin review.', id: vendorId });
  } catch (err) {
    console.error('[Vendors] registerVendor error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/vendors/:id
export const updateVendor = async (req: Request, res: Response): Promise<void> => {
  const { description, services, address, contact_phone, price_range, photo_urls } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vendors SET
        description   = COALESCE($1, description),
        services      = COALESCE($2, services),
        address       = COALESCE($3, address),
        contact_phone = COALESCE($4, contact_phone),
        price_range   = COALESCE($5, price_range),
        photo_urls    = COALESCE($6, photo_urls)
       WHERE id = $7
       RETURNING id, business_name, category, description, services, address, price_range, photo_urls`,
      [description ?? null, services ?? null, address ?? null,
       contact_phone ?? null, price_range ?? null, photo_urls ?? null, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Vendor not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Vendors] updateVendor error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
