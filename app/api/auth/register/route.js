import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import {
  hashCustomerPassword,
  createCustomerToken,
  setCustomerCookie,
} from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

// In-memory rate limiting: max 10 registration attempts per IP per 10 minutes
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates password strength:
 * - At least 8 characters
 * - Contains at least one letter and one number
 */
function isStrongPassword(password) {
  if (typeof password !== "string" || password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * POST /api/auth/register
 *
 * Registers a new customer on the AK Kiosk storefront.
 * Hashes passwords with bcryptjs, verifies uniqueness, prevents privilege escalation,
 * and sets an HTTP-only customer session cookie.
 */
export async function POST(request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = (forwarded ? forwarded.split(",")[0] : "unknown").trim();

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many registration attempts. Please try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { name, email, password, confirmPassword } = body || {};

    const errors = {};

    // 1. Name validation
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      errors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
      errors.name = "Name cannot exceed 100 characters.";
    }

    // 2. Email validation
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail) {
      errors.email = "Email address is required.";
    } else if (!isValidEmail(normalizedEmail)) {
      errors.email = "Please enter a valid email address.";
    } else if (normalizedEmail.length > 254) {
      errors.email = "Email address cannot exceed 254 characters.";
    }

    // 3. Password validation
    if (!password || typeof password !== "string") {
      errors.password = "Password is required.";
    } else if (!isStrongPassword(password)) {
      errors.password =
        "Password must be at least 8 characters and include at least one letter and one number.";
    }

    // 4. Confirm password validation
    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors,
        },
        { status: 422 }
      );
    }

    await connectToDatabase();

    // 5. Duplicate email check
    const existingCustomer = await Customer.findOne({
      email: normalizedEmail,
    }).lean();

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email address already exists. Please sign in or use a different email.",
          errors: {
            email: "An account with this email address already exists.",
          },
        },
        { status: 409 }
      );
    }

    // 6. Securely hash password (cost factor 12)
    const hashedPassword = await hashCustomerPassword(password);

    // 7. Create customer record (strictly forced to role: 'customer')
    const customer = await Customer.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer", // Privilege escalation protection
      isActive: true,
    });

    // 8. Generate customer JWT session token
    const token = await createCustomerToken({
      id: customer._id.toString(),
      email: customer.email,
      name: customer.name,
      role: "customer",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Welcome to AK Kiosk!",
        user: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          role: "customer",
        },
      },
      { status: 201 }
    );

    // 9. Attach secure HTTP-only cookie
    setCustomerCookie(response, token, false);

    return response;
  } catch (error) {
    console.error("[AK Kiosk Auth] POST /api/auth/register error:", error?.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create account. Please try again later.",
      },
      { status: 500 }
    );
  }
}

