import mongoose from "mongoose";

/**
 * Customer model for shoppers on the AK Kiosk & Asian Market storefront.
 * Passwords must be hashed with bcryptjs before saving.
 * Role is strictly constrained to "customer" to prevent privilege escalation.
 */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
    },
    password: {
      type: String,
      required: [true, "Hashed password is required"],
    },
    role: {
      type: String,
      default: "customer",
      enum: ["customer"], // Strict enum prevents customer registering as admin or trainer
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "Oberhausen" },
      postalCode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "Germany" },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
customerSchema.index({ isActive: 1, createdAt: -1 });

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;

