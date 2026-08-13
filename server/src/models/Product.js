import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [{ type: String }],
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
      default: null,
    },
    variants: [productVariantSchema],
    mainImage: {
      type: String,
      default: null,
    },
    // Additional product images (gallery)
    images: {
      type: [String],
      default: [],
    },
    // Available colors for this product
    colors: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Product placement tags – multiple allowed
    type: {
      type: [
        {
          type: String,
          enum: ["featured", "trending", "new-arrival"],
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
