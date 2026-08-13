import Product from "../models/Product.js";
import { deleteFile, buildPublicPath } from "../middlewares/upload.middleware.js";

// ── Create Product (Admin) ────────────────────────────────────────────────────

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      isFeatured,
      type,      // JSON string array: '["featured","trending"]'
      variants,  // JSON string array of variant objects
      colors,    // JSON string array or comma-separated: '["Red","Blue"]'
    } = req.body;

    if (!name || !description || !brand) {
      return res.status(400).json({
        success: false,
        message: "name, description and brand are required",
      });
    }

    // Handle file uploads (req.files when using .fields())
    const mainImageFile = req.files?.mainImage?.[0];
    const productImageFiles = req.files?.productImages || [];

    const mainImage = mainImageFile ? buildPublicPath(mainImageFile) : null;
    const images = productImageFiles.map((f) => buildPublicPath(f));

    let parsedVariants = [];
    if (variants) {
      try { parsedVariants = JSON.parse(variants); }
      catch { return res.status(400).json({ success: false, message: "variants must be valid JSON" }); }
    }

    let parsedType = [];
    if (type) {
      try { parsedType = JSON.parse(type); }
      catch { parsedType = Array.isArray(type) ? type : [type]; }
    }

    let parsedColors = [];
    if (colors) {
      try { parsedColors = JSON.parse(colors); }
      catch { parsedColors = Array.isArray(colors) ? colors : colors.split(",").map((c) => c.trim()).filter(Boolean); }
    }

    const product = await Product.create({
      name,
      description,
      brand,
      category: category || null,
      mainImage,
      images,
      colors: parsedColors,
      isFeatured: isFeatured === "true" || isFeatured === true,
      type: parsedType,
      variants: parsedVariants,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All Products ──────────────────────────────────────────────────────────

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      brand,
      category,
      status,
      featured,
      type,        // filter by type tag e.g. ?type=trending
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (featured !== undefined) query.isFeatured = featured === "true";
    if (type) query.type = { $in: [type] }; // matches products whose type array contains this value

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      query.isActive = true;
    } else if (status !== undefined) {
      query.isActive = status === "true";
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      query["variants.price"] = priceFilter;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("brand", "name logo")
        .populate("category", "name image")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ [sortBy]: sortOrder }),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Single Product ────────────────────────────────────────────────────────

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("brand", "name logo")
      .populate("category", "name image");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Product (Admin) ────────────────────────────────────────────────────

export const updateProduct = async (req, res) => {
  try {
    const { name, description, brand, category, isFeatured, type, variants, colors, removeImages } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (isFeatured !== undefined)
      product.isFeatured = isFeatured === "true" || isFeatured === true;

    if (type !== undefined) {
      try { product.type = JSON.parse(type); }
      catch { product.type = Array.isArray(type) ? type : [type]; }
    }

    if (variants) {
      try { product.variants = JSON.parse(variants); }
      catch { return res.status(400).json({ success: false, message: "variants must be valid JSON" }); }
    }

    if (colors !== undefined) {
      try { product.colors = JSON.parse(colors); }
      catch { product.colors = Array.isArray(colors) ? colors : colors.split(",").map((c) => c.trim()).filter(Boolean); }
    }

    // Handle main image replacement
    const mainImageFile = req.files?.mainImage?.[0];
    if (mainImageFile) {
      if (product.mainImage) deleteFile(product.mainImage);
      product.mainImage = buildPublicPath(mainImageFile);
    }

    // Handle additional product images
    const productImageFiles = req.files?.productImages || [];

    // Remove images that user wants deleted
    if (removeImages) {
      let toRemove = [];
      try { toRemove = JSON.parse(removeImages); }
      catch { toRemove = Array.isArray(removeImages) ? removeImages : [removeImages]; }
      toRemove.forEach((imgPath) => deleteFile(imgPath));
      product.images = product.images.filter((img) => !toRemove.includes(img));
    }

    // Append newly uploaded images
    if (productImageFiles.length > 0) {
      const newImagePaths = productImageFiles.map((f) => buildPublicPath(f));
      product.images = [...(product.images || []), ...newImagePaths];
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Product Status (Admin) ─────────────────────────────────────────────

export const updateProductStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be a boolean" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Product ${isActive ? "activated" : "deactivated"} successfully`,
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete Product (Admin) ────────────────────────────────────────────────────

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.mainImage) deleteFile(product.mainImage);
    // Delete all gallery images too
    if (product.images?.length) {
      product.images.forEach((img) => deleteFile(img));
    }
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
