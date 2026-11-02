import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Default starter categories if none exist in the database yet
const DEFAULT_CATEGORIES = [
  { name: "Asian Groceries", slug: "groceries" },
  { name: "Snacks & Sweets", slug: "snacks" },
  { name: "Drinks & Teas", slug: "drinks" },
  { name: "Instant Ramen & Noodles", slug: "groceries" },
];

/**
 * GET /api/categories
 *
 * Retrieves all categories. Combines registered categories from the
 * Category collection with any unique categories found in the Product collection.
 */
export async function GET() {
  try {
    await connectToDatabase();

    // Auto-seed default categories if empty
    const count = await Category.countDocuments();
    if (count === 0) {
      for (const item of DEFAULT_CATEGORIES) {
        await Category.create({
          name: item.name,
          slug: item.slug,
        }).catch(() => {}); // Ignore duplicate race
      }
    }

    const registered = await Category.find().sort({ name: 1 }).lean();

    // Also collect distinct categories from existing products
    const productCategories = await Product.distinct("category");

    // Merge and deduplicate case-insensitively
    const seen = new Map();

    registered.forEach((cat) => {
      seen.set(cat.name.trim().toLowerCase(), cat);
    });

    productCategories.forEach((catName) => {
      if (catName && typeof catName === "string") {
        const key = catName.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, {
            name: catName.trim(),
            slug: catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            isFromProducts: true,
          });
        }
      }
    });

    const categories = Array.from(seen.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] GET /api/categories error:", error?.name);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 *
 * Admin-protected endpoint to add a new category.
 * Prevents duplicates case-insensitively.
 */
export async function POST(request) {
  try {
    // 1. Verify admin session
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

    await connectToDatabase();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { name, description = "" } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Case-insensitive duplicate check
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Category "${trimmedName}" already exists`,
          data: existing,
        },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name: trimmedName,
      slug,
      description: typeof description === "string" ? description.trim() : "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }

    console.error("[AK Kiosk API] POST /api/categories error:", error?.name);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}

