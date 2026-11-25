import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto"

const UPLOAD_DIR = path.resolve("uploads", "thumbnails");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${EXT[file.mimetype]}`,
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype]
      ? cb(null, true)
      : cb(new Error("Only JPG, PNG or WebP images are allowed")),
}).single("thumbnail");

export const handleThumbnailUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be smaller than 5 MB"
          : err.message;
      return res.status(400).json({ message });
    }
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    next();
  });
};

export default upload;
