import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadProduct } from "../middlewares/upload.middleware.js";

const router = Router();

// ── Public / User routes ──────────────────────────────────────────────────────
router.get("/", getAllProducts);
router.get("/:id", getProduct);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  uploadProduct.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "productImages", maxCount: 10 },
  ]),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  uploadProduct.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "productImages", maxCount: 10 },
  ]),
  updateProduct
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateProductStatus
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

export default router;
