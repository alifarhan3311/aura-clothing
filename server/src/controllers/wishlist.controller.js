import Wishlist from "../models/Wishlist.js";

// ── GET /api/wishlist  ────────────────────────────────────────────────────────
// Returns the authenticated user's wishlist with populated product details
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: "products",
      select: "name mainImage images variants isActive isFeatured type brand category",
      populate: [
        { path: "brand", select: "name" },
        { path: "category", select: "name" },
      ],
    });

    const products = wishlist ? wishlist.products.filter(Boolean) : [];

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/wishlist/:productId  ────────────────────────────────────────────
// Toggle: adds product if not present, removes if already in wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [productId] });
      return res.status(200).json({ success: true, action: "added", productId });
    }

    const alreadyIn = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (alreadyIn) {
      wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== productId
      );
      await wishlist.save();
      return res.status(200).json({ success: true, action: "removed", productId });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.status(200).json({ success: true, action: "added", productId });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/wishlist  ─────────────────────────────────────────────────────
// Clears the entire wishlist for the authenticated user
export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { products: [] }
    );
    return res.status(200).json({ success: true, message: "Wishlist cleared" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
