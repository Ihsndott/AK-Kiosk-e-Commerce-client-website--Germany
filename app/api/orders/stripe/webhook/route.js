import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendOrderEmails } from "@/lib/mailer";
import { finalizeStripePayment } from "@/lib/orderFinalizer";

// Must NOT parse the body — Stripe needs the raw payload for signature verification
export const dynamic = "force-dynamic";

/**
 * Sanitizes an environment variable value by trimming whitespace
 * and stripping redundant surrounding double or single quotes.
 */
function cleanEnv(val) {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

export async function POST(request) {
  const stripeSecretKey = cleanEnv(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = cleanEnv(process.env.STRIPE_WEBHOOK_SECRET);

  if (!stripeSecretKey || !webhookSecret || stripeSecretKey.startsWith("sk_test_your_")) {
    console.error("[AK Kiosk Webhook] Stripe or webhook secret not configured");
    return NextResponse.json({ received: false }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  // Read raw body as text for signature verification
  let rawBody;
  try {
    rawBody = await request.text();
  } catch (err) {
    console.error("[AK Kiosk Webhook] Failed to read request body:", err.message);
    return NextResponse.json({ received: false }, { status: 400 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { received: false, message: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[AK Kiosk Webhook] Signature verification failed:", err.message);
    return NextResponse.json(
      { received: false, message: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle events — always return 200 to Stripe, even on processing errors
  try {
    await connectToDatabase();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { orderId, orderNumber } = session.metadata || {};

      if (!orderId && !orderNumber) {
        console.error("[AK Kiosk Webhook] No orderId or orderNumber in session metadata", session.id);
        return NextResponse.json({ received: true });
      }

      // Security check: Session must indicate paid status
      if (session.payment_status && session.payment_status !== "paid") {
        console.warn("[AK Kiosk Webhook] Session not paid:", session.id, session.payment_status);
        return NextResponse.json({ received: true });
      }

      // Atomically finalize payment, deduct stock exactly once, and dispatch notifications
      const result = await finalizeStripePayment({
        orderId,
        orderNumber,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent || null,
      });

      if (!result.success) {
        if (result.notFound) {
          console.error("[AK Kiosk Webhook] Order not found:", orderId || orderNumber);
          return NextResponse.json({ received: true });
        }
        console.error("[AK Kiosk Webhook] Payment finalization transaction failed:", result.error);
        return NextResponse.json(
          { received: false, error: result.error || "Payment finalization failed" },
          { status: 500 }
        );
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const { orderId } = session.metadata || {};
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "failed",
          orderStatus: "canceled",
        });
      }
    }
    // All other event types are silently ignored
  } catch (err) {
    // Log processing errors but still return 200 to Stripe
    console.error("[AK Kiosk Webhook] Processing error:", err.message || err);
  }

  return NextResponse.json({ received: true });
}

