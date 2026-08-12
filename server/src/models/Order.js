import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name:          { type: String, required: true },
    image:         { type: String, default: null },
    price:         { type: Number, required: true },
    quantity:      { type: Number, required: true, min: 1 },
    selectedSize:  { type: String, default: "" },
    selectedColor: { type: String, default: "" },
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    note:      { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],

    shippingInfo: {
      firstName:  { type: String, required: true },
      lastName:   { type: String, required: true },
      email:      { type: String, required: true },
      phone:      { type: String, required: true },
      address:    { type: String, required: true },
      city:       { type: String, required: true },
      postalCode: { type: String, required: true },
      country:    { type: String, default: "Pakistan" },
    },

    paymentMethod:  { type: String, required: true, enum: ["cod", "card"] },
    shippingMethod: { type: String, required: true, enum: ["standard", "express"] },
    shippingCost:   { type: Number, required: true, min: 0 },

    // Coupon
    couponCode:     { type: String, default: null },
    discount:       { type: Number, default: 0, min: 0 },

    subtotal:       { type: Number, required: true, min: 0 },
    total:          { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "dispatched", "delivered", "cancelled", "rejected", "cancel_requested"],
      default: "pending",
    },

    // Set by admin when order is confirmed — user can track via this
    trackingNumber: { type: String, default: null, unique: true, sparse: true },

    // Full audit trail of status changes
    statusHistory: [statusHistorySchema],

    // Whether stock has been deducted (prevents double deduction)
    stockDeducted: { type: Boolean, default: false },

    // Cancel request submitted by user (pending admin approval)
    cancelRequest: {
      requested:   { type: Boolean, default: false },
      reason:      { type: String,  default: "" },
      requestedAt: { type: Date,    default: null },
    },

    // Flat fields for easy frontend access
    cancelReason:      { type: String, default: "" },
    cancelRequestedAt: { type: Date,   default: null },
    // Status before cancel_requested (to restore on rejection)
    preCancelStatus:   { type: String, default: null },
  },
  { timestamps: true }
);

// Generate a random tracking number: MH-YYYYMMDD-XXXXXX
orderSchema.statics.generateTrackingNumber = function () {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).toUpperCase().substring(2, 8);
  return `MH-${date}-${rand}`;
};

export default mongoose.model("Order", orderSchema);
