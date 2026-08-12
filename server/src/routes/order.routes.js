import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  trackOrder,
  getCheckoutSession,
  cancelOrderByUser,
  approveCancelRequest,
  rejectCancelRequest,
} from "../controllers/order.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────────
router.get("/track/:trackingNumber", trackOrder);

// ── Authenticated user routes ──────────────────────────────────────────────────
router.use(protect);

router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/checkout-session", getCheckoutSession);
router.patch("/:id/cancel", cancelOrderByUser);
router.get("/:id", getOrderById);

// ── Admin routes ───────────────────────────────────────────────────────────────
router.get("/", authorizeRoles("admin"), getAllOrders);
router.patch("/:id/status",         authorizeRoles("admin"), updateOrderStatus);
router.patch("/:id/cancel/approve", authorizeRoles("admin"), approveCancelRequest);
router.patch("/:id/cancel/reject",  authorizeRoles("admin"), rejectCancelRequest);

export default router;
