import { NextResponse } from "next/server.js";
import connectToDatabase from "../../../../lib/mongodb.js";
import Settings, { DEFAULT_BUSINESS_HOURS, DEFAULT_DELIVERY_AREAS } from "../../../../models/Settings.js";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../lib/auth.js";

export const dynamic = "force-dynamic";

/**
 * Verify admin session from cookie. Returns payload or null.
 */
async function requireAdmin(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * GET /api/admin/settings
 *
 * Protected: Retrieves store configuration.
 */
export async function GET(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const settings = await Settings.getSingleton();

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Settings GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve store settings." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 *
 * Protected: Updates store configuration. Validates all inputs server-side.
 */
export async function PUT(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const {
      storeName,
      storeAddress,
      contactEmail,
      phone,
      businessHours,
      deliveryFee,
      freeDeliveryThreshold,
      deliveryAreas,
      taxPercentage,
      taxInclusive,
      codEnabled,
      stripeEnabled,
      orderNotifications,
      inquiryNotifications,
      notificationEmail,
    } = body || {};

    // 1. Validate Store Information
    if (!storeName || typeof storeName !== "string" || !storeName.trim()) {
      return NextResponse.json(
        { success: false, message: "Store name is required." },
        { status: 400 }
      );
    }
    if (!storeAddress || typeof storeAddress !== "string" || !storeAddress.trim()) {
      return NextResponse.json(
        { success: false, message: "Store address is required." },
        { status: 400 }
      );
    }
    if (!isValidEmail(contactEmail)) {
      return NextResponse.json(
        { success: false, message: "A valid contact email is required." },
        { status: 400 }
      );
    }
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: "Store phone number is required." },
        { status: 400 }
      );
    }

    // 2. Validate Business Hours
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    let sanitizedHours = DEFAULT_BUSINESS_HOURS;
    if (Array.isArray(businessHours) && businessHours.length > 0) {
      for (const item of businessHours) {
        if (!validDays.includes(item.day)) {
          return NextResponse.json(
            { success: false, message: `Invalid day in business hours: ${item.day}` },
            { status: 400 }
          );
        }
      }
      sanitizedHours = businessHours.map((h) => ({
        day: h.day,
        open: typeof h.open === "string" ? h.open.trim() : "09:00",
        close: typeof h.close === "string" ? h.close.trim() : "22:00",
        isClosed: Boolean(h.isClosed),
      }));
    }

    // 3. Validate Delivery Settings
    const parsedDeliveryFee = parseFloat(deliveryFee);
    if (isNaN(parsedDeliveryFee) || parsedDeliveryFee < 0) {
      return NextResponse.json(
        { success: false, message: "Delivery fee must be a non-negative number." },
        { status: 400 }
      );
    }

    const parsedThreshold = parseFloat(freeDeliveryThreshold);
    if (isNaN(parsedThreshold) || parsedThreshold < 0) {
      return NextResponse.json(
        { success: false, message: "Free delivery threshold must be a non-negative number." },
        { status: 400 }
      );
    }

    let sanitizedAreas = DEFAULT_DELIVERY_AREAS;
    if (Array.isArray(deliveryAreas)) {
      sanitizedAreas = deliveryAreas
        .map((a) => (typeof a === "string" ? a.trim() : ""))
        .filter(Boolean);
      if (sanitizedAreas.length === 0) {
        sanitizedAreas = DEFAULT_DELIVERY_AREAS;
      }
    }

    // 4. Validate Tax Settings
    const parsedTax = parseFloat(taxPercentage);
    if (isNaN(parsedTax) || parsedTax < 0 || parsedTax > 100) {
      return NextResponse.json(
        { success: false, message: "Tax percentage must be between 0 and 100." },
        { status: 400 }
      );
    }

    // 5. Validate Notification Settings
    if (notificationEmail && !isValidEmail(notificationEmail)) {
      return NextResponse.json(
        { success: false, message: "Notification email format is invalid." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const settings = await Settings.getSingleton();

    settings.storeName = storeName.trim();
    settings.storeAddress = storeAddress.trim();
    settings.contactEmail = contactEmail.trim().toLowerCase();
    settings.phone = phone.trim();
    settings.businessHours = sanitizedHours;
    settings.deliveryFee = parsedDeliveryFee;
    settings.freeDeliveryThreshold = parsedThreshold;
    settings.deliveryAreas = sanitizedAreas;
    settings.taxPercentage = parsedTax;
    settings.taxInclusive = Boolean(taxInclusive);
    settings.codEnabled = false; // Deactivated while manual Order Now workflow is active
    settings.stripeEnabled = false; // Deactivated while manual Order Now workflow is active
    settings.orderNotifications = Boolean(orderNotifications);
    settings.inquiryNotifications = Boolean(inquiryNotifications);
    if (notificationEmail) {
      settings.notificationEmail = notificationEmail.trim().toLowerCase();
    }

    await settings.save();

    return NextResponse.json(
      {
        success: true,
        message: "Store settings saved successfully.",
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Settings PUT] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update store settings." },
      { status: 500 }
    );
  }
}
