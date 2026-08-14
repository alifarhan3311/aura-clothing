import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Department from "../models/Department.js";

// Helper to resolve department by slug or ID
async function resolveDepartment(secParam) {
  const lower = secParam.toLowerCase();
  const isObjectId = /^[a-f\d]{24}$/i.test(secParam);
  let dept = null;
  if (isObjectId) {
    dept = await Department.findById(secParam);
  } else {
    dept = await Department.findOne({ slug: lower });
  }
  return dept;
}

// ── Helper: build price range query from variants ─────────────────────────────
function buildPriceQuery(minPrice, maxPrice) {
  if (!minPrice && !maxPrice) return {};
  const range = {};
  if (minPrice) range.$gte = parseFloat(minPrice);
  if (maxPrice) range.$lte = parseFloat(maxPrice);
  return { "variants.price": range };
}

// ── Helper: parse comma-separated param into an array ────────────────────────
function parseList(param) {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/catalog/:section
//
// Query params (all optional):
//   page         – page number, default 1
//   limit        – items per page, default 16
//   category     – single category slug or ObjectId  (e.g. ?category=dresses)
//   brand        – comma-separated brand ObjectIds
//   size         – comma-separated sizes              (e.g. ?size=S,M,L)
//   color        – comma-separated colors             (e.g. ?color=Red,Blue)
//   minPrice     – minimum variant price
//   maxPrice     – maximum variant price
//   type         – product type tag: featured | trending | new-arrival
//   sortBy       – createdAt | price | name, default: createdAt
//   order        – asc | desc, default: desc
//   search       – full-text search on product name
// ═══════════════════════════════════════════════════════════════════════════════

export const getCatalogBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const lowerSec = section.toLowerCase();

    // Check if department exists in DB or fallback
    const dept = await resolveDepartment(section);

    const {
      page = 1,
      limit = 16,
      category: categoryParam,
      brand,
      size,
      color,
      minPrice,
      maxPrice,
      type,
      sortBy = "createdAt",
      order = "desc",
      search,
    } = req.query;

    // ── 1. Resolve category IDs for this section / department ────────────────
    const sectionCategoryQuery = { isActive: true };
    if (dept) {
      sectionCategoryQuery.$or = [
        { department: dept._id },
        { section: dept.slug },
      ];
    } else {
      sectionCategoryQuery.section = lowerSec;
    }

    // If a specific sub-category is requested, narrow further
    if (categoryParam) {
      const isObjectId = /^[a-f\d]{24}$/i.test(categoryParam);
      if (isObjectId) {
        sectionCategoryQuery._id = categoryParam;
      } else {
        sectionCategoryQuery.slug = categoryParam.toLowerCase();
      }
    }

    const sectionCategories = await Category.find(sectionCategoryQuery).select("_id name slug image section department");

    const categoryIds = sectionCategories.map((c) => c._id);

    // ── 2. Build product query ────────────────────────────────────────────────
    // If filtering by a specific category, only show those products
    // If showing the full section, also include products with no category assigned
    const productQuery = {
      isActive: true,
    };

    if (categoryParam) {
      // Specific category filter — must match
      productQuery.category = { $in: categoryIds };
    } else if (categoryIds.length > 0) {
      // Whole section — match category in section OR null/unset category
      productQuery.$or = [
        { category: { $in: categoryIds } },
        { category: null },
        { category: { $exists: false } },
      ];
    }

    // Optional: full-text name search
    if (search) {
      productQuery.name = { $regex: search.trim(), $options: "i" };
    }

    // Optional: brand filter (comma-separated IDs)
    const brandIds = parseList(brand);
    if (brandIds.length > 0) {
      productQuery.brand = { $in: brandIds };
    }

    // Optional: product type tag
    if (type) {
      productQuery.type = type;
    }

    // Optional: price range (applied to variants)
    const priceQuery = buildPriceQuery(minPrice, maxPrice);
    Object.assign(productQuery, priceQuery);

    // Optional: size filter on variants
    const sizeList = parseList(size);
    if (sizeList.length > 0) {
      productQuery["variants.size"] = { $in: sizeList };
    }

    // Optional: color filter — checks both product-level colors and variant colors
    const colorList = parseList(color);
    if (colorList.length > 0) {
      const colorRegexes = colorList.map((c) => new RegExp(c, "i"));
      productQuery.$or = [
        { colors: { $in: colorRegexes } },
        { "variants.color": { $in: colorRegexes } },
      ];
    }

    // ── 3. Sort ───────────────────────────────────────────────────────────────
    const SORT_WHITELIST = new Set(["createdAt", "name", "isFeatured", "updatedAt"]);
    const safeSortBy = SORT_WHITELIST.has(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    // price sort requires sorting on variants.price (first variant used as proxy)
    const sortObj =
      sortBy === "price"
        ? { "variants.0.price": sortOrder }
        : { [safeSortBy]: sortOrder };

    // ── 4. Pagination ─────────────────────────────────────────────────────────
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ── 5. Run queries in parallel ────────────────────────────────────────────
    const [products, total] = await Promise.all([
      Product.find(productQuery)
        .populate("brand", "name logo")
        .populate("category", "name slug image section")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(productQuery),
    ]);

    // ── 6. Build available filter options from current result set ─────────────
    // For filter discovery we query all matching products (no pagination) to
    // extract unique brands, sizes, colors, and price range.
    const allMatchingProducts = await Product.find(productQuery)
      .populate("brand", "name _id")
      .select("brand variants colors")
      .lean();

    const brandsMap = new Map();
    const sizesSet = new Set();
    const colorsSet = new Set();
    let priceMin = Infinity;
    let priceMax = 0;

    allMatchingProducts.forEach((p) => {
      // Brands
      if (p.brand) {
        brandsMap.set(p.brand._id.toString(), { _id: p.brand._id, name: p.brand.name });
      }
      // Colors (product-level)
      p.colors?.forEach((c) => colorsSet.add(c));
      // Variants — sizes, colors, prices
      p.variants?.forEach((v) => {
        if (v.size) sizesSet.add(v.size);
        if (v.color) colorsSet.add(v.color);
        if (typeof v.price === "number") {
          const effectivePrice = v.discount > 0 ? v.price * (1 - v.discount / 100) : v.price;
          if (effectivePrice < priceMin) priceMin = effectivePrice;
          if (effectivePrice > priceMax) priceMax = effectivePrice;
        }
      });
    });

    const filters = {
      brands: [...brandsMap.values()],
      sizes: [...sizesSet].sort(),
      colors: [...colorsSet].sort(),
      priceRange: {
        min: priceMin === Infinity ? 0 : Math.floor(priceMin),
        max: Math.ceil(priceMax),
      },
    };

    // ── 7. Respond ────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      section,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
      categories: sectionCategories,   // sub-categories for sidebar
      products,
      filters,                         // aggregated filter options
    });
  } catch (error) {
    console.error("[getCatalogBySection]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/catalog/:section/meta
//
// Returns only category list + filter options for this section
// without fetching any products — useful for pre-loading sidebar filters.
// ═══════════════════════════════════════════════════════════════════════════════

export const getCatalogMeta = async (req, res) => {
  try {
    const { section } = req.params;

    if (!VALID_SECTIONS.includes(section.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}`,
      });
    }

    // All active categories in this section
    const categories = await Category.find({
      section: section.toLowerCase(),
      isActive: true,
    })
      .select("_id name slug image")
      .sort({ name: 1 })
      .lean();

    if (categories.length === 0) {
      return res.status(200).json({
        success: true,
        section,
        categories: [],
        filters: { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } },
      });
    }

    const categoryIds = categories.map((c) => c._id);

    // Aggregate filter options across all products in this section
    const allProducts = await Product.find({
      isActive: true,
      category: { $in: categoryIds },
    })
      .populate("brand", "name _id")
      .select("brand variants colors")
      .lean();

    const brandsMap = new Map();
    const sizesSet = new Set();
    const colorsSet = new Set();
    let priceMin = Infinity;
    let priceMax = 0;

    allProducts.forEach((p) => {
      if (p.brand) {
        brandsMap.set(p.brand._id.toString(), { _id: p.brand._id, name: p.brand.name });
      }
      p.colors?.forEach((c) => colorsSet.add(c));
      p.variants?.forEach((v) => {
        if (v.size) sizesSet.add(v.size);
        if (v.color) colorsSet.add(v.color);
        if (typeof v.price === "number") {
          const ep = v.discount > 0 ? v.price * (1 - v.discount / 100) : v.price;
          if (ep < priceMin) priceMin = ep;
          if (ep > priceMax) priceMax = ep;
        }
      });
    });

    return res.status(200).json({
      success: true,
      section,
      categories,
      filters: {
        brands: [...brandsMap.values()],
        sizes: [...sizesSet].sort(),
        colors: [...colorsSet].sort(),
        priceRange: {
          min: priceMin === Infinity ? 0 : Math.floor(priceMin),
          max: Math.ceil(priceMax),
        },
      },
    });
  } catch (error) {
    console.error("[getCatalogMeta]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/catalog
//
// Returns all four sections at once with their category list and product counts.
// Useful for the homepage mega-menu or nav bar.
// ═══════════════════════════════════════════════════════════════════════════════

export const getAllSections = async (req, res) => {
  try {
    const sections = await Promise.all(
      VALID_SECTIONS.map(async (section) => {
        const categories = await Category.find({
          section,
          isActive: true,
        })
          .select("_id name slug image")
          .sort({ name: 1 })
          .lean();

        const categoryIds = categories.map((c) => c._id);

        const productCount = categoryIds.length
          ? await Product.countDocuments({ isActive: true, category: { $in: categoryIds } })
          : 0;

        return { section, categories, productCount };
      })
    );

    return res.status(200).json({ success: true, sections });
  } catch (error) {
    console.error("[getAllSections]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
