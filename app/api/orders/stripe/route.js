import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const DELIVERY_FEE = 3.5;
const FREE_DELIVERY_THRESHOLD = 35;

/**
 * Sanitizes an environment variable value by trimming whitespace
 * and stripping redundant surrounding double or single quotes.
 */
function cleanEnv(val) {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

/**
 * Safely resolves the application base URL for redirects.
 * - In production: uses canonical NEXT_PUBLIC_BASE_URL.
 * - In development: inspects Origin / Host header, validating that it matches localhost / 127.0.0.1
 *   or the canonical URL, avoiding outdated port mismatches without trusting arbitrary hosts.
 */
function resolveBaseUrl(request) {
  const canonical = cleanEnv(process.env.NEXT_PUBLIC_BASE_URL).replace(/\/+$/, "");
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && canonical) {
    return canonical;
  }

  // Attempt to resolve dynamic origin from request headers in local development
  const originHeader = request.headers.get("origin");
  const hostHeader = request.headers.get("host");

  let candidate = null;
  if (originHeader) {
    candidate = originHeader;
  } else if (hostHeader) {
    const proto = request.headers.get("x-forwarded-proto") || "http";
    candidate = `${proto}://${hostHeader}`;
  }

  if (candidate) {
    try {
      const parsed = new URL(candidate);
      const isLoopback =
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1";

      const matchesCanonical = canonical && parsed.origin === new URL(canonical).origin;

      if (isLoopback || matchesCanonical) {
        return parsed.origin;
      }
    } catch {
      // Invalid URL syntax, ignore candidate
    }
  }

  return canonical || "http://localhost:3000";
}

/**
 * POST /api/orders/stripe
 *
 * Creates a Stripe Checkout Session for online payment.
 * Validates items against live MongoDB stock (server-side pricing).
 * Creates a PENDING order; stock is only deducted after webhook confirms payment.
 */
export async function POST(request) {
  const stripeSecretKey = cleanEnv(process.env.STRIPE_SECRET_KEY);
  if (!stripeSecretKey || stripeSecretKey.startsWith("sk_test_your_")) {
    return NextResponse.json(
      { success: false, message: "Online payments are not configured. Please use Cash on Delivery." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  try {
    await connectToDatabase();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { customer, items: rawItems, deliveryMethod } = body;

    // Validate delivery method
    if (!["delivery", "pickup"].includes(deliveryMethod)) {
      return NextResponse.json(
        { success: false, message: "deliveryMethod must be 'delivery' or 'pickup'" },
        { status: 400 }
      );
    }

    // Validate customer fields
    const customerErrors = validateCustomer(customer, deliveryMethod);
    if (customerErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: customerErrors },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Resolve each item from MongoDB (server-side price verification)
    const resolvedItems = [];
    const stockErrors = [];

    for (const rawItem of rawItems) {
      if (!rawItem.productId || !mongoose.Types.ObjectId.isValid(rawItem.productId)) {
        stockErrors.push(`Invalid product ID: ${rawItem.productId}`);
        continue;
      }
      const qty = parseInt(rawItem.quantity, 10);
      if (!qty || qty < 1) {
        stockErrors.push(`Invalid quantity for product ${rawItem.productId}`);
        continue;
      }

      const product = await Product.findById(rawItem.productId).lean();
      if (!product) {
        stockErrors.push(`Product not found: ${rawItem.productId}`);
        continue;
      }
      if (product.stock < qty) {
        stockErrors.push(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}`
        );
        continue;
      }

      resolvedItems.push({
        productId: product._id,
        name: product.name,
        category: product.category || "",
        image: product.image || "",
        sku: product.sku || "",
        priceAtOrder: product.price,
        quantity: qty,
        lineTotal: parseFloat((product.price * qty).toFixed(2)),
      });
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Stock validation failed", errors: stockErrors },
        { status: 409 }
      );
    }

    if (resolvedItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid items to order" },
        { status: 400 }
      );
    }

    // Calculate totals server-side
    const subtotal = parseFloat(
      resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
    );
    const deliveryFee =
      deliveryMethod === "pickup" ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = parseFloat((subtotal + deliveryFee).toFixed(2));

    // Create a PENDING order (stock NOT deducted yet — happens in webhook)
    const order = await Order.create({
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone?.trim() || "",
        address: customer.address?.trim() || "",
        city: customer.city?.trim() || "",
        postalCode: customer.postalCode?.trim() || "",
        country: customer.country?.trim() || "Germany",
      },
      items: resolvedItems,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // Build Stripe line_items from server-side prices (amounts in cents)
    const lineItems = resolvedItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.priceAtOrder * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery fee as a separate line item if applicable
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Delivery Fee (Oberhausen)" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const baseUrl = resolveBaseUrl(request);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customer.email.trim().toLowerCase(),
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
      success_url: `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&orderNumber=${order.orderNumber}&email=${encodeURIComponent(customer.email.trim().toLowerCase())}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
    });

    // Attach Stripe session ID to the order
    await Order.findByIdAndUpdate(order._id, { stripeSessionId: session.id });

    return NextResponse.json(
      {
        success: true,
        data: {
          checkoutUrl: session.url,
          orderNumber: order.orderNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.type === "StripeInvalidRequestError") {
      console.error("[AK Kiosk API] Stripe error:", error.message);
      return NextResponse.json(
        { success: false, message: "Payment provider error. Please try again." },
        { status: 502 }
      );
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: messages },
        { status: 400 }
      );
    }

    console.error("[AK Kiosk API] POST /api/orders/stripe error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPER
// ────────────────────────────────────────────────────────────────────────────

function validateCustomer(customer, deliveryMethod) {
  const errors = [];
  if (!customer) {
    return ["Customer information is required"];
  }

  if (!customer.fullName?.trim()) errors.push("Full name is required");
  if (!customer.email?.trim()) {
    errors.push("Email address is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.push("Email address is invalid");
  }

  if (deliveryMethod === "delivery") {
    if (!customer.address?.trim()) errors.push("Delivery address is required");
    if (!customer.city?.trim()) errors.push("City is required");
    if (!customer.postalCode?.trim()) errors.push("Postal code is required");
  }

  return errors;
}

