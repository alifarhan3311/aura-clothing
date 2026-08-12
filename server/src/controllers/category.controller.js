import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { deleteFile, buildPublicPath } from "../middlewares/upload.middleware.js";

// ── Create Category (Admin) ───────────────────────────────────────────────────

const VALID_SECTIONS = ["women", "men", "kids"];

export const createCategory = async (req, res) => {
  try {
    const { name, description, isActive, section } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    if (!section || !VALID_SECTIONS.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Section is required and must be one of: ${VALID_SECTIONS.join(", ")}`,
      });
    }

    const existing = await Category.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });
    }

    const image = req.file ? buildPublicPath(req.file) : null;

    const category = await Category.create({
      name,
      description,
      image,
      section,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All Categories ────────────────────────────────────────────────────────

export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, section } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (section && VALID_SECTIONS.includes(section)) query.section = section;

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      query.isActive = true;
    } else if (status !== undefined) {
      query.isActive = status === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [categories, total] = await Promise.all([
      Category.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Category.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      categories,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Single Category ───────────────────────────────────────────────────────

export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Category (Admin) ───────────────────────────────────────────────────

export const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (req.body.section) {
      if (!VALID_SECTIONS.includes(req.body.section)) {
        return res.status(400).json({
          success: false,
          message: `Section must be one of: ${VALID_SECTIONS.join(", ")}`,
        });
      }
      category.section = req.body.section;
    }
    if (isActive !== undefined) category.isActive = isActive === "true" || isActive === true;

    if (req.file) {
      if (category.image) deleteFile(category.image);
      category.image = buildPublicPath(req.file);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Category Status (Admin) ────────────────────────────────────────────

export const updateCategoryStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be a boolean" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Category ${isActive ? "activated" : "deactivated"} successfully`,
      category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Products by Category ──────────────────────────────────────────────────
// GET /api/categories/:id/products
// Supports: page, limit, sortBy, order, minPrice, maxPrice, size, color, brand

export const getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const {
      page = 1,
      limit = 16,
      sortBy = "createdAt",
      order = "desc",
      minPrice,
      maxPrice,
      size,
      color,
      brand,
    } = req.query;

    const query = { isActive: true, category: category._id };

    if (brand) query.brand = brand;

    if (minPrice || maxPrice) {
      const range = {};
      if (minPrice) range.$gte = parseFloat(minPrice);
      if (maxPrice) range.$lte = parseFloat(maxPrice);
      query["variants.price"] = range;
    }

    if (size) {
      const sizes = size.split(",").map((s) => s.trim()).filter(Boolean);
      if (sizes.length) query["variants.size"] = { $in: sizes };
    }

    if (color) {
      const colors = color.split(",").map((c) => c.trim()).filter(Boolean);
      if (colors.length) {
        const regexes = colors.map((c) => new RegExp(c, "i"));
        query.$or = [
          { colors: { $in: regexes } },
          { "variants.color": { $in: regexes } },
        ];
      }
    }

    const SORT_WHITELIST = new Set(["createdAt", "name", "updatedAt"]);
    const safeSortBy = SORT_WHITELIST.has(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = sortBy === "price" ? { "variants.0.price": sortOrder } : { [safeSortBy]: sortOrder };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("brand", "name logo")
        .populate("category", "name image slug section")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      category,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Filter Meta for a Category (sizes, colors, brands, price range) ───────
// GET /api/categories/:id/meta

export const getCategoryMeta = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Aggregate all active products in this category to extract unique filter values
    const products = await Product.find({ isActive: true, category: category._id })
      .populate("brand", "name _id")
      .select("variants colors brand")
      .lean();

    const sizesSet   = new Set();
    const colorsSet  = new Set();
    const brandsMap  = new Map(); // id → name
    let minPrice     = Infinity;
    let maxPrice     = 0;

    for (const p of products) {
      // Brand
      if (p.brand?._id) brandsMap.set(p.brand._id.toString(), p.brand.name);

      // Colors at product level
      if (Array.isArray(p.colors)) {
        p.colors.forEach((c) => c && colorsSet.add(c.trim()));
      }

      // Variants → sizes, variant-level colors, price range
      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          if (v.size)  sizesSet.add(v.size.trim());
          if (v.color) colorsSet.add(v.color.trim());
          const effectivePrice = v.discount > 0
            ? Math.round(v.price * (1 - v.discount / 100))
            : v.price;
          if (effectivePrice < minPrice) minPrice = effectivePrice;
          if (effectivePrice > maxPrice) maxPrice = effectivePrice;
        }
      }
    }

    return res.status(200).json({
      success: true,
      meta: {
        sizes:    [...sizesSet].sort(),
        colors:   [...colorsSet].sort(),
        brands:   [...brandsMap.entries()].map(([id, name]) => ({ _id: id, name })),
        priceRange: {
          min: minPrice === Infinity ? 0 : minPrice,
          max: maxPrice,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    if (category.image) deleteFile(category.image);

    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
