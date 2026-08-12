import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// ── User route (validate coupon at checkout) ──────────────────────────────────
router.post("/validate", protect, validateCoupon);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.get("/", protect, authorizeRoles("admin"), getAllCoupons);
router.get("/:id", protect, authorizeRoles("admin"), getCoupon);
router.post("/", protect, authorizeRoles("admin"), createCoupon);
router.put("/:id", protect, authorizeRoles("admin"), updateCoupon);
router.patch("/:id/status", protect, authorizeRoles("admin"), updateCouponStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCoupon);

export default router;
