import fs from 'fs';
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
let passed = 0;
let failed = 0;

function log(label, ok, detail = "") {
  console.log((ok ? "✅" : "❌") + " " + label + (detail ? " — " + detail : ""));
  if (ok) passed++; else failed++;
}

async function runTests() {
  console.log("=== Testing Fixes & Security Verification ===\n");

  // 1. Test Stripe Checkout Creation & Dynamic Origin + {CHECKOUT_SESSION_ID}
  console.log("1. Stripe Checkout Session Creation & URL Verification:");
  const prodRes = await fetch(`${BASE}/api/products`);
  const prodData = await prodRes.json();
  const product = prodData.data?.find(p => p.stock > 0);

  if (!product) {
    log("Find in-stock product", false);
    return;
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

  const checkoutRes = await fetch(`${BASE}/api/orders/stripe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000"
    },
    body: JSON.stringify({
      customer: {
        fullName: "Test Customer",
        email: "test.customer@example.de",
        phone: "+4912345678",
        address: "Teststr. 10",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany"
      },
      items: [{ productId: product._id, quantity: 1 }],
      deliveryMethod: "delivery"
    })
  });

  const checkoutData = await checkoutRes.json();
  log("POST /api/orders/stripe returns 201", checkoutRes.status === 201, checkoutData.data?.orderNumber);

  if (checkoutRes.status === 201) {
    // Retrieve session from Stripe to inspect success_url
    const session = await stripe.checkout.sessions.retrieve(
      checkoutData.data.checkoutUrl.split("/c/pay/")[1].split("#")[0]
    );

    const hasPlaceholder = session.success_url.includes("session_id={CHECKOUT_SESSION_ID}");
    const hasCorrectOrigin = session.success_url.startsWith("http://localhost:3000/order-confirmation");
    log("success_url includes {CHECKOUT_SESSION_ID}", hasPlaceholder, session.success_url);
    log("success_url has dynamic correct origin", hasCorrectOrigin);
  }

  // 2. Test Secure Order Confirmation via sessionId
  console.log("\n2. Secure Order Confirmation via sessionId:");
  // A. Invalid format
  const badFormat = await fetch(`${BASE}/api/orders?sessionId=invalid_session_id`);
  log("GET /api/orders?sessionId=invalid_id -> 400", badFormat.status === 400);

  // B. Nonexistent Stripe session
  const notFound = await fetch(`${BASE}/api/orders?sessionId=cs_test_nonexistent123456789`);
  log("GET /api/orders?sessionId=cs_test_nonexistent -> 404", notFound.status === 404);

  // C. Valid paid session
  const validSessionId = "cs_test_b1GclNhBo9YzLjFehCUhe5XQWevSZ36eHPmef5Tq2AJdoHjxlfEqogTNoD";
  const validLookup = await fetch(`${BASE}/api/orders?sessionId=${validSessionId}`);
  const validData = await validLookup.json();
  log(
    "GET /api/orders?sessionId=valid_paid_id -> 200",
    validLookup.status === 200 && validData.data?.paymentStatus === "paid",
    `orderNumber: ${validData.data?.orderNumber}, paymentStatus: ${validData.data?.paymentStatus}`
  );

  // D. Existing lookup with orderNumber + email
  const existingLookup = await fetch(`${BASE}/api/orders?orderNumber=AK-261101-MARET7DJ&email=akkiosk-test%40mailinator.com`);
  const existingData = await existingLookup.json();
  log(
    "GET /api/orders?orderNumber & email -> 200",
    existingLookup.status === 200 && existingData.data?.orderNumber === "AK-261101-MARET7DJ"
  );

  // 3. Test Webhook Idempotency (Duplicate Events)
  console.log("\n3. Webhook Idempotency & Duplicate Event Handling:");
  const sessionToDup = await stripe.checkout.sessions.retrieve(validSessionId);
  const dupPayload = JSON.stringify({
    id: "evt_dup_" + Date.now(),
    object: "event",
    type: "checkout.session.completed",
    data: { object: sessionToDup }
  });

  const dupSig = stripe.webhooks.generateTestHeaderString({
    payload: dupPayload,
    secret: env.STRIPE_WEBHOOK_SECRET,
    timestamp: Math.floor(Date.now() / 1000)
  });

  const dupRes = await fetch(`${BASE}/api/orders/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": dupSig
    },
    body: dupPayload
  });

  log("Duplicate webhook returns 200 without error", dupRes.status === 200);

  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`Passed: ${passed}  Failed: ${failed}`);
  if (failed === 0) {
    console.log("🎉 All security and integration tests passed!");
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});

