import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product, { slugify } from "@/models/Product";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 *
 * Public endpoint.
 * Returns all products, or filters by category when
 * a `category` query parameter is provided.
 *
 * Examples:
 *   GET /api/products
 *   GET /api/products?category=Snacks
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Build query — only add category filter when the param is present
    const query = {};
    if (category) {
      const cleanCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Case-insensitive match so "snacks", "Snacks", "SNACKS", as well as
      // "groceries" matching "Groceries" or "Asian Groceries" all work
      query.category = { $regex: new RegExp(cleanCategory, "i") };
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        data: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] GET /api/products error:", error?.name);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve products",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 *
 * Admin-protected endpoint.
 * Creates a new product in the database.
 * Requires a valid administrator session token.
 */
export async function POST(request) {
  try {
    // 1. Authenticate administrator session
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Administrator session required to add products.",
        },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired or invalid. Please log in again.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
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

    // Process and validate images
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

    // Optional numeric discount/original price
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

    // 4. Create product in database
    const productData = {
      name: name.trim(),
      slug: slugify(name),
      price: Number(price),
      description: description.trim(),
      category: category.trim(),
      image: primaryImage,
      images: resolvedImages,
      stock: resolvedStock,
      sku: typeof sku === "string" ? sku.trim() : "",
    };

    if (parsedDiscount !== null) {
      productData.discountPrice = parsedDiscount;
    }
    if (parsedOriginal !== null) {
      productData.originalPrice = parsedOriginal;
    }

    const product = await Product.create(productData);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
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

    console.error("[AK Kiosk API] POST /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create product",
      },
      { status: 500 }
    );
  }
}
