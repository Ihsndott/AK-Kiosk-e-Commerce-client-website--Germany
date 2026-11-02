import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Verify admin session from cookie. Returns payload or null. */
async function requireAdmin(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

/**
 * GET /api/admin/inquiries
 *
 * Protected — returns paginated inquiry list with optional search and status filter.
 */
export async function GET(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { subject: { $regex: safe, $options: "i" } },
      ];
    }

    const validStatuses = ["new", "in_progress", "resolved"];
    if (status && validStatuses.includes(status)) {
      query.status = status;
    }

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Inquiry.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: inquiries,
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
    console.error("[AK Kiosk API] GET /api/admin/inquiries error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve inquiries." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/inquiries
 *
 * Protected — updates the status (and optionally adminNotes) of an inquiry.
 * Body: { id, status, adminNotes? }
 */
export async function PATCH(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const { id, status, adminNotes } = body || {};

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Inquiry ID is required." },
        { status: 422 }
      );
    }

    const validStatuses = ["new", "in_progress", "resolved"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value." },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const updates = {};
    if (status) updates.status = status;
    if (typeof adminNotes === "string") {
      updates.adminNotes = adminNotes.trim().slice(0, 2000);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update." },
        { status: 422 }
      );
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: inquiry },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] PATCH /api/admin/inquiries error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to update inquiry." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/inquiries?id=<inquiryId>
 *
 * Protected — permanently deletes an inquiry.
 */
export async function DELETE(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Inquiry ID is required." },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const inquiry = await Inquiry.findByIdAndDelete(id);

    if (!inquiry) {
      return NextResponse.json(
        { success: false, message: "Inquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Inquiry deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] DELETE /api/admin/inquiries error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to delete inquiry." },
      { status: 500 }
    );
  }
}

