import { Request, Response } from 'express';
import pool from '../db';

// GET /api/pets — get current user's pets
export const getMyPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM pets WHERE owner_id = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Pets] getMyPets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/pets
export const createPet = async (req: Request, res: Response): Promise<void> => {
  const { name, breed, age, notes, photo_url } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Pet name is required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO pets (owner_id, name, breed, age, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user!.id, name, breed ?? null, age ?? null, notes ?? null, photo_url ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[Pets] createPet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/pets/:id
export const updatePet = async (req: Request, res: Response): Promise<void> => {
  const { name, breed, age, notes, photo_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE pets SET
        name      = COALESCE($1, name),
        breed     = COALESCE($2, breed),
        age       = COALESCE($3, age),
        notes     = COALESCE($4, notes),
        photo_url = COALESCE($5, photo_url)
       WHERE id = $6 AND owner_id = $7
       RETURNING *`,
      [name ?? null, breed ?? null, age ?? null, notes ?? null, photo_url ?? null, req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found or not owned by you' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Pets] updatePet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/pets/:id
export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'DELETE FROM pets WHERE id = $1 AND owner_id = $2 RETURNING id',
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found or not owned by you' });
      return;
    }
    res.json({ message: 'Pet deleted', id: req.params.id });
  } catch (err) {
    console.error('[Pets] deletePet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
