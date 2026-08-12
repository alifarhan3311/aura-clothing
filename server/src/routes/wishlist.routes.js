import { Router } from "express";
import {
  getWishlist,
  toggleWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// All wishlist routes require authentication
router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", toggleWishlist);
router.delete("/", clearWishlist);

export default router;
