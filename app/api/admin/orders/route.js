import { NextResponse } from "next/server.js";
import connectToDatabase from "../../../../lib/mongodb.js";
import Order from "../../../../models/Order.js";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../lib/auth.js";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders
 *
 * Protected admin endpoint — fetches all orders with optional search and filters.
 */
export async function GET(request) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const orderStatus = searchParams.get("orderStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const paymentMethod = searchParams.get("paymentMethod");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { orderNumber: { $regex: safeSearch, $options: "i" } },
        { "customer.fullName": { $regex: safeSearch, $options: "i" } },
        { "customer.email": { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (orderStatus && ["pending", "confirmed", "delivered", "canceled"].includes(orderStatus)) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus && ["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod && ["manual", "cod", "stripe"].includes(paymentMethod)) {
      query.paymentMethod = paymentMethod;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] GET /api/admin/orders error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve orders" },
      { status: 500 }
    );
  }
}

