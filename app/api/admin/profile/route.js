import { NextResponse } from "next/server.js";
import connectToDatabase from "../../../../lib/mongodb.js";
import Admin from "../../../../models/Admin.js";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
  comparePassword,
  hashPassword,
  createAdminToken,
} from "../../../../lib/auth.js";

export const dynamic = "force-dynamic";

/**
 * Verify admin session from cookie. Returns payload or null.
 */
async function requireAdmin(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

/**
 * Validates email format.
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates password strength:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 */
function isStrongPassword(password) {
  if (!password || typeof password !== "string") return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * GET /api/admin/profile
 *
 * Protected: Returns the authenticated administrator's profile.
 * Never exposes passwords or sensitive keys.
 */
export async function GET(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in as an administrator." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findById(payload.id).select("-password").lean();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Administrator account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: admin._id.toString(),
          name: admin.name || "Store Administrator",
          email: admin.email,
          role: admin.role || "superadmin",
          lastLogin: admin.lastLogin || null,
          createdAt: admin.createdAt || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Profile GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load administrator profile." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/profile
 *
 * Protected: Allows the administrator to update their name, email, or password.
 * - Changing email or password requires entering the current password for verification.
 * - Enforces strong password rules.
 * - Checks for duplicate email addresses.
 * - Invalidates existing session if email or password changed.
 */
export async function PUT(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in as an administrator." },
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
      name,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    } = body || {};

    await connectToDatabase();
    const admin = await Admin.findById(payload.id);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Administrator account not found." },
        { status: 404 }
      );
    }

    const normalizedNewEmail = email ? email.toLowerCase().trim() : "";
    const isChangingEmail = Boolean(
      normalizedNewEmail && normalizedNewEmail !== admin.email.toLowerCase().trim()
    );
    const isChangingPassword = Boolean(newPassword);
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const isUpdatingName = Boolean(trimmedName && trimmedName !== admin.name);

    if (!isChangingEmail && !isChangingPassword && !isUpdatingName) {
      return NextResponse.json(
        { success: false, message: "No changes detected." },
        { status: 400 }
      );
    }

    // Changing email or password requires current password confirmation
    if (isChangingEmail || isChangingPassword) {
      if (!currentPassword || typeof currentPassword !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is required to update email or password.",
          },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        admin.password
      );
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password." },
          { status: 401 }
        );
      }
    }

    // 1. Process Email Change
    if (isChangingEmail) {
      if (!isValidEmail(normalizedNewEmail)) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      if (normalizedNewEmail.length > 120) {
        return NextResponse.json(
          { success: false, message: "Email address cannot exceed 120 characters." },
          { status: 400 }
        );
      }

      // Check for duplicate admin email
      const existing = await Admin.findOne({
        email: normalizedNewEmail,
        _id: { $ne: admin._id },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: "This email address is already in use by another administrator.",
          },
          { status: 409 }
        );
      }

      admin.email = normalizedNewEmail;
    }

    // 2. Process Name Update
    if (isUpdatingName) {
      if (trimmedName.length < 2 || trimmedName.length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin name must be between 2 and 100 characters.",
          },
          { status: 400 }
        );
      }
      admin.name = trimmedName;
    }

    // 3. Process Password Change
    if (isChangingPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, message: "New password and confirmation do not match." },
          { status: 400 }
        );
      }

      if (!isStrongPassword(newPassword)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New password must be at least 8 characters and include uppercase, lowercase, and a number.",
          },
          { status: 400 }
        );
      }

      const isSameAsCurrent = await comparePassword(newPassword, admin.password);
      if (isSameAsCurrent) {
        return NextResponse.json(
          {
            success: false,
            message: "New password must be different from current password.",
          },
          { status: 400 }
        );
      }

      admin.password = await hashPassword(newPassword);
    }

    await admin.save();

    // 4. Session management
    // If credentials (email or password) were updated, invalidate session and require re-login
    if (isChangingEmail || isChangingPassword) {
      const response = NextResponse.json(
        {
          success: true,
          message:
            "Admin credentials updated successfully. Please log in again with your new credentials.",
          requireRelogin: true,
          user: {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        },
        { status: 200 }
      );

      // Invalidate admin session cookie
      response.cookies.set(ADMIN_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    // If only name was changed, refresh session token with updated name
    const newToken = await createAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin profile name updated successfully.",
        requireRelogin: false,
        user: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set(ADMIN_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("[Admin Profile PUT] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update administrator profile." },
      { status: 500 }
    );
  }
}
