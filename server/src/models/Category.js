import mongoose from "mongoose";

// ── Slug helper ───────────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // URL-friendly identifier: "women", "men", "kids", "home"
    // Auto-generated from name on save if not provided
    slug: {
      type: String,
      unique: true,
      sparse: true,   // allows multiple null values safely
      trim: true,
      lowercase: true,
    },

    // Foreign Key reference to top-level Department / Section layer
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      index: true,
      default: null,
    },

    // Legacy fallback string slug ("women", "men", "kids", etc.)
    section: {
      type: String,
      default: "women",
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving
categorySchema.pre("save", async function () {
  if (!this.slug || this.isModified("name")) {
    this.slug = toSlug(this.name);
  }
});

export default mongoose.model("Category", categorySchema);