import { Router } from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadUser } from "../middlewares/upload.middleware.js";

const router = Router();

// All user-management routes are Admin-only
router.use(protect, authorizeRoles("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", uploadUser.single("avatar"), createUser);
router.put("/:id", uploadUser.single("avatar"), updateUser);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
