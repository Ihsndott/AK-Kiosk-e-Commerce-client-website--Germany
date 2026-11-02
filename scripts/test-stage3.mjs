/**
 * Stage 3 API Test Script
 * Tests all Stage 3 endpoints on the running dev server.
 * Run with: node scripts/test-stage3.mjs
 */

import fs from "fs";

const BASE = "http://localhost:3000";
let passed = 0;
let failed = 0;
let createdOrderId = null;
let createdOrderNumber = null;
let createdOrderEmail = null;

// Read .env.local if present
let envLocal = {};
try {
  const content = fs.readFileSync(".env.local", "utf8");
  content.split(/\r?\n/).forEach((l) => {
    const idx = l.indexOf("=");
    if (idx !== -1 && !l.trim().startsWith("#")) {
      const k = l.substring(0, idx).trim();
      const v = l.substring(idx + 1).trim().replace(/^["']|["']$/g, "");
      envLocal[k] = v;
    }
  });
} catch {}

function log(label, ok, detail = "") {
  const mark = ok ? "✅" : "❌";
  console.log(`${mark} ${label}${detail ? " — " + detail : ""}`);
  if (ok) passed++; else failed++;
}

async function json(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

// ─── 1. Existing endpoints still work ────────────────────────────────────────
console.log("\n=== 1. Existing Endpoints ===");

const products = await json("/api/products");
log("GET /api/products → 200", products.status === 200, `${products.data?.data?.length ?? 0} products`);

const categories = await json("/api/categories");
log("GET /api/categories → 200", categories.status === 200);

// ─── 2. Public Orders ─────────────────────────────────────────────────────────
console.log("\n=== 2. POST /api/orders (COD) ===");

// Fetch a valid product for testing
const productList = products.data?.data || [];
const testProduct = productList.find(p => p.stock > 0);

if (!testProduct) {
  console.log("⚠️  No products with stock found. Skipping COD order tests.");
} else {
  // Invalid: missing customer
  const bad1 = await json("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ productId: testProduct._id, quantity: 1 }], deliveryMethod: "delivery", paymentMethod: "cod" }),
  });
  log("POST /api/orders (missing customer) → 400", bad1.status === 400, bad1.data?.message);

  // Invalid: wrong payment method
  const bad2 = await json("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: { fullName: "Test User", email: "test@test.de", address: "Teststr. 1", city: "Oberhausen", postalCode: "46049" },
      items: [{ productId: testProduct._id, quantity: 1 }],
      deliveryMethod: "delivery",
      paymentMethod: "stripe",
    }),
  });
  log("POST /api/orders (stripe at COD endpoint) → 400", bad2.status === 400, bad2.data?.message);

  // Valid COD order
  const validOrder = await json("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        fullName: "Test Kunde",
        email: "test.kunde@example.de",
        phone: "+49 208 1234567",
        address: "Teststraße 42",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany",
      },
      items: [{ productId: testProduct._id, quantity: 1 }],
      deliveryMethod: "delivery",
      paymentMethod: "cod",
    }),
  });
  log("POST /api/orders (valid COD) → 201", validOrder.status === 201, validOrder.data?.data?.orderNumber);
  if (validOrder.status === 201) {
    createdOrderNumber = validOrder.data?.data?.orderNumber;
    createdOrderEmail = "test.kunde@example.de";
    createdOrderId = validOrder.data?.data?.orderId;
  }

  // Excessive stock
  const overStock = await json("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: { fullName: "Test User", email: "test@test.de", address: "Teststr. 1", city: "Oberhausen", postalCode: "46049" },
      items: [{ productId: testProduct._id, quantity: 999999 }],
      deliveryMethod: "delivery",
      paymentMethod: "cod",
    }),
  });
  log("POST /api/orders (over stock) → 409", overStock.status === 409, overStock.data?.errors?.[0]);
}

// ─── 3. GET Order lookup ──────────────────────────────────────────────────────
console.log("\n=== 3. GET /api/orders (public lookup) ===");

const noParams = await json("/api/orders");
log("GET /api/orders (no params) → 400", noParams.status === 400);

if (createdOrderNumber && createdOrderEmail) {
  const lookup = await json(
    `/api/orders?orderNumber=${createdOrderNumber}&email=${encodeURIComponent(createdOrderEmail)}`
  );
  log("GET /api/orders (valid lookup) → 200", lookup.status === 200, lookup.data?.data?.orderNumber);
}

const wrongLookup = await json("/api/orders?orderNumber=AK-FAKE-00000000&email=nobody@example.de");
log("GET /api/orders (wrong order) → 404", wrongLookup.status === 404);

// ─── 4. Admin Orders (unauthenticated) ───────────────────────────────────────
console.log("\n=== 4. Admin Orders API (no auth) ===");

const unauthList = await json("/api/admin/orders");
log("GET /api/admin/orders (no auth) → 401", unauthList.status === 401, unauthList.data?.message);

const unauthPatch = await json("/api/admin/orders/000000000000000000000000", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderStatus: "confirmed" }),
});
log("PATCH /api/admin/orders/[id] (no auth) → 401", unauthPatch.status === 401);

// ─── 5. Admin Login + Authenticated Endpoints ────────────────────────────────
console.log("\n=== 5. Admin Login + Authenticated Orders ===");

const adminEmail = process.env.ADMIN_EMAIL || envLocal.ADMIN_EMAIL || "admin@ak-kiosk.de";
const adminPass = process.env.ADMIN_PASSWORD || envLocal.ADMIN_PASSWORD || "";

let adminCookie = "";
const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: adminEmail, password: adminPass }),
});
const loginData = await loginRes.json();
if (loginRes.ok && loginData.success) {
  const setCookie = loginRes.headers.get("set-cookie");
  if (setCookie) {
    adminCookie = setCookie.split(";")[0];
  }
  log("POST /api/admin/login → 200", true, loginData.data?.name);
} else {
  log("POST /api/admin/login", false, loginData.message || "Check ADMIN_EMAIL/ADMIN_PASSWORD env vars");
}

if (adminCookie) {
  const authList = await json("/api/admin/orders", {
    headers: { Cookie: adminCookie },
  });
  log(
    "GET /api/admin/orders (authenticated) → 200",
    authList.status === 200,
    `${authList.data?.pagination?.total ?? 0} total orders`
  );

  // Stats should now include orders
  const authStats = await json("/api/admin/stats", {
    headers: { Cookie: adminCookie },
  });
  log(
    "GET /api/admin/stats → 200 with orders",
    authStats.status === 200 && typeof authStats.data?.data?.totalOrders === "number",
    `totalOrders=${authStats.data?.data?.totalOrders}`
  );

  const targetOrderId = createdOrderId || authList.data?.[0]?._id;
  if (targetOrderId) {
    const getOrder = await json(`/api/admin/orders/${targetOrderId}`, {
      headers: { Cookie: adminCookie },
    });
    log(
      "GET /api/admin/orders/[id] → 200",
      getOrder.status === 200,
      getOrder.data?.data?.orderNumber || `status: ${getOrder.status}`
    );

    const patchOrder = await json(`/api/admin/orders/${targetOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ orderStatus: "confirmed" }),
    });
    log(
      "PATCH /api/admin/orders/[id] (confirm) → 200",
      patchOrder.status === 200,
      patchOrder.data?.data?.orderStatus
    );

    const invalidStatus = await json(`/api/admin/orders/${targetOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ orderStatus: "flying" }),
    });
    log("PATCH /api/admin/orders/[id] (invalid status) → 400", invalidStatus.status === 400);
  }
}

// ─── 6. Stripe (API check) ──────────────────────────────────────────────────
console.log("\n=== 6. Stripe Endpoint ===");
if (testProduct) {
  const stripeRes = await json("/api/orders/stripe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        fullName: "Test Stripe Customer",
        email: "stripe.customer@example.de",
        phone: "+49 208 1234567",
        address: "Teststr. 1",
        city: "Oberhausen",
        postalCode: "46049",
        country: "Germany",
      },
      items: [{ productId: testProduct._id, quantity: 1 }],
      deliveryMethod: "delivery",
    }),
  });
  if (stripeRes.status === 201) {
    const hasUrl = typeof stripeRes.data?.data?.checkoutUrl === "string" && stripeRes.data.data.checkoutUrl.startsWith("https://checkout.stripe.com/");
    log("POST /api/orders/stripe → 201 (Checkout session created)", hasUrl, stripeRes.data?.data?.orderNumber);
  } else if (stripeRes.status === 503) {
    log("POST /api/orders/stripe → 503 (Unconfigured fallback)", true, stripeRes.data?.message);
  } else {
    log("POST /api/orders/stripe", false, `status=${stripeRes.status} ${JSON.stringify(stripeRes.data)}`);
  }
}

// ─── 7. Webhook (signature verification) ─────────────────────────────────────
console.log("\n=== 7. Stripe Webhook Verification ===");
const webhookNoSig = await fetch(`${BASE}/api/orders/stripe/webhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "test" }),
});
log(
  "POST /api/orders/stripe/webhook (no stripe-signature) → 4xx or 5xx",
  webhookNoSig.status >= 400,
  `status=${webhookNoSig.status}`
);

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`Tests passed: ${passed}  Failed: ${failed}`);
if (failed === 0) {
  console.log("🎉 All Stage 3 API tests passed!");
} else {
  console.log("⚠️  Some tests failed. Review output above.");
}

