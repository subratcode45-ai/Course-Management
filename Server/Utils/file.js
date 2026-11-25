import fs from 'fs/promises';
import path from 'path';

const ROOT = path.resolve('uploads', 'thumbnails');

// only touches files we uploaded; external URLs (Unsplash) are ignored
export const removeThumbnail = async (url) => {
  if (!url?.startsWith('/uploads/thumbnails/')) return;
  try {
    await fs.unlink(path.join(ROOT, path.basename(url))); // basename blocks ../ tricks
  } catch {
    /* file already gone */
  }
};