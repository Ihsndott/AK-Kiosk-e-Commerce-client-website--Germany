import { NextResponse } from "next/server.js";
import connectToDatabase from "../../../lib/mongodb.js";
import Product from "../../../models/Product.js";
import Order from "../../../models/Order.js";
import Settings from "../../../models/Settings.js";
import { sendOrderEmails } from "../../../lib/mailer.js";
import { finalizeStripePayment } from "../../../lib/orderFinalizer.js";
import mongoose from "mongoose";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function cleanEnv(val) {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

const DELIVERY_FEE = 3.5;
const FREE_DELIVERY_THRESHOLD = 35;

/**
 * POST /api/orders
 *
 * Creates a new Cash on Delivery (COD) order.
 * Validates all items against live MongoDB stock, recalculates totals server-side,
 * saves the order, and sends notification emails.
 */
export async function POST(request) {
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

    const {
      customer,
      items: rawItems,
      deliveryMethod,
      paymentMethod,
    } = body;

    // 1. Resolve payment method
    // Supports "manual" (Order Now workflow), "order_now", or legacy "cod"
    const resolvedPaymentMethod =
      paymentMethod && ["manual", "order_now", "cod"].includes(paymentMethod)
        ? (paymentMethod === "cod" ? "cod" : "manual")
        : "manual";

    // 2. Validate delivery method
    if (!["delivery", "pickup"].includes(deliveryMethod)) {
      return NextResponse.json(
        { success: false, message: "deliveryMethod must be 'delivery' or 'pickup'" },
        { status: 400 }
      );
    }

    // 3. Validate customer fields
    const customerErrors = validateCustomer(customer, deliveryMethod);
    if (customerErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: customerErrors },
        { status: 400 }
      );
    }

    // 4. Validate items array
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // 5. Resolve each item from MongoDB (server-side price verification)
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

    // 6. Calculate totals server-side using live store settings from MongoDB
    const settings = await Settings.getSingleton();
    const liveDeliveryFee =
      typeof settings?.deliveryFee === "number" ? settings.deliveryFee : DELIVERY_FEE;
    const liveFreeThreshold =
      typeof settings?.freeDeliveryThreshold === "number"
        ? settings.freeDeliveryThreshold
        : FREE_DELIVERY_THRESHOLD;

    const subtotal = parseFloat(
      resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
    );
    const deliveryFee =
      deliveryMethod === "pickup" ? 0 : subtotal >= liveFreeThreshold ? 0 : liveDeliveryFee;
    const total = parseFloat((subtotal + deliveryFee).toFixed(2));

    // 7. Atomic stock deduction with rollback on race condition
    const deductedItems = [];
    let stockRaceFailure = null;

    for (const item of resolvedItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        stockRaceFailure = `Insufficient stock for "${item.name}". Please adjust your order.`;
        break;
      }
      deductedItems.push(item);
    }

    if (stockRaceFailure) {
      // Rollback any successfully deducted items in this batch
      for (const rolledBack of deductedItems) {
        await Product.findByIdAndUpdate(rolledBack.productId, {
          $inc: { stock: rolledBack.quantity },
        });
      }
      return NextResponse.json(
        { success: false, message: stockRaceFailure },
        { status: 409 }
      );
    }

    // 8. Create order
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
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // 9. Send notifications (non-blocking — failures don't cancel order)
    const emailResults = await sendOrderEmails(order);

    // Mark email sent status
    if (emailResults.admin.sent || emailResults.customer.sent) {
      await Order.findByIdAndUpdate(order._id, {
        adminNotificationSent: emailResults.admin.sent,
        customerNotificationSent: emailResults.customer.sent,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        data: {
          orderNumber: order.orderNumber,
          orderId: order._id,
          total: order.total,
          paymentMethod: order.paymentMethod,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: messages },
        { status: 400 }
      );
    }

    console.error("[AK Kiosk API] POST /api/orders error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 *
 * Public route — customers can look up their orders via:
 * 1) Secure Stripe sessionId verification (retrieves and validates payment_status directly from Stripe)
 * 2) Order number + email match (preserves existing lookup)
 */
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sessionId =
      searchParams.get("sessionId")?.trim() || searchParams.get("session_id")?.trim();
    const orderId =
      searchParams.get("orderId")?.trim() || searchParams.get("id")?.trim();
    const orderNumber = searchParams.get("orderNumber")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    let order = null;

    if (sessionId) {
      if (!sessionId.startsWith("cs_")) {
        return NextResponse.json(
          { success: false, message: "Invalid session ID format" },
          { status: 400 }
        );
      }

      const stripeSecretKey = cleanEnv(process.env.STRIPE_SECRET_KEY);
      if (!stripeSecretKey) {
        return NextResponse.json(
          { success: false, message: "Stripe payments are not configured" },
          { status: 503 }
        );
      }

      const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
      let stripeSession;
      try {
        stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      } catch (err) {
        console.error("[AK Kiosk API] Failed to retrieve Stripe session:", err.message);
        return NextResponse.json(
          { success: false, message: "Stripe session not found or invalid" },
          { status: 404 }
        );
      }

      // Security check: Must be verified as 'paid' by Stripe's API
      if (!stripeSession || stripeSession.payment_status !== "paid") {
        return NextResponse.json(
          { success: false, message: "Payment has not been completed for this session" },
          { status: 400 }
        );
      }

      // Atomically finalize order payment, deduct stock exactly once, and dispatch notifications
      const finalResult = await finalizeStripePayment({
        orderId: stripeSession.metadata?.orderId,
        orderNumber: stripeSession.metadata?.orderNumber,
        stripeSessionId: sessionId,
        stripePaymentIntentId: stripeSession.payment_intent || null,
      });

      if (!finalResult.success || !finalResult.order) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      order = finalResult.order;
    } else if (email && (orderNumber || orderId)) {
      const query = { "customer.email": email };
      const hasValidObjectId = orderId && mongoose.Types.ObjectId.isValid(orderId);

      if (orderNumber && hasValidObjectId) {
        query.$or = [{ orderNumber }, { _id: orderId }];
      } else if (orderNumber) {
        query.orderNumber = orderNumber;
      } else if (hasValidObjectId) {
        query._id = orderId;
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid order identifier" },
          { status: 400 }
        );
      }

      order = await Order.findOne(query).lean();

      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Valid sessionId, or orderNumber/orderId and customer email are required" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          deliveryMethod: order.deliveryMethod,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          items: order.items,
          customer: {
            fullName: order.customer?.fullName,
            email: order.customer?.email,
            phone: order.customer?.phone || "",
            address: order.customer?.address || "",
            city: order.customer?.city || "",
            postalCode: order.customer?.postalCode || "",
            country: order.customer?.country || "Germany",
          },
          createdAt: order.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] GET /api/orders error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve order" },
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

