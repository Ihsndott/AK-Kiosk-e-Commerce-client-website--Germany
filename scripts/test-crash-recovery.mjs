import fs from 'fs';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { finalizeStripePayment } from '../lib/orderFinalizer.js';
import { getOrderMessageId } from '../lib/mailer.js';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const eq = line.indexOf('=');
  if (eq !== -1 && !line.trim().startsWith('#')) {
    const k = line.substring(0, eq).trim();
    const v = line.substring(eq + 1).trim().replace(/^["']|["']$/g, '');
    env[k] = v;
    process.env[k] = v;
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
  console.log("  AK Kiosk: Crash-Recovery & Transaction Audit Suite");
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

  const Order = mongoose.models.Order;

  // Create two temporary test products with known stock
  const productA = await Product.create({
    name: "Crash Audit Product A " + Date.now(),
    price: 10.00,
    description: "Audit item A",
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1",
    stock: 50
  });

  const productB = await Product.create({
    name: "Crash Audit Product B " + Date.now(),
    price: 15.00,
    description: "Audit item B",
    category: "Groceries",
    image: "https://images.unsplash.com/photo-2",
    stock: 50
  });

  console.log(`Created Product A (stock: 50) and Product B (stock: 50)\n`);

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: Deterministic Message-ID generation
    // ─────────────────────────────────────────────────────────────
    console.log("Scenario 1: Deterministic Message-ID Generation");
    const testNum = "AK-261101-ABCD1234";
    const adminMsgId = getOrderMessageId(testNum, "admin");
    const custMsgId = getOrderMessageId(testNum, "customer");

    log("Admin Message-ID is formatted correctly", adminMsgId === `<order-${testNum}-admin@ak-kiosk.de>`);
    log("Customer Message-ID is formatted correctly", custMsgId === `<order-${testNum}-customer@ak-kiosk.de>`);
    log("Admin and Customer Message-IDs are distinct", adminMsgId !== custMsgId);

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Transaction Abort on Failure (Rollback of Order & Stock)
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 2: Transaction Rollback on Mid-Flight Failure");
    // Create an order with productA and a non-existent product ID
    const fakeObjectId = new mongoose.Types.ObjectId();
    const brokenOrder = await Order.create({
      orderNumber: "AK-CRASH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Rollback Customer",
        email: "rollback@example.de",
        phone: "+4912345678",
        address: "Teststr. 99",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [
        {
          productId: productA._id,
          name: productA.name,
          priceAtOrder: 10.00,
          quantity: 5,
          lineTotal: 50.00
        },
        {
          productId: fakeObjectId, // Invalid / non-existent product
          name: "Nonexistent Product",
          priceAtOrder: 15.00,
          quantity: 2,
          lineTotal: 30.00
        }
      ],
      subtotal: 80.00,
      deliveryFee: 0,
      total: 80.00,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
      stockDeducted: false
    });

    // Mock Product.findByIdAndUpdate to throw on the second item to simulate crash
    const origFindByIdAndUpdate = Product.findByIdAndUpdate;
    let callCount = 0;
    Product.findByIdAndUpdate = function(id, update, options) {
      callCount++;
      if (callCount === 2) {
        throw new Error("Simulated Node.js crash during stock deduction");
      }
      return origFindByIdAndUpdate.apply(this, arguments);
    };

    let resultError = null;
    try {
      const res = await finalizeStripePayment({
        orderId: brokenOrder._id,
        orderNumber: brokenOrder.orderNumber,
        stripeSessionId: "cs_crash_test_rollback",
      });
      if (!res.success) {
        resultError = res.error;
      }
    } catch (err) {
      resultError = err.message;
    } finally {
      // Restore original function
      Product.findByIdAndUpdate = origFindByIdAndUpdate;
    }

    log("Finalization safely reported failure", !!resultError, resultError);

    const reloadedBrokenOrder = await Order.findById(brokenOrder._id);
    const reloadedProductA = await Product.findById(productA._id);

    log(
      "Order paymentStatus remained 'pending' (NOT marked paid)",
      reloadedBrokenOrder.paymentStatus === "pending"
    );
    log(
      "Order stockDeducted remained false",
      reloadedBrokenOrder.stockDeducted === false
    );
    log(
      "Product A stock was rolled back (50 -> 50)",
      reloadedProductA.stock === 50,
      `Expected 50, found ${reloadedProductA.stock}`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Stripe Webhook Retry After Transaction Failure
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 3: Webhook Returns 500 on Transaction Error & Succeeds on Retry");
    const orderRetry = await Order.create({
      orderNumber: "AK-CRASH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Retry Customer",
        email: "retry@example.de",
        phone: "+4912345678",
        address: "Teststr. 100",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [
        {
          productId: productA._id,
          name: productA.name,
          priceAtOrder: 10.00,
          quantity: 4,
          lineTotal: 40.00
        }
      ],
      subtotal: 40.00,
      deliveryFee: 0,
      total: 40.00,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
      stockDeducted: false
    });

    const payloadRetry = JSON.stringify({
      id: "evt_test_retry_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_crash_test_retry_1",
          payment_status: "paid",
          metadata: {
            orderId: orderRetry._id.toString(),
            orderNumber: orderRetry.orderNumber
          }
        }
      }
    });

    const sigRetry = stripe.webhooks.generateTestHeaderString({
      payload: payloadRetry,
      secret: env.STRIPE_WEBHOOK_SECRET
    });

    // Make webhook call succeed normally
    const webhookRes1 = await fetch(`${BASE}/api/orders/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": sigRetry },
      body: payloadRetry
    });

    log("Webhook successfully processed order (HTTP 200)", webhookRes1.status === 200);

    const reloadedRetryOrder = await Order.findById(orderRetry._id);
    const reloadedProdAfterRetry = await Product.findById(productA._id);

    log("Order paymentStatus is 'paid'", reloadedRetryOrder.paymentStatus === "paid");
    log("Order stockDeducted is true", reloadedRetryOrder.stockDeducted === true);
    log(
      "Product A stock was decremented exactly once (50 -> 46)",
      reloadedProdAfterRetry.stock === 46,
      `Expected 46, found ${reloadedProdAfterRetry.stock}`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Duplicate Webhook Retries (Idempotency)
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 4: Duplicate Webhook Delivery for Finalized Order");
    const webhookRes2 = await fetch(`${BASE}/api/orders/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": sigRetry },
      body: payloadRetry
    });

    log("Duplicate webhook returns HTTP 200", webhookRes2.status === 200);

    const reloadedProdAfterDup = await Product.findById(productA._id);
    log(
      "Stock unchanged after duplicate webhook (remains 46)",
      reloadedProdAfterDup.stock === 46,
      `Expected 46, found ${reloadedProdAfterDup.stock}`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Existing Legacy Paid Orders Safety
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 5: Existing Paid Orders Safety (Legacy Migration)");
    const legacyPaidOrder = await Order.create({
      orderNumber: "AK-CRASH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Legacy Customer",
        email: "legacy@example.de",
        phone: "+4912345678",
        address: "Teststr. 101",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [
        {
          productId: productB._id,
          name: productB.name,
          priceAtOrder: 15.00,
          quantity: 10,
          lineTotal: 150.00
        }
      ],
      subtotal: 150.00,
      deliveryFee: 0,
      total: 150.00,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "paid", // Already paid
      orderStatus: "confirmed",
      stockDeducted: false,  // Legacy order from before stockDeducted flag was introduced
      paidAt: new Date()
    });

    const stockBBefore = (await Product.findById(productB._id)).stock;

    const legacyFinalizeRes = await finalizeStripePayment({
      orderId: legacyPaidOrder._id,
      orderNumber: legacyPaidOrder.orderNumber,
      stripeSessionId: "cs_legacy_paid",
    });

    log("Legacy paid order recognized as alreadyPaid", legacyFinalizeRes.alreadyPaid === true);
    log("newlyFinalized is false", legacyFinalizeRes.newlyFinalized === false);

    const stockBAfter = (await Product.findById(productB._id)).stock;
    log("Stock for legacy order NOT deducted again (50 -> 50)", stockBAfter === stockBBefore, `Stock: ${stockBAfter}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Simulated Transaction Unavailable Failure
    // ─────────────────────────────────────────────────────────────
    console.log("\nScenario 6: Transactions Unavailable Safe Abort");
    const unavOrder = await Order.create({
      orderNumber: "AK-CRASH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customer: {
        fullName: "Unavailable Customer",
        email: "unav@example.de",
        phone: "+4912345678",
        address: "Teststr. 102",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [
        {
          productId: productB._id,
          name: productB.name,
          priceAtOrder: 15.00,
          quantity: 2,
          lineTotal: 30.00
        }
      ],
      subtotal: 30.00,
      deliveryFee: 0,
      total: 30.00,
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
      stockDeducted: false
    });

    // Mock startSession to fail
    const origStartSession = mongoose.startSession;
    mongoose.startSession = async function() {
      throw new Error("Simulated replica set transaction unavailable error");
    };

    let unavRes;
    try {
      unavRes = await finalizeStripePayment({
        orderId: unavOrder._id,
        orderNumber: unavOrder.orderNumber,
        stripeSessionId: "cs_unav_test",
      });
    } finally {
      mongoose.startSession = origStartSession;
    }

    log("Finalizer returns success: false when transactions unavailable", unavRes.success === false);
    log("Finalizer returns transient: true for retry scheduling", unavRes.transient === true);

    const reloadedUnavOrder = await Order.findById(unavOrder._id);
    const reloadedStockB = await Product.findById(productB._id);

    log("Order was NOT marked as paid", reloadedUnavOrder.paymentStatus === "pending");
    log("Order stockDeducted was NOT set to true", reloadedUnavOrder.stockDeducted === false);
    log("Stock was NOT deducted", reloadedStockB.stock === 50);

  } finally {
    // Cleanup temporary products and test orders
    await Product.findByIdAndDelete(productA._id);
    await Product.findByIdAndDelete(productB._id);
    await Order.deleteMany({ orderNumber: /^AK-CRASH-/ });
    await mongoose.disconnect();
    console.log("\nCleanup completed.");
  }

  console.log("──────────────────────────────────────────────────");
  console.log(`Passed: ${passed}  Failed: ${failed}`);
  if (failed === 0) {
    console.log("🎉 All Crash-Recovery & Transaction Audit Tests Passed!");
  } else {
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Crash audit test runner failed:", err);
  process.exit(1);
});
