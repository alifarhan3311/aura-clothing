import { Router } from "express";
import {
  getActiveSlides,
  getAllSlidesAdmin,
  createSlide,
  updateSlide,
  updateSlideStatus,
  deleteSlide,
} from "../controllers/slide.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadSlide } from "../middlewares/upload.middleware.js";

const router = Router();

// Public route
router.get("/", getActiveSlides);

// Admin routes
router.get("/admin", protect, authorizeRoles("admin"), getAllSlidesAdmin);
router.post("/", protect, authorizeRoles("admin"), uploadSlide.single("image"), createSlide);
router.put("/:id", protect, authorizeRoles("admin"), uploadSlide.single("image"), updateSlide);
router.patch("/:id/status", protect, authorizeRoles("admin"), updateSlideStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSlide);

export default router;
