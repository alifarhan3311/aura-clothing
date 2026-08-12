import { Router } from "express";
import {
  getAllSections,
  getCatalogBySection,
  getCatalogMeta,
} from "../controllers/catalog.controller.js";

const router = Router();

// ── All public (no auth required) ────────────────────────────────────────────

// GET /api/catalog
// Returns all sections (women, men, kids, home) with their categories + product count
router.get("/", getAllSections);

// GET /api/catalog/women           → all women products (paginated, filterable)
// GET /api/catalog/men             → all men products
// GET /api/catalog/kids            → all kids products
// GET /api/catalog/home            → all home products
//
// Supported query params:
//   page, limit, category, brand, size, color, minPrice, maxPrice, type, sortBy, order, search
router.get("/:section", getCatalogBySection);

// GET /api/catalog/women/meta      → only sidebar data (categories + filter options)
router.get("/:section/meta", getCatalogMeta);

export default router;
