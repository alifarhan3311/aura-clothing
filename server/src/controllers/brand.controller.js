import Brand from "../models/Brand.js";
import { deleteFile, buildPublicPath } from "../middlewares/upload.middleware.js";

// ── Create Brand (Admin) ──────────────────────────────────────────────────────

export const createBrand = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Brand name is required" });
    }

    const existing = await Brand.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Brand with this name already exists" });
    }

    const logo = req.file ? buildPublicPath(req.file) : null;

    const brand = await Brand.create({
      name,
      description,
      logo,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      brand,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All Brands (Public) ───────────────────────────────────────────────────

export const getAllBrands = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };

    // Admins see all; regular users see only active brands
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      query.isActive = true;
    } else if (status !== undefined) {
      query.isActive = status === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [brands, total] = await Promise.all([
      Brand.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Brand.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      brands,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Single Brand (Public) ─────────────────────────────────────────────────

export const getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }
    return res.status(200).json({ success: true, brand });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Brand (Admin) ──────────────────────────────────────────────────────

export const updateBrand = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    if (name) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (isActive !== undefined) brand.isActive = isActive === "true" || isActive === true;

    if (req.file) {
      // Delete old logo if it exists
      if (brand.logo) deleteFile(brand.logo);
      brand.logo = buildPublicPath(req.file);
    }

    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      brand,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Brand Status (Admin) ───────────────────────────────────────────────

export const updateBrandStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be a boolean" });
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Brand ${isActive ? "activated" : "deactivated"} successfully`,
      brand,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete Brand (Admin) ──────────────────────────────────────────────────────

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    if (brand.logo) deleteFile(brand.logo);

    await Brand.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
