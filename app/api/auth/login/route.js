import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import {
  compareCustomerPassword,
  createCustomerToken,
  setCustomerCookie,
} from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

// In-memory rate limiting: max 10 login attempts per IP per 10 minutes
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

/**
 * POST /api/auth/login
 *
 * Authenticates a customer by email and password.
 * Uses generic error messages to prevent account enumeration.
 * Sets a secure HTTP-only cookie on success.
 */
export async function POST(request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = (forwarded ? forwarded.split(",")[0] : "unknown").trim();

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again in a few minutes.",
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

    const { email, password, rememberMe = false } = body || {};

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Email address and password are required.",
        },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const customer = await Customer.findOne({ email: normalizedEmail });

    // Generic error message prevents username/email enumeration
    const genericAuthError = {
      success: false,
      message: "Invalid email address or password.",
    };

    if (!customer) {
      return NextResponse.json(genericAuthError, { status: 401 });
    }

    if (!customer.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "This account has been deactivated. Please contact customer support.",
        },
        { status: 403 }
      );
    }

    const isMatch = await compareCustomerPassword(password, customer.password);
    if (!isMatch) {
      return NextResponse.json(genericAuthError, { status: 401 });
    }

    // Generate signed customer JWT session token
    const token = await createCustomerToken(
      {
        id: customer._id.toString(),
        email: customer.email,
        name: customer.name,
        role: "customer",
      },
      Boolean(rememberMe)
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Signed in successfully.",
        user: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          role: "customer",
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    setCustomerCookie(response, token, Boolean(rememberMe));

    return response;
  } catch (error) {
    console.error("[AK Kiosk Auth] POST /api/auth/login error:", error?.message);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication service currently unavailable.",
      },
      { status: 500 }
    );
  }
}

