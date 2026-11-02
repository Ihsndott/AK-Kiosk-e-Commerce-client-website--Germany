import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Subscriber model — stores newsletter subscription emails from the Footer form.
 */
const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unsubscribeToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString("hex"),
      index: true,
    },
    source: {
      type: String,
      enum: ["footer", "checkout", "admin"],
      default: "footer",
    },
  },
  {
    timestamps: true, // createdAt = subscription date
  }
);

subscriberSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.models.Subscriber ||
  mongoose.model("Subscriber", subscriberSchema);

