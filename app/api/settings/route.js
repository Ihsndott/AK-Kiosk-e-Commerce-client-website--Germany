import { NextResponse } from "next/server.js";
import connectToDatabase from "../../../lib/mongodb.js";
import Settings from "../../../models/Settings.js";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings
 *
 * Public endpoint to retrieve store settings (delivery fees, thresholds, hours, etc.)
 * Excludes admin-specific and sensitive internal data.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.getSingleton();

    return NextResponse.json(
      {
        success: true,
        data: {
          storeName: settings.storeName,
          storeAddress: settings.storeAddress,
          contactEmail: settings.contactEmail,
          phone: settings.phone,
          businessHours: settings.businessHours,
          deliveryFee: typeof settings.deliveryFee === "number" ? settings.deliveryFee : 3.5,
          freeDeliveryThreshold:
            typeof settings.freeDeliveryThreshold === "number"
              ? settings.freeDeliveryThreshold
              : 35.0,
          deliveryAreas: settings.deliveryAreas,
          taxPercentage: settings.taxPercentage,
          taxInclusive: settings.taxInclusive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk Settings API] GET error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load store settings",
        data: {
          deliveryFee: 3.5,
          freeDeliveryThreshold: 35.0,
        },
      },
      { status: 500 }
    );
  }
}

