import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import dbConnect from "./lib/db.js";
import redis from "./lib/redis.js";

import authRoutes from "./routes/auth.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import orderRoutes from "./routes/order.routes.js";
import slideRoutes from "./routes/slide.routes.js";
import departmentRoutes from "./routes/department.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
// e.g. GET /uploads/category/image.jpg
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/slides", slideRoutes);
app.use("/api/departments", departmentRoutes);

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err);

  // Multer errors
  if (err.name === "MulterError" || err.message?.includes("Only image")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────

const start = async () => {
  await dbConnect();

  // Redis is optional — server continues even if Redis is unavailable
  try {
    await redis.connect();
  } catch (err) {
    console.warn("Redis unavailable – OTP features will not work:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
