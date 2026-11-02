import fs from "fs";
import path from "path";

// Load admin login credentials from .env.local without exposing them
const envContent = fs.readFileSync(".env.local", "utf-8");
let adminEmail = "";
let adminPassword = "";

envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key === "ADMIN_EMAIL") adminEmail = val;
    if (key === "ADMIN_PASSWORD") adminPassword = val;
  }
});

const BASE_URL = "http://localhost:3000";

async function testCloudinaryDetection() {
  console.log("=== TESTING CLOUDINARY CONFIGURATION DETECTION ===");

  // 1. Authenticate admin
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!loginRes.ok) {
    console.error("Admin login failed with status:", loginRes.status);
    process.exit(1);
  }

  const setCookie = loginRes.headers.get("set-cookie");
  const cookieHeader = setCookie ? setCookie.split(";")[0] : "";
  console.log("[PASS] Authenticated admin session successfully");

  // 2. Check GET /api/admin/upload
  const checkRes = await fetch(`${BASE_URL}/api/admin/upload`, {
    headers: { Cookie: cookieHeader },
  });

  const checkJson = await checkRes.json();
  console.log("Upload Status API Response:", {
    status: checkRes.status,
    success: checkJson.success,
    configured: checkJson.configured,
    message: checkJson.message,
  });

  if (checkJson.configured === true) {
    console.log("[SUCCESS] Cloudinary credentials DETECTED on the server!");
  } else {
    console.error("[FAILURE] Cloudinary credentials NOT detected on the server!");
  }

  // 3. Test a tiny 1x1 transparent PNG upload
  console.log("\nTesting test image upload to /api/admin/upload...");
  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const pngBuffer = Buffer.from(tinyPngBase64, "base64");
  const blob = new Blob([pngBuffer], { type: "image/png" });

  const formData = new FormData();
  formData.append("file", blob, "test-pixel.png");

  const uploadRes = await fetch(`${BASE_URL}/api/admin/upload`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
    body: formData,
  });

  const uploadJson = await uploadRes.json();
  console.log("Upload Result Status:", uploadRes.status);
  console.log("Upload Result Success:", uploadJson.success);
  console.log("Upload Result Message:", uploadJson.message);

  if (uploadJson.success && uploadJson.data?.url) {
    console.log("[SUCCESS] Image upload to Cloudinary succeeded! URL format valid:", uploadJson.data.url.startsWith("https://res.cloudinary.com/"));
  } else {
    console.log("Upload outcome details:", {
      status: uploadRes.status,
      configured: uploadJson.configured,
      message: uploadJson.message,
    });
  }
}

testCloudinaryDetection();

