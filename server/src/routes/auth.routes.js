import { Router } from "express";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  updatePassword,
  updateProfile,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/resend-forgot-password-otp", resendForgotPasswordOTP);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP);
router.post("/update-password", updatePassword);

// ── Protected routes ──────────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put(
  "/update-profile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile
);

export default router;
