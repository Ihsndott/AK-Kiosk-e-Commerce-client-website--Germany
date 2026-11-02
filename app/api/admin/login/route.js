import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import {
  comparePassword,
  createAdminToken,
  ensureInitialAdmin,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await connectToDatabase();
    const seeded = await ensureInitialAdmin();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password, rememberMe = false } = body;

    // Validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email address is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      console.warn("[AK Kiosk Admin Auth] Invalid login attempt: admin user not found");
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save();

    // Create signed session token
    const token = await createAdminToken(
      {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      rememberMe
    );

    // Build response with secure HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Administrator authenticated successfully",
        user: {
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      { status: 200 }
    );

    const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 24 hours

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("[AK Kiosk Admin API] Login error:", error?.name);
    return NextResponse.json(
      { success: false, message: "Authentication service unavailable" },
      { status: 500 }
    );
  }
}

