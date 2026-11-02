import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";

export const dynamic = "force-dynamic";

// Simple in-memory rate limit: max 10 attempts per IP per 10 minutes
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
 * POST /api/subscribers
 *
 * Public endpoint — subscribes an email address to the newsletter.
 * Prevents duplicate subscriptions (returns 200 for existing subscribers
 * to avoid email enumeration).
 */
export async function POST(request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = (forwarded ? forwarded.split(",")[0] : "unknown").trim();

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
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

    const email = (body?.email || "").trim().toLowerCase().slice(0, 254);

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 422 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 422 }
      );
    }

    await connectToDatabase();

    // Upsert — if email already exists, reactivate if previously unsubscribed
    const existing = await Subscriber.findOne({ email });

    if (existing) {
      if (existing.isActive) {
        // Already subscribed — return success without revealing whether email was in DB
        return NextResponse.json(
          {
            success: true,
            message: "You're already on our list! We'll keep you posted on new drops.",
          },
          { status: 200 }
        );
      }
      // Re-subscribe
      existing.isActive = true;
      await existing.save();
      return NextResponse.json(
        {
          success: true,
          message: "Welcome back! You've been re-subscribed to AK Kiosk updates.",
        },
        { status: 200 }
      );
    }

    await Subscriber.create({ email, source: "footer" });

    return NextResponse.json(
      {
        success: true,
        message: "You're subscribed! Expect weekly drops, new arrivals, and exclusive offers.",
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate key race condition (concurrent requests)
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: true,
          message: "You're already subscribed to AK Kiosk updates.",
        },
        { status: 200 }
      );
    }

    console.error("[AK Kiosk API] POST /api/subscribers error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

