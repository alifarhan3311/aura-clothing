import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import redis from "../lib/redis.js";
import { sendMail } from "../lib/mailer.js";
import {
  orderConfirmationEmail,
  adminNewOrderEmail,
  orderStatusUpdateEmail,
  orderTrackingEmail,
  adminCancelRequestEmail,
  cancelRequestAckEmail,
} from "../lib/emailTemplates.js";

// Redis checkout session TTL: 7 days
const CHECKOUT_TTL = 7 * 24 * 60 * 60;

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Deduct stock for ordered items (size-wise per variant).
 * Returns false if any item is out of stock.
 */
async function deductStock(items) {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product not found: ${item.product}`);

    const variant = product.variants.find(
      (v) =>
        v.size?.toLowerCase() === item.selectedSize?.toLowerCase() &&
        v.color?.toLowerCase() === item.selectedColor?.toLowerCase()
    );

    // Fallback: match by size only if color not stored
    const matched =
      variant ||
      product.variants.find(
        (v) => v.size?.toLowerCase() === item.selectedSize?.toLowerCase()
      );

    if (!matched) {
      throw new Error(
        `Size "${item.selectedSize}" not found for product "${product.name}"`
      );
    }

    if (matched.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}" – Size ${item.selectedSize} (available: ${matched.stock})`
      );
    }

    matched.stock -= item.quantity;
    await product.save();
  }
}

/**
 * Reverse stock for cancelled/rejected orders.
 */
async function reverseStock(items) {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const variant =
      product.variants.find(
        (v) =>
          v.size?.toLowerCase() === item.selectedSize?.toLowerCase() &&
          v.color?.toLowerCase() === item.selectedColor?.toLowerCase()
      ) ||
      product.variants.find(
        (v) => v.size?.toLowerCase() === item.selectedSize?.toLowerCase()
      );

    if (variant) {
      variant.stock += item.quantity;
      await product.save();
    }
  }
}

// ── Create Order ───────────────────────────────────────────────────────────────

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingInfo,
      paymentMethod,
      shippingMethod,
      shippingCost,
      subtotal,
      total,
      couponCode,
      discount,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    if (!shippingInfo || !paymentMethod || !shippingMethod) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Build order items and validate products exist
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product || item._id || item.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.mainImage || product.images?.[0] || null,
        price: item.price || 0,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
      });
    }

    // Deduct stock
    await deductStock(orderItems);

    // Increment coupon usedCount if applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingInfo,
      paymentMethod,
      shippingMethod,
      shippingCost: shippingCost || 0,
      subtotal: subtotal || 0,
      couponCode: couponCode || null,
      discount: discount || 0,
      total: total || 0,
      status: "pending",
      stockDeducted: true,
      statusHistory: [{ status: "pending", note: "Order placed by customer" }],
    });

    // Save checkout session in Redis for 7 days
    try {
      await redis.setex(
        `checkout:${req.user._id}`,
        CHECKOUT_TTL,
        JSON.stringify({
          orderId: order._id,
          items: orderItems,
          shippingInfo,
          subtotal,
          discount: discount || 0,
          couponCode: couponCode || null,
          shippingCost,
          total,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (_) {
      // Redis failure is non-fatal
    }

    const populated = await Order.findById(order._id)
      .populate("items.product", "name mainImage images")
      .populate("user", "name email");

    // ── Emails ────────────────────────────────────────────────────────────────
    // User confirmation
    sendMail(
      shippingInfo.email,
      "Order Received – Fade Find",
      orderConfirmationEmail(populated)
    ).catch((e) => console.error("[mail] user confirm:", e.message));

    // Admin notification
    if (process.env.ADMIN_EMAIL) {
      sendMail(
        process.env.ADMIN_EMAIL,
        `New Order #${order._id} – ${shippingInfo.firstName} ${shippingInfo.lastName}`,
        adminNewOrderEmail(populated)
      ).catch((e) => console.error("[mail] admin notify:", e.message));
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get My Orders ──────────────────────────────────────────────────────────────

export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate("items.product", "name mainImage images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments({ user: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Single Order ───────────────────────────────────────────────────────────

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name mainImage images price variants")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Track Order by tracking number (public) ────────────────────────────────────

export const trackOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const order = await Order.findOne({ trackingNumber })
      .populate("items.product", "name mainImage")
      .select("-user");

    if (!order) {
      return res.status(404).json({ success: false, message: "Tracking number not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Checkout Session from Redis ───────────────────────────────────────────

export const getCheckoutSession = async (req, res) => {
  try {
    const data = await redis.get(`checkout:${req.user._id}`);
    if (!data) {
      return res.status(404).json({ success: false, message: "No checkout session found" });
    }
    return res.status(200).json({ success: true, session: JSON.parse(data) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Order Status (Admin) ────────────────────────────────────────────────

const VALID_STATUSES = ["pending", "confirmed", "dispatched", "delivered", "cancelled", "rejected", "cancel_requested"];

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note = "" } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const prevStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, note });

    // ── Confirmed → assign tracking number ───────────────────────────────────
    if (status === "confirmed" && !order.trackingNumber) {
      let tracking;
      let attempts = 0;
      do {
        tracking = Order.generateTrackingNumber();
        attempts++;
      } while (
        (await Order.exists({ trackingNumber: tracking })) && attempts < 10
      );
      order.trackingNumber = tracking;
    }

    // ── Cancelled / Rejected → reverse stock ─────────────────────────────────
    const shouldReverse =
      ["cancelled", "rejected"].includes(status) &&
      !["cancelled", "rejected"].includes(prevStatus) &&
      order.stockDeducted;

    if (shouldReverse) {
      await reverseStock(order.items);
    }

    await order.save();

    // ── Emails ────────────────────────────────────────────────────────────────
    const userEmail = order.shippingInfo.email || order.user?.email;

    if (userEmail) {
      if (status === "confirmed") {
        // Send tracking email
        sendMail(
          userEmail,
          `Your Order is Confirmed – Tracking: ${order.trackingNumber}`,
          orderTrackingEmail(order)
        ).catch((e) => console.error("[mail] tracking:", e.message));
      } else {
        // Generic status update
        sendMail(
          userEmail,
          `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)} – Fade Find`,
          orderStatusUpdateEmail(order, note)
        ).catch((e) => console.error("[mail] status update:", e.message));
      }
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Cancel Request by User (sets status → cancel_requested, sends email to admin) ────

export const cancelOrderByUser = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only owner can request cancel
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Only pending/confirmed can be cancel-requested
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot request cancellation for an order with status "${order.status}"`,
      });
    }

    const trimmedReason = reason.trim() || "No reason provided";

    // Store pre-cancel status so admin can restore on rejection
    order.preCancelStatus   = order.status;
    order.status            = "cancel_requested";
    order.cancelReason      = trimmedReason;
    order.cancelRequestedAt = new Date();

    // Keep legacy cancelRequest object for backward compat
    order.cancelRequest = {
      requested:   true,
      reason:      trimmedReason,
      requestedAt: new Date(),
    };

    order.statusHistory.push({
      status: "cancel_requested",
      note: `Cancel requested by customer. Reason: ${trimmedReason}`,
    });

    await order.save();

    // ── Email to admin ─────────────────────────────────────────────────────────
    if (process.env.ADMIN_EMAIL) {
      sendMail(
        process.env.ADMIN_EMAIL,
        `⚠️ Cancel Request – Order #${order._id} – ${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
        adminCancelRequestEmail(order, trimmedReason)
      ).catch((e) => console.error("[mail] admin cancel request:", e.message));
    }

    // ── Acknowledgment to user ─────────────────────────────────────────────────
    const userEmail = order.shippingInfo.email || order.user?.email;
    if (userEmail) {
      sendMail(
        userEmail,
        "Cancel Request Received – Fade Find",
        cancelRequestAckEmail(order, trimmedReason)
      ).catch((e) => console.error("[mail] cancel ack:", e.message));
    }

    return res.status(200).json({
      success: true,
      message: "Cancel request submitted. Admin will review shortly.",
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Approve Cancel Request (Admin) → cancels order + reverses stock ────────────

export const approveCancelRequest = async (req, res) => {
  try {
    const { note = "" } = req.body;

    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "cancel_requested") {
      return res.status(400).json({
        success: false,
        message: "No pending cancel request for this order.",
      });
    }

    // Reverse stock if it was deducted
    if (order.stockDeducted) {
      await reverseStock(order.items);
    }

    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      note: note.trim() || "Cancellation request approved by admin.",
    });

    await order.save();

    // ── Email to user ──────────────────────────────────────────────────────────
    const userEmail = order.shippingInfo.email || order.user?.email;
    if (userEmail) {
      sendMail(
        userEmail,
        "Your Cancellation Request Has Been Approved – Fade Find",
        orderStatusUpdateEmail(order, note.trim() || "Your cancellation request has been approved.")
      ).catch((e) => console.error("[mail] cancel approved:", e.message));
    }

    return res.status(200).json({
      success: true,
      message: "Cancel request approved. Order has been cancelled.",
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Reject Cancel Request (Admin) → restores order to previous status ──────────

export const rejectCancelRequest = async (req, res) => {
  try {
    const { note = "" } = req.body;

    if (!note.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "cancel_requested") {
      return res.status(400).json({
        success: false,
        message: "No pending cancel request for this order.",
      });
    }

    // Restore to previous status (default to confirmed if unknown)
    const restoredStatus = order.preCancelStatus || "confirmed";
    order.status = restoredStatus;

    order.cancelRequest = {
      requested:   false,
      reason:      "",
      requestedAt: null,
    };

    order.statusHistory.push({
      status: restoredStatus,
      note: `Cancel request rejected by admin. Reason: ${note.trim()}`,
    });

    await order.save();

    // ── Email to user ──────────────────────────────────────────────────────────
    const userEmail = order.shippingInfo.email || order.user?.email;
    if (userEmail) {
      sendMail(
        userEmail,
        "Your Cancellation Request Has Been Rejected – Fade Find",
        orderStatusUpdateEmail(
          order,
          `Your cancellation request has been rejected. Reason: ${note.trim()}. Your order continues to be processed.`
        )
      ).catch((e) => console.error("[mail] cancel rejected:", e.message));
    }

    return res.status(200).json({
      success: true,
      message: `Cancel request rejected. Order restored to "${restoredStatus}".`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .populate("items.product", "name mainImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
