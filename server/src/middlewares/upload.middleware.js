import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory (server/uploads)
const BASE_UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

/**
 * Creates a multer storage engine that saves into uploads/<folder>/
 * If a file with the same name exists, it is overwritten.
 *
 * @param {string} folder  - sub-folder name, e.g. "category", "brand", "product", "avatar"
 */
const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(BASE_UPLOAD_DIR, folder);
      // Create folder hierarchy if missing
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      // Keep a deterministic name so re-uploads overwrite the old file:
      // <timestamp>-<originalname-sanitized>
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");
      const unique = `${Date.now()}-${baseName}${ext}`;
      cb(null, unique);
    },
  });

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only image files (jpeg, jpg, png, gif, webp, svg) are allowed"));
};

// ── Pre-built uploader instances ──────────────────────────────────────────────
export const uploadCategory = multer({
  storage: createStorage("category"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export const uploadBrand = multer({
  storage: createStorage("brand"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProduct = multer({
  storage: createStorage("product"),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

export const uploadAvatar = multer({
  storage: createStorage("avatar"),
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

// ── Helper: delete a file from disk ──────────────────────────────────────────
/**
 * Deletes a stored image given its public URL path
 * e.g.  /uploads/category/xyz.jpg  →  server/uploads/category/xyz.jpg
 */
export const deleteFile = (publicPath) => {
  if (!publicPath) return;
  // publicPath looks like:  /uploads/category/file.jpg
  const absolute = path.join(BASE_UPLOAD_DIR, "..", publicPath);
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }
};

/**
 * Build the public URL stored in the DB from a multer file object.
 * e.g.  /uploads/category/1234-name.jpg
 */
export const buildPublicPath = (file) => {
  if (!file) return null;
  // file.destination is the absolute dir, file.filename is just the name
  const relativeParts = file.destination
    .split(path.sep)
    .slice(-2); // ["uploads","category"]  (last 2 segments)
  return `/${relativeParts.join("/")}/${file.filename}`;
};
