import { Router } from 'express';
import { protect, adminOnly } from '../Middlewares/auth.js';
import { handleThumbnailUpload } from '../Middlewares/upload.js';

const router = Router();

router.post('/thumbnail', protect, adminOnly, handleThumbnailUpload, (req, res) => {
  res.status(201).json({ url: `/uploads/thumbnails/${req.file.filename}` });
});

export default router;