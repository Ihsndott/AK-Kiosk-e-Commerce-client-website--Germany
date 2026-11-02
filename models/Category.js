import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate categories case-insensitively
categorySchema.index(
  { name: 1 },
  { collation: { locale: "en", strength: 2 }, unique: true }
);

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;

