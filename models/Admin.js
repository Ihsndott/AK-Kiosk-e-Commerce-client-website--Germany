import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Hashed password is required"],
    },
    name: {
      type: String,
      default: "Store Administrator",
      trim: true,
    },
    role: {
      type: String,
      default: "superadmin",
      enum: ["superadmin", "manager"],
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;

