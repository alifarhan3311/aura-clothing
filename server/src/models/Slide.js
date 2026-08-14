import mongoose from "mongoose";

const slideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    eyebrow: {
      type: String,
      trim: true,
      default: "",
    },
    badgeText: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },
    linkPath: {
      type: String,
      default: "/shop",
      trim: true,
    },
    secondaryButtonText: {
      type: String,
      default: "",
      trim: true,
    },
    secondaryLinkPath: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Stats configuration (Optional)
    showStats: {
      type: Boolean,
      default: false,
    },
    stat1Value: { type: String, default: "", trim: true },
    stat1Label: { type: String, default: "", trim: true },
    stat2Value: { type: String, default: "", trim: true },
    stat2Label: { type: String, default: "", trim: true },
    stat3Value: { type: String, default: "", trim: true },
    stat3Label: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Slide = mongoose.model("Slide", slideSchema);
export default Slide;
