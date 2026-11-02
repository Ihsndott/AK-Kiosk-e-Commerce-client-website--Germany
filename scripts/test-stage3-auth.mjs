import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const BASE = "http://localhost:3000";
let ok = 0, fail = 0;
const log = (label, pass, detail="") => {
  console.log((pass?"✅":"❌") + " " + label + (detail ? " — " + detail : ""));
  if(pass) ok++; else fail++;
};

// Admin login
const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
});
const loginData = await loginRes.json();
log("POST /api/admin/login → 200", loginRes.status === 200, loginData.success ? loginData.data?.name : loginData.message);

const setCookie = loginRes.headers.get("set-cookie");
const cookie = setCookie ? setCookie.split(";")[0] : "";
if (!cookie) { console.log("No cookie — aborting auth tests"); process.exit(1); }

// Get orders list
const listRes = await fetch(`${BASE}/api/admin/orders`, { headers: { Cookie: cookie } });
const listData = await listRes.json();
log("GET /api/admin/orders (auth) → 200", listRes.status === 200, `total=${listData.pagination?.total}`);

// Stats with orders
const statsRes = await fetch(`${BASE}/api/admin/stats`, { headers: { Cookie: cookie } });
const statsData = await statsRes.json();
log(
  "GET /api/admin/stats includes orders",
  statsRes.status === 200 && typeof statsData.data?.totalOrders === "number",
  `totalOrders=${statsData.data?.totalOrders} revenue=EUR${statsData.data?.totalRevenue}`
);

if (listData.data?.length > 0) {
  const firstId = listData.data[0]._id;
  const firstNum = listData.data[0].orderNumber;

  // GET single
  const orderRes = await fetch(`${BASE}/api/admin/orders/${firstId}`, { headers: { Cookie: cookie } });
  const orderData = await orderRes.json();
  log("GET /api/admin/orders/[id] → 200", orderRes.status === 200, orderData.data?.orderNumber);

  // PATCH valid status
  const patchRes = await fetch(`${BASE}/api/admin/orders/${firstId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ orderStatus: "confirmed" }),
  });
  const patchData = await patchRes.json();
  log("PATCH /api/admin/orders/[id] confirmed → 200", patchRes.status === 200, patchData.data?.orderStatus);

  // PATCH invalid status
  const badPatch = await fetch(`${BASE}/api/admin/orders/${firstId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ orderStatus: "shipped" }),
  });
  const badData = await badPatch.json();
  log("PATCH /api/admin/orders/[id] invalid status → 400", badPatch.status === 400, badData.message);
} else {
  console.log("ℹ️  No orders yet to test individual order endpoints");
}

// Search filter
const searchRes = await fetch(`${BASE}/api/admin/orders?search=AK-`, { headers: { Cookie: cookie } });
log("GET /api/admin/orders?search → 200", searchRes.status === 200);

// Status filter
const statusRes = await fetch(`${BASE}/api/admin/orders?orderStatus=pending`, { headers: { Cookie: cookie } });
log("GET /api/admin/orders?orderStatus=pending → 200", statusRes.status === 200);

console.log(`\nAuth tests: ${ok} passed, ${fail} failed`);

