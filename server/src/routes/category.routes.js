import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategory,
  getProductsByCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadCategory } from "../middlewares/upload.middleware.js";

const router = Router();

// ── Public / User routes ──────────────────────────────────────────────────────
router.get("/", getAllCategories);
router.get("/:id/products", getProductsByCategory);   // products under a category
router.get("/:id", getCategory);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  uploadCategory.single("image"),
  createCategory
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  uploadCategory.single("image"),
  updateCategory
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateCategoryStatus
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

export default router;
