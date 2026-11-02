import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCustomerFromRequest } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/orders
 *
 * Protected customer endpoint.
 * Returns orders placed by the currently authenticated customer.
 * Strict server-side scoping ensures customers cannot access another user's orders.
 */
export async function GET(request) {
  try {
    const customer = await getCustomerFromRequest(request);

    if (!customer || !customer.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to view order history.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = customer.email.trim().toLowerCase();

    // Query strictly matching authenticated customer's email
    const orders = await Order.find({ "customer.email": normalizedEmail })
      .sort({ createdAt: -1 })
      .select(
        "orderNumber items subtotal deliveryFee total deliveryMethod paymentMethod paymentStatus orderStatus createdAt"
      )
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: orders,
        count: orders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] GET /api/account/orders error:", error?.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve order history.",
      },
      { status: 500 }
    );
  }
}

