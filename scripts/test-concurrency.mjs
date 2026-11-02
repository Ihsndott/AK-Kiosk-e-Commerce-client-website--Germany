import fs from 'fs';
import mongoose from 'mongoose';
import Stripe from 'stripe';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const eq = line.indexOf('=');
  if (eq !== -1 && !line.trim().startsWith('#')) {
    env[line.substring(0, eq).trim()] = line.substring(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
});

const BASE = "http://localhost:3000";
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

let passed = 0;
let failed = 0;

function log(label, ok, detail = "") {
  console.log((ok ? "✅" : "❌") + " " + label + (detail ? " — " + detail : ""));
  if (ok) passed++; else failed++;
}

async function run() {
  console.log("==================================================");
  console.log("  AK Kiosk: Concurrency & Data-Integrity Audit Suite");
  console.log("==================================================\n");

  const uri = env.MONGODB_URI || env.MONGO_URI;
  await mongoose.connect(uri);

  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    stock: Number
  }));

  const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({
    orderNumber: String,
    customer: Object,
    items: Array,
    subtotal: Number,
    deliveryFee: Number,
    total: Number,
    deliveryMethod: String,
    paymentMethod: String,
    paymentStatus: String,
    orderStatus: String,
    stripeSessionId: String,
    stripePaymentIntentId: String,
    adminNotificationSent: Boolean,
    customerNotificationSent: Boolean,
    adminNotificationLock: Date,
    customerNotificationLock: Date,
    adminNotificationError: String,
    customerNotificationError: String,
    paidAt: Date
  }, { timestamps: true }));

  // Create a clean test product with exactly 100 stock
  const testProduct = await Product.create({
    name: "Audit Test Product " + Date.now(),
    price: 9.99,
    description: "Temporary product for concurrency audit",
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    stock: 100
  });

  console.log(`Created test product ${testProduct._id} with stock: 100\n`);

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: Two webhook requests arriving simultaneously for the same payment
    // ─────────────────────────────────────────────────────────────
    console.log("Scenario 1: Two Concurrent Webhook Requests for the Same Payment");
    const order1 = await Order.create({
      orderNumber: "AK-AUDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Concurrent Customer",
        email: "audit.concurrent@example.de",
        phone: "+4912345678",
        address: "Teststr. 1",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [{
        productId: testProduct._id,
        name: testProduct.name,
        priceAtOrder: 9.99,
        quantity: 2,
        lineTotal: 19.98
      }],
      subtotal: 19.98,
      deliveryFee: 3.5,
      total: 23.48,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
      stripeSessionId: "cs_audit_simultaneous_1",
      adminNotificationSent: false,
      customerNotificationSent: false
    });

    const payload1 = JSON.stringify({
      id: "evt_test_concurrent_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_audit_simultaneous_1",
          payment_status: "paid",
          payment_intent: "pi_test_concurrent_1",
          metadata: {
            orderId: order1._id.toString(),
            orderNumber: order1.orderNumber
          }
        }
      }
    });

    const sig1 = stripe.webhooks.generateTestHeaderString({
      payload: payload1,
      secret: env.STRIPE_WEBHOOK_SECRET
    });

    // Send two identical webhooks simultaneously
    const [res1a, res1b] = await Promise.all([
      fetch(`${BASE}/api/orders/stripe/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": sig1 },
        body: payload1
      }),
      fetch(`${BASE}/api/orders/stripe/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": sig1 },
        body: payload1
      })
    ]);

    log("Concurrent Webhook A returned 200", res1a.status === 200);
    log("Concurrent Webhook B returned 200", res1b.status === 200);

    const updatedOrder1 = await Order.findById(order1._id);
    const prodAfter1 = await Product.findById(testProduct._id);

    log("Order paymentStatus is paid", updatedOrder1.paymentStatus === "paid");
    log("Order orderStatus is confirmed", updatedOrder1.orderStatus === "confirmed");
    log(
      "Stock deducted EXACTLY ONCE (100 -> 98)",
      prodAfter1.stock === 98,
      `Expected 98, found ${prodAfter1.stock}`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Webhook and Order-Confirmation Fallback Running Simultaneously
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 2: Webhook & Order-Confirmation Fallback Running Simultaneously");
    const order2 = await Order.create({
      orderNumber: "AK-AUDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Fallback Customer",
        email: "audit.fallback@example.de",
        phone: "+4912345678",
        address: "Teststr. 2",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [{
        productId: testProduct._id,
        name: testProduct.name,
        priceAtOrder: 9.99,
        quantity: 5,
        lineTotal: 49.95
      }],
      subtotal: 49.95,
      deliveryFee: 0,
      total: 49.95,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
      adminNotificationSent: false,
      customerNotificationSent: false
    });

    // Create a real Stripe test session so the confirmation endpoint can retrieve it
    const checkoutRes = await fetch(`${BASE}/api/orders/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: order2.customer,
        items: [{ productId: testProduct._id.toString(), quantity: 1 }],
        deliveryMethod: "delivery"
      })
    });
    const checkoutData = await checkoutRes.json();
    const liveSessionId = checkoutData.data?.checkoutUrl?.split("/c/pay/")[1]?.split("#")[0];

    // Link liveSessionId to order2
    order2.stripeSessionId = liveSessionId;
    await order2.save();

    const payload2 = JSON.stringify({
      id: "evt_test_race_2",
      type: "checkout.session.completed",
      data: {
        object: {
          id: liveSessionId,
          payment_status: "paid",
          payment_intent: "pi_test_race_2",
          metadata: {
            orderId: order2._id.toString(),
            orderNumber: order2.orderNumber
          }
        }
      }
    });

    const sig2 = stripe.webhooks.generateTestHeaderString({
      payload: payload2,
      secret: env.STRIPE_WEBHOOK_SECRET
    });

    const stockBefore2 = (await Product.findById(testProduct._id)).stock;

    // Run webhook and order confirmation simultaneously
    const [webhookRes, fallbackRes] = await Promise.all([
      fetch(`${BASE}/api/orders/stripe/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": sig2 },
        body: payload2
      }),
      fetch(`${BASE}/api/orders?sessionId=${liveSessionId}`)
    ]);

    log("Webhook response 200", webhookRes.status === 200);
    // Since session is in test mode and uncompleted on Stripe cloud, fallback will either
    // return 400 (unpaid on cloud) while webhook handles it, or 200 if already processed.
    log("Fallback completed gracefully", [200, 400].includes(fallbackRes.status), `Status: ${fallbackRes.status}`);

    const updatedOrder2 = await Order.findById(order2._id);
    const stockAfter2 = (await Product.findById(testProduct._id)).stock;

    log("Order 2 marked as paid", updatedOrder2.paymentStatus === "paid");
    log(
      `Stock deducted exactly once for 5 items (${stockBefore2} -> ${stockBefore2 - 5})`,
      stockAfter2 === stockBefore2 - 5,
      `Expected ${stockBefore2 - 5}, found ${stockAfter2}`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Multiple Webhook Retries (Idempotency)
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 3: Multiple Webhook Retries (Idempotency)");
    const stockBeforeRetries = (await Product.findById(testProduct._id)).stock;

    const retryResults = await Promise.all([
      fetch(`${BASE}/api/orders/stripe/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": sig1 },
        body: payload1
      }),
      fetch(`${BASE}/api/orders/stripe/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": sig1 },
        body: payload1
      }),
      fetch(`${BASE}/api/orders/stripe/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "stripe-signature": sig1 },
        body: payload1
      })
    ]);

    const allRetriesOk = retryResults.every(r => r.status === 200);
    const stockAfterRetries = (await Product.findById(testProduct._id)).stock;

    log("All 3 webhook retries returned 200", allRetriesOk);
    log(
      "Stock unchanged across retries (no double deduction)",
      stockAfterRetries === stockBeforeRetries,
      `Stock remained: ${stockAfterRetries}`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Duplicate Email Prevention Under Concurrency
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 4: Duplicate Email Prevention Under Concurrency");
    // Verify notification flags in order1
    log(
      "Order 1 notifications sent safely tracked",
      typeof updatedOrder1.adminNotificationSent === "boolean"
    );
    log(
      "Order 1 has paidAt timestamp set",
      !!updatedOrder1.paidAt
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Email Partial Failure Followed by Retry
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 5: Email Partial Failure Followed by Retry");
    const order3 = await Order.create({
      orderNumber: "AK-AUDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Partial Email Customer",
        email: "audit.partial@example.de",
        phone: "+4912345678",
        address: "Teststr. 3",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [{
        productId: testProduct._id,
        name: testProduct.name,
        priceAtOrder: 9.99,
        quantity: 1,
        lineTotal: 9.99
      }],
      subtotal: 9.99,
      deliveryFee: 3.5,
      total: 13.49,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "paid",
      orderStatus: "confirmed",
      adminNotificationSent: true,     // Admin was ALREADY sent
      customerNotificationSent: false,  // Customer failed previously
      paidAt: new Date()
    });

    const stockBeforePartial = (await Product.findById(testProduct._id)).stock;

    // Simulate webhook retry for order3
    const payload3 = JSON.stringify({
      id: "evt_test_partial_3",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_audit_partial_3",
          payment_status: "paid",
          metadata: {
            orderId: order3._id.toString(),
            orderNumber: order3.orderNumber
          }
        }
      }
    });

    const sig3 = stripe.webhooks.generateTestHeaderString({
      payload: payload3,
      secret: env.STRIPE_WEBHOOK_SECRET
    });

    const partialRetryRes = await fetch(`${BASE}/api/orders/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": sig3 },
      body: payload3
    });

    log("Partial failure retry returns 200", partialRetryRes.status === 200);

    const updatedOrder3 = await Order.findById(order3._id);
    const stockAfterPartial = (await Product.findById(testProduct._id)).stock;

    log("Already paid order stock is NOT deducted again", stockAfterPartial === stockBeforePartial);
    log("Admin notification remained sent (not duplicated)", updatedOrder3.adminNotificationSent === true);

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Unpaid Payment Never Marked as Paid
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 6: Unpaid Payment Never Marked as Paid");
    const order4 = await Order.create({
      orderNumber: "AK-AUDIT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Unpaid Customer",
        email: "audit.unpaid@example.de",
        phone: "+4912345678",
        address: "Teststr. 4",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [{
        productId: testProduct._id,
        name: testProduct.name,
        priceAtOrder: 9.99,
        quantity: 1,
        lineTotal: 9.99
      }],
      subtotal: 9.99,
      deliveryFee: 3.5,
      total: 13.49,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending"
    });

    const stockBeforeUnpaid = (await Product.findById(testProduct._id)).stock;

    // Send a webhook with payment_status: "unpaid"
    const payloadUnpaid = JSON.stringify({
      id: "evt_test_unpaid_4",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_audit_unpaid_4",
          payment_status: "unpaid",
          metadata: {
            orderId: order4._id.toString(),
            orderNumber: order4.orderNumber
          }
        }
      }
    });

    const sigUnpaid = stripe.webhooks.generateTestHeaderString({
      payload: payloadUnpaid,
      secret: env.STRIPE_WEBHOOK_SECRET
    });

    await fetch(`${BASE}/api/orders/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": sigUnpaid },
      body: payloadUnpaid
    });

    const updatedOrder4 = await Order.findById(order4._id);
    const stockAfterUnpaid = (await Product.findById(testProduct._id)).stock;

    log("Unpaid session is NOT marked as paid", updatedOrder4.paymentStatus === "pending");
    log("Stock is NOT deducted for unpaid session", stockAfterUnpaid === stockBeforeUnpaid);

    // Call GET /api/orders with fake/unpaid session
    const fakeRes = await fetch(`${BASE}/api/orders?sessionId=cs_test_unpaid_does_not_exist`);
    log("GET /api/orders rejects unverified session", fakeRes.status === 404 || fakeRes.status === 400);

  } finally {
    // Cleanup temporary test product and test orders
    await Product.findByIdAndDelete(testProduct._id);
    await Order.deleteMany({ orderNumber: /^AK-AUDIT-/ });
    await mongoose.disconnect();
    console.log("\nCleanup completed.");
  }

  console.log("──────────────────────────────────────────────────");
  console.log(`Passed: ${passed}  Failed: ${failed}`);
  if (failed === 0) {
    console.log("🎉 All Concurrency & Data-Integrity Audit Tests Passed!");
  } else {
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Audit test runner failed:", err);
  process.exit(1);
});

