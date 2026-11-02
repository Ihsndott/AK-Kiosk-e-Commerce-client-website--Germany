import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Verify admin authentication
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
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Run all stats queries in parallel
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber customer.fullName total orderStatus paymentMethod createdAt")
        .lean(),
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? parseFloat(revenueResult[0].total.toFixed(2))
        : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue,
          recentOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk Admin API] Stats error:", error?.name);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve statistics" },
      { status: 500 }
    );
  }
}

