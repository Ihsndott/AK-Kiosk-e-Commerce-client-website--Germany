import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { sendInquiryNotification } from "@/lib/mailer";

export const dynamic = "force-dynamic";

// Simple in-memory rate limit: max 5 submissions per IP per 10 minutes
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

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

function cleanStr(val, maxLen = 500) {
  if (!val || typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/inquiries
 *
 * Public endpoint — accepts a customer contact form submission.
 * Validates fields, saves to MongoDB, sends admin notification email.
 */
export async function POST(request) {
  try {
    // Rate limiting by IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = (forwarded ? forwarded.split(",")[0] : "unknown").trim();

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many submissions. Please wait a few minutes before trying again.",
        },
        { status: 429 }
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

    // Sanitize and validate fields
    const name = cleanStr(body?.name, 120);
    const email = cleanStr(body?.email, 254).toLowerCase();
    const subject = cleanStr(body?.subject, 200);
    const message = cleanStr(body?.message, 5000);

    const errors = {};

    if (!name) errors.name = "Name is required.";
    if (!email) {
      errors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!subject) errors.subject = "Subject is required.";
    if (!message || message.length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed.", errors },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const inquiry = await Inquiry.create({
      name,
      email,
      subject,
      message,
      ipAddress: ip,
    });

    // Send admin notification — non-blocking, failure does not affect response
    sendInquiryNotification(inquiry).catch((err) => {
      console.error("[AK Kiosk] Inquiry admin notification failed:", err?.message);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We will get back to you within 24 hours.",
        data: { id: inquiry._id.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] POST /api/inquiries error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}

