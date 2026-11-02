import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { getCustomerFromRequest } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 *
 * Returns authenticated customer profile from the verified JWT session.
 * Never returns password hashes.
 */
export async function GET(request) {
  try {
    const payload = await getCustomerFromRequest(request);

    if (!payload || !payload.id) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "No active customer session.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const customer = await Customer.findById(payload.id).select("-password").lean();

    if (!customer || !customer.isActive) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Customer account not found or inactive.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          role: customer.role || "customer",
          phone: customer.phone || "",
          address: customer.address || {},
          createdAt: customer.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk Auth] GET /api/auth/me error:", error?.message);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Failed to retrieve customer session.",
      },
      { status: 500 }
    );
  }
}

