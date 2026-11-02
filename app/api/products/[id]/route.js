import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product, { slugify } from "@/models/Product";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/[id]
 *
 * Retrieves a single product by its MongoDB _id OR its slug.
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Product identifier is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId
      ? { $or: [{ _id: id }, { slug: id.toLowerCase() }] }
      : { slug: id.toLowerCase() };

    const product = await Product.findOne(query).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve product" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 *
 * Admin-protected endpoint to update an existing product.
 */
export async function PUT(request, { params }) {
  try {
    // 1. Verify administrator authentication
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Administrator session required." },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      name,
      price,
      discountPrice,
      originalPrice,
      description,
      category,
      image,
      images,
      stock,
      sku,
    } = body;

    // 3. Server-side validation
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("Product name is required");
    }

    if (price === undefined || price === null || price === "") {
      errors.push("Product price is required");
    } else {
      const numPrice = Number(price);
      if (isNaN(numPrice)) {
        errors.push("Price must be a valid number");
      } else if (numPrice < 0) {
        errors.push("Price cannot be negative");
      }
    }

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      errors.push("Product description is required");
    }

    if (
      !category ||
      typeof category !== "string" ||
      category.trim().length === 0
    ) {
      errors.push("Product category is required");
    }

    // Process images
    let resolvedImages = [];
    if (Array.isArray(images)) {
      resolvedImages = images
        .filter((img) => typeof img === "string" && img.trim().length > 0)
        .map((img) => img.trim());
    }

    let primaryImage =
      typeof image === "string" && image.trim().length > 0 ? image.trim() : "";

    if (resolvedImages.length > 3) {
      errors.push("A maximum of 3 images is allowed per product");
    }

    if (resolvedImages.length > 0 && !primaryImage) {
      primaryImage = resolvedImages[0];
    } else if (primaryImage && resolvedImages.length === 0) {
      resolvedImages = [primaryImage];
    }

    if (!primaryImage) {
      errors.push("At least one product image is required");
    }

    // Validate stock
    let resolvedStock = 0;
    if (stock !== undefined && stock !== null && stock !== "") {
      const numStock = Number(stock);
      if (isNaN(numStock)) {
        errors.push("Stock must be a valid number");
      } else if (numStock < 0) {
        errors.push("Stock cannot be negative");
      } else {
        resolvedStock = Math.floor(numStock);
      }
    }

    // Optional discount/original price
    let parsedDiscount = null;
    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice !== ""
    ) {
      const numDiscount = Number(discountPrice);
      if (isNaN(numDiscount) || numDiscount < 0) {
        errors.push("Discount price must be a positive number");
      } else {
        parsedDiscount = numDiscount;
      }
    }

    let parsedOriginal = null;
    if (
      originalPrice !== undefined &&
      originalPrice !== null &&
      originalPrice !== ""
    ) {
      const numOriginal = Number(originalPrice);
      if (isNaN(numOriginal) || numOriginal < 0) {
        errors.push("Original price must be a positive number");
      } else {
        parsedOriginal = numOriginal;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors,
        },
        { status: 400 }
      );
    }

    // 4. Update product
    const updateData = {
      name: name.trim(),
      slug: slugify(name),
      price: Number(price),
      discountPrice: parsedDiscount,
      originalPrice: parsedOriginal,
      description: description.trim(),
      category: category.trim(),
      image: primaryImage,
      images: resolvedImages,
      stock: resolvedStock,
      sku: typeof sku === "string" ? sku.trim() : "",
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: messages,
        },
        { status: 400 }
      );
    }

    console.error("[AK Kiosk API] PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 *
 * Admin-protected endpoint to delete a product.
 */
export async function DELETE(request, { params }) {
  try {
    // 1. Verify administrator authentication
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Administrator session required." },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Product "${deleted.name}" deleted successfully`,
        data: { id: deleted._id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}

