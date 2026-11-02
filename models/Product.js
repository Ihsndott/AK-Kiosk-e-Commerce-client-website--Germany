import mongoose from "mongoose";

/**
 * Converts a product name into a URL-friendly slug.
 */
export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      default: null,
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
      default: null,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
      validate: [
        (val) => val.length <= 3,
        "A product can have at most 3 images",
      ],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

// Keep primary image in sync with the first item in images array & generate slug
productSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  if (this.images && this.images.length > 0 && !this.image) {
    this.image = this.images[0];
  } else if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
  // Sync discountPrice and originalPrice if either is provided
  if (this.discountPrice && !this.originalPrice) {
    this.originalPrice = this.price;
  }
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
