import { NextResponse } from "next/server.js";
import connectToDatabase from "../../../../../lib/mongodb.js";
import Order from "../../../../../models/Order.js";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/auth.js";

export const dynamic = "force-dynamic";

const VALID_ORDER_STATUSES = ["pending", "confirmed", "delivered", "canceled"];
const VALID_PAYMENT_STATUSES = ["pending", "paid"];

/**
 * GET /api/admin/orders/[id]
 *
 * Admin-protected. Returns full details for a single order by MongoDB _id.
 */
export async function GET(request, { params }) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const order = await Order.findById(params.id).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    console.error("[AK Kiosk Admin API] GET /api/admin/orders/[id] error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 *
 * Admin-protected. Updates orderStatus and/or paymentStatus of an order.
 * Allowed order statuses: pending | confirmed | delivered | canceled
 * Allowed payment statuses: pending | paid
 * Does not trigger emails or duplicate stock deductions.
 */
export async function PATCH(request, { params }) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }

    const { orderStatus, paymentStatus } = body || {};

    if (!orderStatus && !paymentStatus) {
      return NextResponse.json(
        { success: false, message: "Either orderStatus or paymentStatus is required" },
        { status: 400 }
      );
    }

    const updateFields = {};

    if (orderStatus) {
      if (!VALID_ORDER_STATUSES.includes(orderStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid orderStatus. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateFields.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid paymentStatus. Must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateFields.paymentStatus = paymentStatus;
      if (paymentStatus === "paid") {
        updateFields.paidAt = new Date();
      }
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { $set: updateFields },
      { returnDocument: "after", lean: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Order updated successfully", data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk Admin API] PATCH /api/admin/orders/[id] error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}

