import { Router } from "express";
import {
  getActiveDepartments,
  getAllDepartmentsAdmin,
  getDepartment,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadDepartment } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes
router.get("/", getActiveDepartments);
router.get("/:idOrSlug", getDepartment);

// Admin routes
router.get("/admin/all", protect, authorizeRoles("admin"), getAllDepartmentsAdmin);
router.post("/", protect, authorizeRoles("admin"), uploadDepartment.single("image"), createDepartment);
router.put("/:id", protect, authorizeRoles("admin"), uploadDepartment.single("image"), updateDepartment);
router.patch("/:id/status", protect, authorizeRoles("admin"), updateDepartmentStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteDepartment);

export default router;
