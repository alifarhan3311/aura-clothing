import Coupon from "../models/Coupon.js";

// ── Create Coupon (Admin) ─────────────────────────────────────────────────────

export const createCoupon = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      minimumPurchase, maximumDiscount, startDate, expiryDate,
      usageLimit, products, isActive,
    } = req.body;

    if (!code || !discountType || !discountValue || !startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "code, discountType, discountValue, startDate and expiryDate are required",
      });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code, description, discountType, discountValue,
      minimumPurchase, maximumDiscount, startDate, expiryDate,
      usageLimit, products, isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All Coupons (Admin) ───────────────────────────────────────────────────

export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, discountType, isActive } = req.query;

    const query = {};
    if (search) query.code = { $regex: search, $options: "i" };
    if (discountType) query.discountType = discountType;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate("products", "name mainImage")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Coupon.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      coupons,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Single Coupon ─────────────────────────────────────────────────────────

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate("products", "name mainImage");
    if (!coupon)
      return res.status(404).json({ success: false, message: "Coupon not found" });

    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Coupon (Admin) ─────────────────────────────────────────────────────

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon)
      return res.status(404).json({ success: false, message: "Coupon not found" });

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Coupon Status (Admin) ──────────────────────────────────────────────

export const updateCouponStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be a boolean" });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!coupon)
      return res.status(404).json({ success: false, message: "Coupon not found" });

    return res.status(200).json({
      success: true,
      message: `Coupon ${isActive ? "activated" : "deactivated"}`,
      coupon,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete Coupon (Admin) ─────────────────────────────────────────────────────

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon)
      return res.status(404).json({ success: false, message: "Coupon not found" });

    return res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Validate / Apply Coupon (User) ─────────────────────────────────────────────

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal, items = [] } = req.body;

    if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid or expired coupon" });

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: "Coupon is not valid at this time" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    if (cartTotal < coupon.minimumPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of PKR ${coupon.minimumPurchase} required`,
      });
    }

    // ── Determine eligible products ───────────────────────────────────────────
    // coupon.products = [] means coupon applies to ALL products
    const hasProductRestriction = coupon.products && coupon.products.length > 0;

    // IDs of restricted products as strings for easy comparison
    const restrictedIds = hasProductRestriction
      ? coupon.products.map((p) => p.toString())
      : [];

    // Build per-item breakdown
    // items = [{ id, price, quantity, name }] — sent from frontend
    let eligibleSubtotal = 0;
    const itemBreakdown = items.map((item) => {
      const pid = item.id || item._id || item.product;
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      const eligible = !hasProductRestriction || restrictedIds.includes(pid?.toString());
      if (eligible) eligibleSubtotal += lineTotal;
      return { id: pid, eligible, lineTotal };
    });

    // If product-restricted but none of the cart items match — reject
    if (hasProductRestriction && eligibleSubtotal === 0) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not applicable to any item in your cart",
      });
    }

    // ── Calculate total discount ──────────────────────────────────────────────
    const base = hasProductRestriction ? eligibleSubtotal : cartTotal;
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (base * coupon.discountValue) / 100;
      if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    } else {
      discount = Math.min(coupon.discountValue, base);
    }
    discount = Math.round(discount);

    // ── Per-item discount amount (proportional split) ─────────────────────────
    const breakdown = itemBreakdown.map((b) => {
      if (!b.eligible || eligibleSubtotal === 0) {
        return { id: b.id, itemDiscount: 0, eligible: false };
      }
      const share = Math.round((b.lineTotal / eligibleSubtotal) * discount);
      return { id: b.id, itemDiscount: share, eligible: true };
    });

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      discount,
      // breakdown: per item { id, itemDiscount, eligible }
      breakdown,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        hasProductRestriction,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
