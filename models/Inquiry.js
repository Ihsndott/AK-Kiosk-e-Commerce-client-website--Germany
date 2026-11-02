import mongoose from "mongoose";

/**
 * Inquiry model — stores customer contact form submissions from /contact.
 */
const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
    ipAddress: {
      type: String,
      trim: true,
      default: "",
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index for admin list queries
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ email: 1 });

export default mongoose.models.Inquiry ||
  mongoose.model("Inquiry", inquirySchema);

