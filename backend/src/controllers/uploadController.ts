import { Request, Response } from 'express';
import { uploadImage as uploadToCloud } from '../services/storage';

// POST /api/upload — multipart/form-data with 'image' field
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided (field name: "image")' });
    return;
  }

  try {
    const folder = `thepetpoint/${req.user!.id}`;
    const url = await uploadToCloud(req.file.buffer, folder);
    res.json({ url });
  } catch (err) {
    console.error('[Upload] uploadImage error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
};
