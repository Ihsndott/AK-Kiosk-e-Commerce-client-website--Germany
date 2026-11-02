import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No active session" },
      { status: 401 }
    );
  }

  const payload = await verifyAdminToken(token);

  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired session" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    const admin = await Admin.findById(payload.id).select("-password").lean();
    if (admin) {
      return NextResponse.json(
        {
          success: true,
          user: {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role,
            lastLogin: admin.lastLogin || null,
          },
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("[Admin Me GET] Error:", err);
  }

  // Fallback to verified JWT payload
  return NextResponse.json(
    {
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    },
    { status: 200 }
  );
}

