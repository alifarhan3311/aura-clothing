import { Router } from "express";
import {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
} from "../controllers/brand.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadBrand } from "../middlewares/upload.middleware.js";

const router = Router();

// ── Public / User routes ──────────────────────────────────────────────────────
// optionally attach user context for role-based filtering (not required)
router.get("/", getAllBrands);
router.get("/:id", getBrand);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  uploadBrand.single("logo"),
  createBrand
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  uploadBrand.single("logo"),
  updateBrand
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateBrandStatus
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteBrand);

export default router;
