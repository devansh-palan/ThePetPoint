import { Router } from 'express';
import multer from 'multer';
import * as upload from '../controllers/uploadController';
import { verifyToken } from '../middleware/verifyToken';

const storage = multer.memoryStorage();
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type — only jpeg, png, webp allowed'));
  }
};

const uploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const router = Router();

router.post('/', verifyToken, uploader.single('image'), upload.uploadImage);

export default router;
