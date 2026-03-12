import { Request, Response } from 'express';
import pool from '../db';

// GET /api/posts?limit=&offset=
export const getFeed = async (req: Request, res: Response): Promise<void> => {
  const { limit = '20', offset = '0' } = req.query as Record<string, string>;
  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.username
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.deleted = false
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Posts] getFeed error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/posts
export const createPost = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: 'Post content is required' });
    return;
  }
  if (content.length > 1000) {
    res.status(400).json({ error: 'Post content must be 1000 characters or less' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO community_posts (user_id, content)
       VALUES ($1, $2)
       RETURNING id, content, created_at`,
      [req.user!.id, content.trim()]
    );
    res.status(201).json({ ...result.rows[0], username: req.user!.username });
  } catch (err) {
    console.error('[Posts] createPost error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/posts/:id (soft delete — admin only)
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'UPDATE community_posts SET deleted = true WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json({ message: 'Post removed', id: req.params.id });
  } catch (err) {
    console.error('[Posts] deletePost error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
