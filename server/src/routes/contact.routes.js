import express from "express";
import {
  createContact,
  getMyContacts,
  getAllContacts,
  getContactStats,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../controllers/contact.controller.js";
import {
  protect,
  authorizeRoles,
  optionalAuth,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// ── Public / Customer Routes ──────────────────────────────────────────────────
// Submit a contact form inquiry (optionalAuth automatically attaches user if logged in)
router.post("/", optionalAuth, createContact);

// Logged-in customer can view their submitted inquiries
router.get("/my", protect, getMyContacts);

// ── Admin Routes ──────────────────────────────────────────────────────────────
router.use(protect, authorizeRoles("admin"));

router.get("/stats", getContactStats);
router.get("/", getAllContacts);
router.get("/:id", getContactById);
router.patch("/:id/status", updateContactStatus);
router.delete("/:id", deleteContact);

export default router;
