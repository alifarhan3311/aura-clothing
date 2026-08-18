import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      trim: true,
      default: "General Inquiry",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "resolved", "rejected", "closed"],
      default: "pending",
    },
    adminReply: {
      type: String,
      default: "",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed", "resolved", "rejected", "closed"],
        },
        note: {
          type: String,
          default: "",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

contactSchema.index({ email: 1 });
contactSchema.index({ user: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

export default mongoose.model("Contact", contactSchema);
