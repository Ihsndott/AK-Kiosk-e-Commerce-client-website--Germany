import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
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
      process.env[key] = val;
    }
  });
}

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== AK KIOSK STAGE 2: PRODUCT MANAGEMENT AUTOMATED TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Public GET /api/products
    console.log("1. Testing Public GET /api/products...");
    const resGetProducts = await fetch(`${BASE_URL}/api/products`);
    assert(resGetProducts.status === 200, "GET /api/products returns HTTP 200");
    const jsonGetProducts = await resGetProducts.json();
    assert(jsonGetProducts.success === true, "GET /api/products returns success: true");
    assert(Array.isArray(jsonGetProducts.data), "GET /api/products data is an Array");

    // 2. Unauthenticated write protections
    console.log("\n2. Testing Unauthenticated Route Protections (should return 401)...");
    const unauthPostProd = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker Item", price: 10 }),
    });
    assert(unauthPostProd.status === 401, "POST /api/products rejects unauthenticated write (401)");

    const fakeId = "60c72b2f9b1d8b2badbee123";
    const unauthPutProd = await fetch(`${BASE_URL}/api/products/${fakeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: 20 }),
    });
    assert(unauthPutProd.status === 401, "PUT /api/products/[id] rejects unauthenticated write (401)");

    const unauthDelProd = await fetch(`${BASE_URL}/api/products/${fakeId}`, {
      method: "DELETE",
    });
    assert(unauthDelProd.status === 401, "DELETE /api/products/[id] rejects unauthenticated write (401)");

    const unauthPostCat = await fetch(`${BASE_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauth Category" }),
    });
    assert(unauthPostCat.status === 401, "POST /api/categories rejects unauthenticated write (401)");

    const unauthUpload = await fetch(`${BASE_URL}/api/admin/upload`, {
      method: "POST",
    });
    assert(unauthUpload.status === 401, "POST /api/admin/upload rejects unauthenticated upload (401)");

    // 3. Public GET /api/categories
    console.log("\n3. Testing Public GET /api/categories...");
    const resGetCats = await fetch(`${BASE_URL}/api/categories`);
    assert(resGetCats.status === 200, "GET /api/categories returns HTTP 200");
    const jsonCats = await resGetCats.json();
    assert(jsonCats.success === true, "GET /api/categories returns success: true");
    assert(jsonCats.data.length > 0, `Categories found: ${jsonCats.data.length}`);

    // 4. Authenticate Administrator
    console.log("\n4. Authenticating Administrator...");
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    assert(loginRes.status === 200, "Admin login successful (200)");

    // Extract cookie from Set-Cookie header
    const setCookie = loginRes.headers.get("set-cookie");
    assert(Boolean(setCookie), "Admin session cookie received");
    const cookieHeader = setCookie ? setCookie.split(";")[0] : "";

    // 5. Authenticated Category Management & Case-Insensitive Deduplication
    console.log("\n5. Testing Category Creation and Deduplication...");
    const testCatName = `Stage2 Spices ${Date.now()}`;
    const createCatRes = await fetch(`${BASE_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ name: testCatName, description: "Test spice category" }),
    });
    assert(createCatRes.status === 201, `Category "${testCatName}" created (201)`);

    // Duplicate check (case-insensitive)
    const dupCatRes = await fetch(`${BASE_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ name: testCatName.toUpperCase() }),
    });
    assert(dupCatRes.status === 409, `Duplicate category correctly rejected with 409 Conflict`);

    // 6. Authenticated Product CRUD
    console.log("\n6. Testing Authenticated Product CRUD Operations...");
    const testProductPayload = {
      name: `Test Miso Paste ${Date.now()}`,
      category: testCatName,
      price: 4.99,
      originalPrice: 5.99,
      discountPrice: 4.49,
      stock: 45,
      sku: "TEST-MISO-01",
      description: "Authentic fermented soybean paste for Japanese soups and marinades.",
      images: [
        "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      ],
    };

    const createProdRes = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(testProductPayload),
    });
    const createdProdJson = await createProdRes.json();
    if (createProdRes.status !== 201) {
      console.error("POST /api/products error response:", createdProdJson);
    }
    assert(createProdRes.status === 201, "POST /api/products created product (201)");
    const createdProduct = createdProdJson.data;
    assert(Boolean(createdProduct?._id), "Created product contains valid MongoDB _id");
    assert(createdProduct.image === testProductPayload.images[0], "Product.image auto-synced with images[0]");
    assert(createdProduct.images.length === 2, "Product.images contains both URLs");

    const productId = createdProduct._id;

    // GET /api/products/[id]
    console.log("\n7. Testing GET /api/products/[id]...");
    const getSingleRes = await fetch(`${BASE_URL}/api/products/${productId}`);
    assert(getSingleRes.status === 200, "GET /api/products/[id] returns 200");
    const getSingleJson = await getSingleRes.json();
    assert(getSingleJson.data.name === testProductPayload.name, "Product name matches");

    // PUT /api/products/[id]
    console.log("\n8. Testing PUT /api/products/[id]...");
    const updateRes = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        ...createdProduct,
        price: 5.49,
        stock: 8, // Low stock test
      }),
    });
    assert(updateRes.status === 200, "PUT /api/products/[id] returns 200");
    const updateJson = await updateRes.json();
    assert(updateJson.data.price === 5.49, "Price updated to 5.49");
    assert(updateJson.data.stock === 8, "Stock updated to 8");

    // DELETE /api/products/[id]
    console.log("\n9. Testing DELETE /api/products/[id]...");
    const deleteRes = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: "DELETE",
      headers: { Cookie: cookieHeader },
    });
    assert(deleteRes.status === 200, "DELETE /api/products/[id] returns 200");

    // Verify deletion
    const verifyDelRes = await fetch(`${BASE_URL}/api/products/${productId}`);
    assert(verifyDelRes.status === 404, "Deleted product returns 404 Not Found");

    // 10. Customer Shop Page Check
    console.log("\n10. Testing Customer Shop Page /shop...");
    const shopRes = await fetch(`${BASE_URL}/shop`);
    assert(shopRes.status === 200, "Customer /shop page returns 200 OK");

    // 11. Admin Products Page Check
    console.log("\n11. Testing Admin Products Page /admin/products...");
    const adminProductsRes = await fetch(`${BASE_URL}/admin/products`, {
      headers: { Cookie: cookieHeader },
    });
    assert(adminProductsRes.status === 200, "Admin /admin/products returns 200 OK");

    console.log("\n========================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("========================================================");

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error("Test execution failed with error:", error);
    process.exit(1);
  }
}

runTests();
