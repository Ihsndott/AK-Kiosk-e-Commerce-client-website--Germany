# Implementation Task Tracker — AK Kiosk & Asian Market

## Project Overview
- **Project**: AK Kiosk & Asian Market E-Commerce Web Application
- **Location**: Buschhausener Str. 63, 46049 Oberhausen, Germany
- **Core Goal**: Build a premium, futuristic e-commerce website with a reference-inspired centered-logo navbar and layered animated hero section.

---

## 📋 Stage 1 Checklist: Project Setup & Initial UI

### 1. Workspace & Architecture Setup
- [x] Inspect workspace and initialize Next.js App Router without `src/` directory.
- [x] Configure JavaScript and JSX only (zero TypeScript, no `.ts` or `.tsx` files).
- [x] Configure `jsconfig.json` with absolute `@/*` path mapping.
- [x] Install dependencies: `next`, `react`, `react-dom`, `framer-motion`, `lucide-react`, `tailwindcss`, `clsx`, `tailwind-merge`.
- [x] Create `.env.local` and `.gitignore`.

### 2. Design Tokens & Styling
- [x] Configure exact brand color palette in `tailwind.config.js`:
  - Pale blue-grey: `#CBD8DC`
  - Soft icy blue: `#DCE8EB`
  - Warm ivory: `#F7F5EF`
  - Deep charcoal: `#17191B`
  - Burgundy: `#7A1735`
  - Muted gold: `#D1AE70`
- [x] Setup custom shadows (`shadow-frame`, `shadow-float`, `shadow-pill`), border radii, and floating keyframe animations.
- [x] Configure `app/globals.css` with smooth scrolling, custom scrollbars, and `prefers-reduced-motion` compliance.
- [x] Configure `app/layout.js` with Google fonts (`Inter` and `Plus Jakarta Sans`) and SEO metadata for Oberhausen.

### 3. Navigation Bar (`Navbar.jsx` & `MobileMenu.jsx`)
- [x] Architectural notched header bar matching the reference image geometry with centered lowered tab.
- [x] Precisely centered `"AK KIOSK"` logo with `"ASIAN MARKET"` subtitle nestled inside the architectural notch.
- [x] Streamlined left navigation links: `HOME` (`/`), `SHOP` (`/shop`), `ABOUT US` (`/about`), and `CONTACT` (`/contact`) with animated underline hover effects.
- [x] Synchronized mobile drawer navigation in `MobileMenu.jsx` to match exact desktop links with smooth Framer Motion slide-in.
- [x] Shopping categories (`Groceries`, `Snacks`, `Drinks`) kept accessible directly on `/shop` catalog page and throughout home collections.
- [x] Right interactive controls:
  - Search trigger modal with quick tags and keyboard shortcut (`Ctrl+K`).
  - Account modal / customer menu with direct link to `/login` and sign-out action.
  - High-contrast `SHOP NOW` pill button (matching reference header pill).
  - Shopping bag icon pill with live item count badge.

### 4. Authentication & Form Validation (`app/login/page.js` & `app/register/page.js`)
- [x] Completed and enhanced `/login` page with full AK Kiosk branding, warm ivory borders, and pale blue-grey framing.
- [x] Added email and password fields with strict client-side validation and accessible inline error messaging.
- [x] Added password visibility toggle (`Eye` / `EyeOff`).
- [x] Added "Remember Me" checkbox with local persistence.
- [x] Added interactive "Forgot Password?" dialog with email validation and confirmation state.
- [x] Integrated with existing `AuthContext` to update authentication state without hardcoded credentials.
- [x] Enhanced `/register` page with matching validation, terms agreement, password toggle, and direct link to sign in.

### 5. Backend & Database Foundation (Stage 1 — MongoDB Connection)
- [x] Installed `mongoose` as database ODM.
- [x] Created `lib/mongodb.js` with singleton cached connection handling across Next.js App Router and hot-reloading.
- [x] Configured support for `process.env.MONGODB_URI` (with graceful fallback to `process.env.MONGO_URI`).
- [x] Created `.env.example` with template connection string without exposing real credentials.
- [x] Created API health endpoint at `app/api/health/route.js` to report connection status without exposing sensitive credentials.
- [x] Tested endpoint response handling and connection error security.

### 4. Reference-Inspired Hero Section (`HeroSection.jsx`)
- [x] Outer pale blue-grey background (`#CBD8DC`) with generous framing margins.
- [x] Large rounded inner frame (`rounded-[2.2rem]` / `rounded-[3.5rem]`) with soft ivory border (`#F7F5EF`) and icy-blue interior (`#DCE8EB`).
- [x] Subtle architectural wireframe perspective lines radiating from behind the central visual (exact reference fidelity).
- [x] Upper center layout:
  - Eyebrow & location indicator: `DISCOVER YOUR ASIAN FAVORITES • OBERHAUSEN, GERMANY`.
  - Headline: `Your Asian Market. One Click Away.`
  - Side-by-side pill CTAs: `[ SHOP NOW ]` (dark charcoal pill) and `[ EXPLORE ALL ]` (soft ivory pill).
- [x] Symmetrical three-column hero lower canvas matching reference:
  - **Left**: Overlapping customer avatar stack, 5-star rating `4.9 ★ (800+ reviews)`, left-aligned descriptive paragraph copy, and Oberhausen location tag.
  - **Center**: Prominent central Asian market centerpiece (Korean Buldak spicy ramen & gourmet noodle arrangement) anchored at the bottom edge with natural shadows, pricing, and quick-add button.
  - **Right**: Floating rounded video/store tour card with dark contrast styling, thumbnail, and play button `( ▶ )` opening an interactive video walkthrough modal.
  - **Bottom Left**: Dual circle pagination/indicator controls matching the reference screenshot.
- [x] Desktop mouse parallax depth effect using Framer Motion springs and transforms.

### 5. Shopping Functionality & Supporting Sections
- [x] Global shopping bag context (`CartContext.jsx` & `useCart.js`) with add to cart, quantity change, subtotal, and toast notifications.
- [x] Slide-out `CartDrawer.jsx` with free Oberhausen delivery meter (€35 threshold).
- [x] Quick search modal (`SearchModal.jsx`) with instant filtering across authentic Asian products.
- [x] Product card component (`ProductCard.jsx`) with hover zoom, discount badges, ratings, and instant add button.
- [x] Category showcase section (`CategorySection.jsx`) with department cards.
- [x] Bestsellers section (`Bestsellers.jsx`) featuring top Korean and Japanese products.
- [x] Promotional voucher banner (`PromotionalBanner.jsx`) offering 10% off with `AKWELCOME10`.
- [x] New arrivals section (`NewArrivals.jsx`).
- [x] Physical store showcase (`StoreLocation.jsx`) with hours, phone, and embedded Google Maps view for Buschhausener Str. 63, 46049 Oberhausen.
- [x] Minimalist dark footer (`Footer.jsx`) with newsletter subscription, department links, and legal info.

### 6. Full App Routing
- [x] `app/shop/page.js` (Catalog with filters and sorting)
- [x] `app/categories/groceries/page.js`
- [x] `app/categories/snacks/page.js`
- [x] `app/categories/drinks/page.js`
- [x] `app/product/[slug]/page.js` (Product detail view)
- [x] `app/cart/page.js` (Shopping bag management)
- [x] `app/checkout/page.js` (Delivery & pickup selection)
- [x] `app/login/page.js` & `app/register/page.js`
- [x] `app/about/page.js`
- [x] `app/contact/page.js`

---

## 📋 Stage 2: Database Connection & Product API Backend

### 1. MongoDB Atlas Connection Stabilization
- [x] Diagnosed Node.js Windows SRV DNS resolution failure (`querySrv ECONNREFUSED`).
- [x] Configured direct replica set URI format (`mongodb://`) in `.env.local` pointing to Atlas cluster shard nodes.
- [x] Implemented safe diagnostic error classification in `app/api/health/route.js`.
- [x] Verified database health check endpoint `/api/health` returns HTTP 200 with `status: ok` and `database.status: connected`.

### 2. Product Model & Product API Handler
- [x] Created Mongoose `Product` model at `models/Product.js`:
  - `name`: String, required, trimmed.
  - `price`: Number, required, min 0.
  - `description`: String, required.
  - `category`: String, required.
  - `image`: String (URL/path), required.
  - `stock`: Number, required, default 0, min 0.
  - `timestamps`: Automatic `createdAt` and `updatedAt`.
  - Recompilation guard (`mongoose.models.Product || mongoose.model(...)`).
- [x] Created App Router API route at `app/api/products/route.js`:
  - **`GET /api/products`**: Fetches all products, sorted by newest first.
  - **Category Query Filter**: `GET /api/products?category=...` supporting case-insensitive match.
  - **`POST /api/products`**: Validates request body, price, stock, required fields, and creates product in MongoDB with HTTP 201.
  - Safe error handling without credential leaks.
- [x] **Testing**:
  - `GET /api/products` verified with 200 OK.
  - `POST /api/products` verified with validation rejections (400) and successful creation (201).
  - Category filtering verified with matching and empty results.

---

## 📋 Stage 3: Shop Page Live Data Integration

### 1. MongoDB Catalog Integration
- [x] Replaced hardcoded static products on `/shop` with live data fetched from `GET /api/products`.
- [x] Displayed product image, name, price, category, and live stock indicator.
- [x] Adapted `components/products/ProductCard.jsx` to support MongoDB documents (`_id`, `stock`, `unoptimized` image loading).
- [x] Integrated client-side sorting: Featured, Price (Low/High), Rating.

### 2. UI Data States
- [x] **Loading State**: Responsive 8-card skeleton placeholder matching the pale-grey/icy-blue palette.
- [x] **Success State**: Responsive 4-column product grid with live MongoDB items.
- [x] **Empty State**: Clean placeholder card ("No products available yet") with clear-filter button.
- [x] **Error State**: User-friendly error message with interactive "Try Again" retry action.
- [x] **Category Filtering**: Connected category tabs (`All`, `Asian Groceries`, `Snacks & Sweets`, `Drinks & Teas`) to dynamic query parameters (`/api/products?category=...`).

---

## 📋 Stage 4: Admin Panel & Secure Authentication (Stage 1)

### 1. Website Navigation Integration
- [x] Added small, unobtrusive **"Admin"** link in the customer-facing footer (`components/layout/Footer.jsx`) linking to `/admin/login`.
- [x] Customer storefront layout and design completely preserved.

### 2. Admin Authentication & Security
- [x] Created `models/Admin.js` schema with `email`, bcrypt hashed `password`, `name`, `role`, and `lastLogin`.
- [x] Installed and configured `bcryptjs` for secure password hashing (cost factor 12).
- [x] Installed and configured `jose` for cryptographically signed JWT sessions via HMAC-SHA256 (`HS256`).
- [x] Created `lib/auth.js` with auto-provisioning (`ensureInitialAdmin`) from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- [x] Created `middleware.js` for Edge-compatible route guarding:
  - Protects `/admin/:path*` (except `/admin/login`).
  - Protects `/api/admin/:path*` (except `/api/admin/login`).
  - Redirects unauthenticated visits to `/admin/login?from=...`.
  - Redirects authenticated visits to `/admin/login` directly to `/admin/dashboard`.
  - Blocks unauthorized API calls with HTTP 401 JSON.
- [x] Created API route handlers:
  - `POST /api/admin/login`: Verifies bcrypt hash, sets HTTP-only `ak_admin_session` cookie (24h or 7d remember-me).
  - `POST /api/admin/logout`: Clears cookie and invalidates session.
  - `GET /api/admin/me`: Returns verified administrator profile.
  - `GET /api/admin/stats`: Returns live MongoDB product count and store metrics.

### 3. Admin Login Interface
- [x] Created `app/admin/login/page.js`:
  - Branded AK Kiosk Admin styling (soft icy-blue background, warm ivory borders).
  - Email input with autofocus and validation.
  - Password input with toggle visibility (`Eye` / `EyeOff`).
  - Remember-me checkbox for 7-day session persistence.
  - Sign-in button with loading spinner state (`Loader2`).
  - Friendly error banner and security compliance notice.
  - Wrapped with `<Suspense>` for search params hydration safety.

### 4. Responsive Admin Dashboard Layout & Pages
- [x] Created `app/admin/(dashboard)/layout.js`:
  - Responsive dark sidebar with AK Kiosk Admin branding.
  - Main menu: Dashboard, Products, Orders, Inquiries, Subscribers, Settings.
  - Bottom section: Help, Admin Profile, Logout action.
  - Active navigation highlighting (`bg-ak-burgundy`).
  - Collapsible mobile drawer with backdrop.
  - Top header with breadcrumb, live store quick link, and status badge.
- [x] Created `app/admin/(dashboard)/dashboard/page.js`:
  - Welcome banner with operations hub overview.
  - 4 Stat Cards: Total Products (live MongoDB query), Total Orders (0), Pending Orders (0), Total Revenue (€0.00).
  - Quick action links: Products, Orders, Customer Storefront.
  - Recent Orders clean empty state.
  - Database status indicator (MongoDB Atlas `akkiosk` Connected).
- [x] Created placeholder routes with shared admin layout:
  - `app/admin/(dashboard)/products/page.js` (`/admin/products`)
  - `app/admin/(dashboard)/orders/page.js` (`/admin/orders`)
  - `app/admin/(dashboard)/inquiries/page.js` (`/admin/inquiries`)
  - `app/admin/(dashboard)/subscribers/page.js` (`/admin/subscribers`)
  - `app/admin/(dashboard)/settings/page.js` (`/admin/settings`)
  - `app/admin/(dashboard)/help/page.js` (`/admin/help`)
  - `app/admin/(dashboard)/profile/page.js` (`/admin/profile`)

---

## 📋 Stage 5: Admin Panel Stage 2 — Product Management (CRUD & Media)

### 1. Database Schema & Model Enhancements
- [x] Enhanced `models/Product.js`:
  - Added support for `discountPrice` (optional number, min 0) and `originalPrice` (optional number, min 0).
  - Added support for `sku` (optional string, trimmed).
  - Added support for multi-image array `images: [String]` (up to 3 images).
  - Implemented synchronous `pre("validate")` hook to automatically synchronize primary `image` with `images[0]` and vice versa for 100% backward compatibility with customer storefront cards and pages.
- [x] Created `models/Category.js`:
  - Schema with `name` (required, trimmed), `slug` (required, lowercase), and `description`.
  - Added unique collation index `{ name: 1 }` with `{ locale: "en", strength: 2 }` to enforce case-insensitive uniqueness at the database layer.

### 2. Backend API Handlers & Route Security
- [x] Protected `POST /api/products`:
  - Enforced administrator authentication via `ADMIN_COOKIE_NAME` and `verifyAdminToken`. Returns HTTP 401 Unauthorized for unauthenticated calls.
  - Server-side validation for `name`, `price`, `description`, `category`, `stock`, `images`, and optional numeric fields.
  - Returns HTTP 201 Created with saved MongoDB document.
- [x] Created `app/api/products/[id]/route.js`:
  - **`GET /api/products/[id]`**: Retrieves single product by its MongoDB `_id` with 400 invalid ID format and 404 not found handling.
  - **`PUT /api/products/[id]`**: Protected with admin authentication. Validates updated fields and persists changes via `findByIdAndUpdate`.
  - **`DELETE /api/products/[id]`**: Protected with admin authentication. Permanently deletes product document from MongoDB Atlas.
- [x] Created `app/api/categories/route.js`:
  - **`GET /api/categories`**: Retrieves categories from the `Category` collection and merges distinct categories from the `Product` collection. Auto-seeds default starter categories if empty.
  - **`POST /api/categories`**: Protected with admin authentication. Performs case-insensitive regex duplicate checks and returns HTTP 409 Conflict if already present.
- [x] Cloudinary Media Integration (`lib/cloudinary.js` & `app/api/admin/upload/route.js`):
  - Created `lib/cloudinary.js` with Cloudinary SDK v2 configuration and `isCloudinaryConfigured()` status checker.
  - Created `app/api/admin/upload/route.js`: Protected with admin authentication. Parses multipart `request.formData()`, validates MIME types (JPEG, PNG, WEBP, GIF) and file size (<= 5MB).
  - Securely streams image upload to Cloudinary folder `ak-kiosk/products` without exposing the Cloudinary API secret to client browsers.
  - Graceful fallback: If Cloudinary credentials are not configured in `.env.local`, returns HTTP 503 with helpful instructions while allowing administrators to enter direct image URLs.

### 3. Product Management Admin Interface (`app/admin/(dashboard)/products/page.js`)
- [x] **Responsive Layout & Visual Hierarchy**:
  - Desktop responsive table view with product thumbnails, name, SKU, category badges, formatted Euro pricing, stock units, stock badges, and action buttons.
  - Mobile card view with image preview, stock status, and quick edit/delete buttons.
- [x] **Catalog Statistics Cards**:
  - Live metric counters for **Total Products**, **In Stock** (>10 units), **Low Stock** (1-10 units), and **Out of Stock** (0 units).
- [x] **Real-time Search & Multi-Filter Bar**:
  - Instant search input matching product name, SKU, and description.
  - Category filter dropdown populated dynamically from `/api/categories`.
  - Stock status filter dropdown (All, In Stock, Low Stock, Out of Stock).
  - One-click "Reset Filters" action button.
- [x] **Add / Edit Product Modal**:
  - Dynamic modal supporting both product creation and live editing.
  - Required fields: Product Name, Category, Price, Stock Quantity, Description, Images.
  - Optional fields: Original Price (strike-through), SKU / Barcode.
  - Inline category creator: allows creating and selecting new categories on the fly without leaving the modal.
  - Multi-image manager: Upload file to Cloudinary and/or enter direct image URLs (up to 3 images) with thumbnail previews, "Primary" indicator, and removal buttons.
  - Inline client validation with clear error messaging.
- [x] **Delete Confirmation Dialog**:
  - Accessible modal dialog confirming permanent deletion with item name and loading spinner.
- [x] **Polished State Handling**:
  - Loading spinner, retry error card, empty state with "Add First Product" CTA, and animated toast feedback banners for successes and errors.

### 4. Configuration & Domain Whitelisting
- [x] Updated `next.config.mjs` with `res.cloudinary.com` remote pattern for Next.js Image component optimization.
- [x] Updated `.env.example` with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

### 5. Automated Verification & Testing
- [x] Created test suite `scripts/test-stage2.mjs` executing 28 automated integration tests:
  1. `GET /api/products`: 200 OK and valid JSON array.
  2. Unauthenticated `POST /api/products`: 401 Unauthorized.
  3. Unauthenticated `PUT /api/products/[id]`: 401 Unauthorized.
  4. Unauthenticated `DELETE /api/products/[id]`: 401 Unauthorized.
  5. Unauthenticated `POST /api/categories`: 401 Unauthorized.
  6. Unauthenticated `POST /api/admin/upload`: 401 Unauthorized.
  7. Public `GET /api/categories`: 200 OK.
  8. Admin login authentication and session cookie reception: 200 OK.
  9. Category creation: 201 Created.
  10. Category case-insensitive duplicate check: 409 Conflict.
  11. Authenticated product creation: 201 Created.
  12. Product image synchronization (`image === images[0]`): Passed.
  13. `GET /api/products/[id]`: 200 OK.
  14. `PUT /api/products/[id]`: 200 OK with verified updated price & stock.
  15. `DELETE /api/products/[id]`: 200 OK.
  16. Verify deleted product returns: 404 Not Found.
  17. Customer storefront `/shop`: 200 OK.
  18. Admin products page `/admin/products`: 200 OK.
  - **Result**: `TEST SUMMARY: 28 PASSED, 0 FAILED`.
- [x] Full production build verification: `npm run build` executed successfully with exit code 0 across all 24 routes.

### 6. Cloudinary Environment Configuration & Diagnostics Resolution
- [x] **Investigation & Root Cause Analysis**:
  - Investigated message `"Cloudinary credentials are not configured"` displayed in Product Management UI.
  - Checked `.env.local` keys without exposing values: verified `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` were all correctly present with valid lengths.
  - Identified root cause: In Node.js / Next.js, environment variables from `.env.local` are loaded into `process.env` at server process initialization. The dev server had been started prior to the addition of the Cloudinary keys to `.env.local`, so the running process did not yet hold those values.
  - Secondary issue addressed: In `lib/cloudinary.js`, `cloudinary.config` was previously executed only once statically at top-level import. Added dynamic `configureCloudinary()` and environment value sanitization (trimming whitespace and stripping redundant quotes) to ensure the Cloudinary SDK is always initialized with live values.
  - Diagnostic endpoint: Added `GET /api/admin/upload` allowing authenticated admin requests to query Cloudinary configuration readiness safely without exposing credentials.
- [x] **Server Restart & Verification**:
  - Restarted Next.js development server to pick up the newly added `.env.local` keys.
  - Executed automated detection test `scripts/test-cloudinary-detect.mjs`:
    - `GET /api/admin/upload`: Returned HTTP 200 with `configured: true` and `"Cloudinary is configured and ready"`.
    - `POST /api/admin/upload`: Successfully uploaded test image buffer to Cloudinary (`status: 200`, `success: true`) and received valid secure Cloudinary URL (`https://res.cloudinary.com/...`).
  - Executed full regression test suite `scripts/test-stage2.mjs`: All 28 tests passed (28 passed, 0 failed).

---

## 📋 Stage 6: Shopping Cart, Checkout, Orders & Email Notifications

### 1. Cart System Overhaul (`context/CartContext.jsx`, `app/cart/page.js`)
- [x] **Removed** static pre-seeded PRODUCTS items — cart now starts empty.
- [x] **Added** `localStorage` persistence: cart loads on mount, persists on every item change.
- [x] **Normalised** item key to `item._id || item.id` throughout CartContext and cart page — supports both MongoDB products (`_id`) and any static products (`id`).
- [x] **Stock enforcement**: `addToCart` and `updateQuantity` respect `item.stock` — cannot exceed available quantity.
- [x] **Hydration flag** (`hydrated`) prevents SSR mismatch; checkout page redirects to `/cart` when cart is empty post-hydration.
- [x] **Cart page** updated to use `item._id || item.id` as React key and for `updateQuantity`/`removeFromCart` calls; shows "Max stock reached" when at stock limit.

### 2. Order Model (`models/Order.js`)
- [x] Created `models/Order.js` with full Mongoose schema:
  - Auto-generated `orderNumber` in format `AK-YYMMDD-XXXXXXXX` (unique, indexed).
  - `customer` sub-schema: fullName, email, phone, address, city, postalCode, country.
  - `items` array sub-schema: productId ref, name, category, image, sku, priceAtOrder, quantity, lineTotal.
  - Order fields: subtotal, deliveryFee, total, deliveryMethod (delivery/pickup), paymentMethod (cod/stripe), paymentStatus (pending/paid/failed/refunded), orderStatus (pending/confirmed/canceled).
  - Stripe fields: stripeSessionId, stripePaymentIntentId.
  - Email tracking: adminNotificationSent, customerNotificationSent.
  - Timestamps; indexes on orderNumber, customer.email, orderStatus, paymentStatus, createdAt, stripeSessionId.
- [x] Removed leftover unused `import { nanoid } from "crypto"` (was causing lint warning).

### 3. Nodemailer Email Utility (`lib/mailer.js`)
- [x] Created `lib/mailer.js` with:
  - `createTransporter()`: reads SMTP_HOST/PORT/SECURE/USER/PASS; returns null gracefully if unconfigured.
  - `buildAdminEmailHtml(order)`: branded HTML admin notification with order table, customer info, delivery details, totals, payment badge.
  - `buildCustomerEmailHtml(order)`: branded HTML customer confirmation with order summary and fulfillment details.
  - `sendAdminOrderNotification(order)` → `{ sent, error? }`.
  - `sendCustomerOrderConfirmation(order)` → `{ sent, error? }`.
  - `sendOrderEmails(order)` → `{ admin, customer }` — fire-and-forget, never throws.
  - SMTP failures logged without exposing credentials; never block order creation.

### 4. COD Orders API (`app/api/orders/route.js`)
- [x] **`POST /api/orders`**: Cash on Delivery order creation:
  - Server-side customer validation (fullName, email, address fields for delivery).
  - Items resolved from MongoDB (server-side price verification — browser prices never trusted).
  - Stock validation per item; returns 409 Conflict if insufficient.
  - Totals recalculated server-side (€3.50 delivery fee; free above €35; pickup always free).
  - Stock deducted atomically after validation.
  - Order created in MongoDB (`paymentStatus: "pending"`, `orderStatus: "pending"`).
  - Email notifications sent (non-blocking). adminNotificationSent/customerNotificationSent tracked.
  - Returns `{ orderNumber, orderId, total }`.
- [x] **`GET /api/orders?orderNumber=&email=`**: Public order lookup by order number + email address.

### 5. Stripe Payments API (`app/api/orders/stripe/route.js`)
- [x] **`POST /api/orders/stripe`**:
  - Returns 503 if `STRIPE_SECRET_KEY` not configured.
  - Same server-side validation as COD endpoint.
  - Creates a PENDING order in MongoDB (stock NOT deducted — only after webhook confirms payment).
  - Builds `line_items` from MongoDB prices (in cents — browser prices never used).
  - Creates Stripe Checkout Session with `metadata: { orderId, orderNumber }`.
  - Stores `stripeSessionId` on order.
  - Returns `{ checkoutUrl, orderNumber }` for client redirect.

### 6. Stripe Webhook (`app/api/orders/stripe/webhook/route.js`)
- [x] Created webhook handler:
  - Uses `request.text()` (raw body) for Stripe signature verification via `stripe.webhooks.constructEvent`.
  - `checkout.session.completed`: finds order by `session.metadata.orderId`, idempotency check (`paymentStatus === "paid"`), updates paymentStatus → "paid" + orderStatus → "confirmed", deducts stock, sends emails.
  - `checkout.session.expired`: sets paymentStatus → "failed" + orderStatus → "canceled".
  - Always returns HTTP 200 to Stripe; processing errors are logged, not propagated.
  - Route is NOT under `/api/admin/*` — excluded from admin JWT middleware matcher.

### 7. Admin Orders API
- [x] **`GET /api/admin/orders`** (already existed, confirmed working):
  - Admin-protected (JWT cookie).
  - Supports: `search`, `orderStatus`, `paymentStatus`, `paymentMethod`, `page`, `limit`.
  - Returns paginated list with total count.
- [x] Created **`GET /api/admin/orders/[id]`**: Admin-protected, returns full order by MongoDB `_id`.
- [x] Created **`PATCH /api/admin/orders/[id]`**: Admin-protected, updates `orderStatus`; validates against allowed enum (`pending/confirmed/canceled`); returns 400 on invalid status.

### 8. Admin Stats Enhancement (`app/api/admin/stats/route.js`)
- [x] Updated to include real Order data:
  - `totalOrders`: `Order.countDocuments()`.
  - `pendingOrders`: `Order.countDocuments({ orderStatus: "pending" })`.
  - `totalRevenue`: aggregated sum of `total` for paid orders.
  - `recentOrders`: last 5 orders (name, total, status, date).
  - Runs all queries in parallel via `Promise.all`.

### 9. Checkout Page (`app/checkout/page.js`) — Full Rewrite
- [x] `"use client"` component with full form state management.
- [x] Delivery method selection: Home Delivery / Store Pickup (with store address displayed).
- [x] Payment method selection: Cash on Delivery / Online (Stripe).
- [x] Collects: fullName, email, phone, address, city, postalCode, country, notes.
- [x] Address fields shown/hidden based on delivery method.
- [x] Client-side validation with inline error messages per field.
- [x] **COD flow**: `POST /api/orders` → on success: `clearCart()`, shows in-page order confirmation with order number.
- [x] **Stripe flow**: `POST /api/orders/stripe` → on success: `clearCart()` then `window.location.href = checkoutUrl` (Stripe hosted page).
- [x] Loading state with spinner during submission; error banner on API failure.
- [x] Redirects to `/cart` if cart is empty (post-hydration).
- [x] Delivery fee displayed live (€3.50 if subtotal < €35; free above €35; free for pickup).

### 10. Order Confirmation Page (`app/order-confirmation/page.js`)
- [x] Created at `/order-confirmation`.
- [x] Reads `?orderNumber=` and `?email=` from URL params.
- [x] Fetches `GET /api/orders?orderNumber=&email=` to display order status.
- [x] Displays: order number, orderStatus badge, paymentStatus badge, items table, delivery method, totals, payment method.
- [x] Wrapped in `<Suspense>` for `useSearchParams` hydration safety.
- [x] Loading, error, and success states.
- [x] Used as Stripe `success_url`.

### 11. Admin Orders Dashboard (`app/admin/(dashboard)/orders/page.js`) — Full Implementation
- [x] Replaced placeholder with full interactive dashboard:
  - Stat cards: Total Orders, Pending, Confirmed, Canceled.
  - Search bar (order number, customer name, email).
  - Filters: orderStatus, paymentStatus, paymentMethod.
  - Responsive table: order number, date, customer, payment method badge, payment status badge, order status badge, total.
  - Expandable row: full customer info, delivery address/pickup details, items breakdown, status update buttons.
  - Inline order status update (Pending / Confirmed / Canceled) via `PATCH /api/admin/orders/[id]`.
  - Pagination (prev/next, total count).
  - Loading spinner, empty state, error state with retry.
  - Refresh button.

### 12. Environment Configuration (`.env.example`)
- [x] Added all Stage 3 placeholders:
  - `ADMIN_NOTIFICATION_EMAIL`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_BASE_URL`

### 13. Dependencies (`npm install`)
- [x] `stripe` — Stripe server-side SDK.
- [x] `nodemailer` — SMTP email sending.

### 14. Test Scripts
- [x] Created `scripts/test-stage3.mjs` — 13 automated public API tests (no auth required).
- [x] Created `scripts/test-stage3-auth.mjs` — 8 authenticated admin order API tests.

### 15. Actual Test Results

#### Public API Tests (`test-stage3.mjs`)
| Test | Result |
|---|---|
| GET /api/products → 200 | ✅ 3 products |
| GET /api/categories → 200 | ✅ |
| POST /api/orders (missing customer) → 400 | ✅ |
| POST /api/orders (stripe at COD endpoint) → 400 | ✅ |
| POST /api/orders (valid COD) → 201 | ✅ AK-261030-KWFQRQ5J |
| POST /api/orders (over stock) → 409 | ✅ Insufficient stock error |
| GET /api/orders (no params) → 400 | ✅ |
| GET /api/orders (valid lookup) → 200 | ✅ Order retrieved |
| GET /api/orders (wrong order) → 404 | ✅ |
| GET /api/admin/orders (no auth) → 401 | ✅ |
| PATCH /api/admin/orders/[id] (no auth) → 401 | ✅ |
| POST /api/orders/stripe (no STRIPE key) → 503 | ✅ |
| POST webhook (no signature) → 4xx/5xx | ✅ |

#### Authenticated Admin Tests (`test-stage3-auth.mjs`)
| Test | Result |
|---|---|
| POST /api/admin/login → 200 | ✅ |
| GET /api/admin/orders (auth) → 200 | ✅ total=2 |
| GET /api/admin/stats (orders included) | ✅ totalOrders=2 |
| GET /api/admin/orders/[id] → 200 | ✅ |
| PATCH /api/admin/orders/[id] confirmed → 200 | ✅ orderStatus=confirmed |
| PATCH /api/admin/orders/[id] invalid → 400 | ✅ |
| GET /api/admin/orders?search → 200 | ✅ |
| GET /api/admin/orders?orderStatus=pending → 200 | ✅ |

#### Page Compilation
| Page | Result |
|---|---|
| /cart | ✅ 200 |
| /checkout | ✅ 200 |
| /order-confirmation | ✅ 200 |
| /shop | ✅ 200 |
| /admin/orders (unauthenticated) | ✅ Redirects to /admin/login |

### 16. Stripe Environment Configuration Diagnostics & Resilience Update
- [x] **Investigation & Root Cause Analysis**:
  - Investigated user report: `"Online payments are not configured. Please use Cash on Delivery."` occurring despite Stripe keys configured in `.env.local`.
  - Analyzed `app/checkout/page.js` (`handleSubmit` calling `POST /api/orders/stripe` and catching HTTP 503 response message).
  - Analyzed `app/api/orders/stripe/route.js`: identified exact condition `!stripeSecretKey`.
  - Compared variable names: confirmed 100% naming match (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BASE_URL`) across backend routes, `.env.example`, `README.md`, and `.env.local`. Zero credential values were printed or exposed.
  - Identified root cause: The long-running dev server background process had been started before `.env.local` received the Stripe keys, causing the initial server process memory to hold `undefined` for `process.env.STRIPE_SECRET_KEY`.
- [x] **Environment Sanitization & Resilience**:
  - Added `cleanEnv` helper to both `app/api/orders/stripe/route.js` and `app/api/orders/stripe/webhook/route.js`.
  - Automatically strips surrounding double/single quotes and trims whitespace from `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_BASE_URL`.
  - Added safeguard to verify keys are not lingering placeholders (`!stripeSecretKey.startsWith("sk_test_your_")`).
- [x] **Verification & Test Results**:
  - Automated Stage 3 test runner (`scripts/test-stage3.mjs`): **19 passed, 0 failed**.
  - `POST /api/orders/stripe`: Returned **HTTP 201 Created** with live Stripe session URL (`https://checkout.stripe.com/...`) and order number.
  - `POST /api/orders` (Cash on Delivery): Verified intact and returning **HTTP 201 Created**.
  - Unauthenticated admin checks: Returned **HTTP 401**.
  - Authenticated admin order & stats checks: Returned **HTTP 200**.
  - Webhook signature validation: Returned **HTTP 400** on unsigned request.
  - Production build verification: `npm run build` succeeded with **exit code 0** across all 25 routes.

### 17. Real Stripe Test-Mode Checkout & Webhook Investigation & Resilience Fixes
- [x] **Issue 1 Investigation — Checkout Remains Loading After Payment**:
  - **Root Cause**: `NEXT_PUBLIC_BASE_URL` in `.env.local` was configured to `http://localhost:3001`, but the application was being accessed on port `3000`. Stripe Checkout redirected customers to `localhost:3001` where no server was listening, causing the browser to hang. Furthermore, `/order-confirmation` only accepted `orderNumber` + `email` query parameters and did not support Stripe's `{CHECKOUT_SESSION_ID}`.
  - **Resolution**:
    1. Implemented secure dynamic `resolveBaseUrl(request)` in `app/api/orders/stripe/route.js`. In development, it validates the request's `Origin` or `Host` against loopback addresses (`localhost`, `127.0.0.1`, `::1`) to avoid port-mismatch hangs while strictly blocking arbitrary host injection. In production, it defaults to the canonical `NEXT_PUBLIC_BASE_URL`.
    2. Appended `{CHECKOUT_SESSION_ID}` placeholder to `success_url` (`/order-confirmation?session_id={CHECKOUT_SESSION_ID}&orderNumber=...`).
    3. Updated `app/order-confirmation/page.js` to read `session_id` or `sessionId` and query `/api/orders?sessionId=...`.
    4. Enhanced `GET /api/orders` in `app/api/orders/route.js` to securely retrieve the session from Stripe via `stripe.checkout.sessions.retrieve()`, verify `session.payment_status === "paid"`, match the stored order, mark it as `paid` and `confirmed`, deduct inventory stock, and trigger order emails if not already processed.
    5. Preserved existing `orderNumber` + `email` lookup for COD and direct customer order tracking.
- [x] **Issue 2 Investigation — Admin Notification Email Not Received**:
  - **Root Cause**: In local development, Stripe cloud servers cannot directly push HTTP requests to private `localhost` addresses without a local webhook forwarder (`stripe listen --forward-to localhost:3000/api/orders/stripe/webhook`). Because the local webhook route was never invoked, the order remained in `paymentStatus: "pending"` and `sendOrderEmails()` was never executed.
  - **Resolution**:
    1. Implemented server-side payment verification fallback in `app/api/orders/route.js` triggered when the customer lands on `/order-confirmation?session_id=...`. If the local webhook has not arrived yet, the server verifies payment status directly with Stripe, marks the order as paid, and dispatches the email notifications.
    2. Applied `cleanEnv()` sanitization to `lib/mailer.js` for all SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_NOTIFICATION_EMAIL`).
    3. Confirmed admin notification recipient uses `ADMIN_NOTIFICATION_EMAIL` (not `ADMIN_EMAIL`).
    4. Added idempotency protection (`adminNotificationSent` and `customerNotificationSent` flags in `models/Order.js`) across both the order confirmation route and the webhook handler to prevent duplicate emails when Stripe retries webhook delivery.
- [x] **Verification & Test Results**:
  - `scripts/test-fixes.mjs`: **8 passed, 0 failed** (Stripe session creation, `{CHECKOUT_SESSION_ID}` placeholder, dynamic loopback origin, secure sessionId verification, invalid ID handling, valid paid session handling, duplicate webhook idempotency).
  - `scripts/test-stage3.mjs`: **19 passed, 0 failed**.
  - `scripts/test-stage3-auth.mjs`: **8 passed, 0 failed**.
  - `npm run build`: Production build verified with **exit code 0** across all 25 routes.

### 18. Concurrency & Data-Integrity Audit: Atomic Payment Processing & Duplicate Prevention
- [x] **Pre-Implementation Concurrency Audit**:
  - Identified race window between `POST /api/orders/stripe/webhook` and `GET /api/orders?sessionId=...`: both routes could previously read `paymentStatus === "pending"` simultaneously, leading to double stock deduction (`$inc: { stock: -qty }`) and duplicate email dispatches.
  - Identified notification retry edge case: partial email failure previously risked resending already-delivered notifications.
- [x] **Atomic Payment Finalization (`lib/orderFinalizer.js`)**:
  - Implemented `finalizeStripePayment()` utilizing atomic conditional updates (`paymentStatus: { $ne: "paid" }`) coupled with MongoDB multi-document transactions where supported.
  - Guaranteed: Exactly ONE worker can claim an order for finalization.
  - Guaranteed: Inventory stock is deducted exactly once across all concurrent and retried executions.
  - Guaranteed: Redundant or concurrent webhook/fallback requests return the finalized order without re-deducting stock.
- [x] **Independent Notification State Machine (`lib/mailer.js` & `models/Order.js`)**:
  - Enhanced `models/Order.js` schema with: `paidAt`, `adminNotificationLock`, `customerNotificationLock`, `adminNotificationError`, `customerNotificationError`.
  - Implemented atomic lease locking (30-second TTL) inside `sendOrderEmails()` ensuring only one process can hold the lease to send the admin or customer notification.
  - Admin and customer notification delivery states are tracked completely independently: failed customer email delivery can be retried without re-sending the admin email.
  - Order payment status and stock deduction remain completely decoupled from transient email failures.
- [x] **Verification & Concurrency Test Results (`scripts/test-concurrency.mjs`)**:
  - Simulated two simultaneous webhook deliveries for the same payment: exactly one stock deduction (100 -> 98).
  - Simulated simultaneous webhook and order-confirmation fallback requests: stock deducted exactly once (98 -> 93).
  - Simulated 3 consecutive webhook retries: stock remained unchanged at 93 (zero double deductions).
  - Verified duplicate email prevention under concurrency: atomic lease locking acquired once.
  - Simulated partial email failure followed by retry: admin notification remained sent (not duplicated), while customer email was retried.
  - Simulated unpaid session (`payment_status: "unpaid"`): order was NOT marked as paid and stock was NOT deducted.
  - **Concurrency Suite**: **19 passed, 0 failed**.
  - **Stage 3 API Suite** (`scripts/test-stage3.mjs`): **19 passed, 0 failed**.
  - **Authenticated Admin Suite** (`scripts/test-stage3-auth.mjs`): **8 passed, 0 failed**.
  - **Fixes & Security Suite** (`scripts/test-fixes.mjs`): **8 passed, 0 failed**.
  - **Production Build** (`npm run build`): Verified exit code 0 across all 25 routes.

### 19. Crash-Recovery & Transaction Hardening
- [x] **Mandatory Multi-Document Transactions (`lib/orderFinalizer.js`)**:
  - Eliminated silent non-transactional fallback. Multi-document transactions are strictly required for payment finalization.
  - Refactored payment finalization to use Mongoose `session.withTransaction()`, ensuring that `paymentStatus: "paid"`, `orderStatus: "confirmed"`, `stockDeducted: true`, and all item stock deductions commit atomically as an all-or-nothing unit.
  - If a crash, database error, or failure occurs mid-flight, MongoDB aborts the entire transaction, leaving the order in its original `pending` state with stock completely untouched.
  - Returns `transient: true` on transaction failures, causing the Stripe webhook handler (`app/api/orders/stripe/webhook/route.js`) to return HTTP 500 so Stripe automatically retries.
- [x] **Stock Deduction State Tracking (`models/Order.js`)**:
  - Added `stockDeducted: { type: Boolean, default: false }` to the Mongoose Order schema.
  - Guaranteed: `stockDeducted` is set to `true` within the same atomic transaction as the stock decrement.
  - Legacy & Migration Safety: If an order already has `paymentStatus === "paid"` or `stockDeducted === true`, it is identified as already finalized, preventing double stock deductions for pre-existing orders.
- [x] **Email Notification Reliability & Deterministic Message-ID (`lib/mailer.js`)**:
  - Implemented `getOrderMessageId(orderNumber, recipientType)` generating deterministic RFC 2822 Message-ID headers:
    - Admin: `<order-${order.orderNumber}-admin@ak-kiosk.de>`
    - Customer: `<order-${order.orderNumber}-customer@ak-kiosk.de>`
  - Included `X-Entity-Ref-ID` headers to assist receiving mail systems and email clients in deduplicating incoming messages.
  - Preserved independent lease locking (30s TTL) and independent sent-flag tracking for retries.
  - Documented the inherent distributed systems boundary constraint: while Message-ID headers assist client-side deduplication, if an external SMTP server accepts an email and the server crashes before recording the delivery flag in MongoDB, a retry after the 30s lock timeout provides an at-least-once delivery guarantee.
- [x] **Verification & Crash-Recovery Test Results (`scripts/test-crash-recovery.mjs`)**:
  - Scenario 1: Deterministic Message-ID generation and format validation (passed).
  - Scenario 2: Simulated crash during multi-item stock deduction — verified complete transaction rollback; order remained `pending` and stock remained unchanged (passed).
  - Scenario 3: Stripe webhook returns HTTP 500 on transaction failure and succeeds on retry (passed).
  - Scenario 4: Duplicate webhook delivery on finalized order returns HTTP 200 with zero stock change (passed).
  - Scenario 5: Legacy paid order safety — existing paid orders never re-deduct stock (passed).
  - Scenario 6: Transactions unavailable safe abort — returns transient error without marking order paid (passed).
  - **Crash-Recovery Suite**: **21 passed, 0 failed**.
  - **Concurrency Suite** (`scripts/test-concurrency.mjs`): **19 passed, 0 failed**.
  - **Fixes Suite** (`scripts/test-fixes.mjs`): **8 passed, 0 failed**.
  - **Stage 3 API Suite** (`scripts/test-stage3.mjs`): **19 passed, 0 failed**.
  - **Authenticated Admin Suite** (`scripts/test-stage3-auth.mjs`): **8 passed, 0 failed**.
  - **Production Build** (`npm run build`): Verified exit code 0 across all 25 routes.

---

## 📊 Current Project Status

- **Build Status**: Production build passing (`npm run build` exited with code 0 across 25 routes).
- **Customer Frontend**: Cart (localStorage-persisted), Checkout (COD + Stripe Online), Order Confirmation (session_id & orderNumber lookup), Shop, Home — all operational.
- **Admin Management**: Full Product Catalog CRUD at `/admin/products`; full Order management at `/admin/orders`.
- **Backend APIs**:
  - `/api/health` — Connected (HTTP 200)
  - `/api/products` — Operational (GET public, POST admin-protected)
  - `/api/products/[id]` — Operational (GET public, PUT/DELETE admin-protected)
  - `/api/categories` — Operational (GET public, POST admin-protected)
  - `/api/admin/upload` — Operational (Cloudinary, admin-protected)
  - `/api/admin/login` — Operational
  - `/api/admin/logout` — Operational
  - `/api/admin/me` — Operational
  - `/api/admin/stats` — Operational (includes real order counts + revenue)
  - `/api/admin/orders` — Operational (admin-protected, paginated, filterable)
  - `/api/admin/orders/[id]` — Operational (GET + PATCH, admin-protected)
  - `/api/orders` — Operational (POST COD + GET public lookup via orderNumber+email or verified Stripe sessionId)
  - `/api/orders/stripe` — Operational (sanitized env reading, dynamic loopback origin, creates live Stripe sessions with `{CHECKOUT_SESSION_ID}`)
  - `/api/orders/stripe/webhook` — Operational (sanitized env reading, signature verification active, idempotent email tracking)
- **Database**: MongoDB Atlas (`akkiosk`) — `products`, `categories`, `admins`, `orders` collections active.
- **Authentication**: Admin JWT sessions, bcrypt passwords.
- **Payments**: Stripe online payment active and verified; Cash on Delivery active and verified.
- **Email**: Nodemailer integration active with safe env sanitization and dual verification (webhook + order confirmation fallback).

---

## 🔮 Remaining Tasks & Next Implementation Steps

### Stage 6 (Optional / Store-Specific Configuration)
- [x] Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local` and test live Stripe payments.
- [x] Configure SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_NOTIFICATION_EMAIL`) and verify live email dispatch.
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production domain for Stripe redirect URLs in live deployment.
- [ ] Configure Stripe webhook endpoint in Stripe Dashboard pointing to `https://yourdomain.com/api/orders/stripe/webhook`.
- [ ] For local webhook development, run: `stripe listen --forward-to localhost:3000/api/orders/stripe/webhook`.

### Stage 7: Inquiries & Marketing Management (Completed & Verified)
- [x] **Customer Contact Inquiries**:
  - Created `models/Inquiry.js` with fields for `name`, `email`, `subject`, `message`, `status` (`new`, `in_progress`, `resolved`), `ipAddress`, and `adminNotes`.
  - Public contact submission endpoint at `POST /api/inquiries` with IP rate-limiting (5 per 10 min), input sanitization, database storage, and non-blocking admin email notification.
  - Interactive Contact page UI at `app/contact/page.js` with client validation, loading, success, and error states.
  - Admin inquiry management at `GET /api/admin/inquiries`, `PATCH /api/admin/inquiries`, and `DELETE /api/admin/inquiries` protected via `requireAdmin`.
  - Admin Inquiries dashboard UI at `app/admin/(dashboard)/inquiries/page.js` with status filtering, search, pagination, detail modal, and delete confirmation.
- [x] **Newsletter Subscribers**:
  - Created `models/Subscriber.js` with `email`, `isActive`, `unsubscribeToken`, and `source`.
  - Public newsletter endpoint at `POST /api/subscribers` with IP rate limiting, email normalization, duplicate handling, and reactivation.
  - Customer footer newsletter UI at `components/layout/Footer.jsx` with real-time feedback and state handling.
  - Admin subscriber management at `GET /api/admin/subscribers` and `DELETE /api/admin/subscribers` with pagination, search, and CSV export (`GET ?format=csv`).
  - Added CSV formula injection mitigation (`escapeCsv`) to sanitize exported cells.
  - Admin Subscribers dashboard UI at `app/admin/(dashboard)/subscribers/page.js` with live list, search, pagination, CSV download, and delete confirmation.

---

## 📋 Stage 8: Customer Authentication & Account Management (Completed & Verified)

### 1. Architecture & Security Foundations
- [x] Created `models/Customer.js`:
  - `name`: String, required, trimmed, max 100 characters.
  - `email`: String, required, unique index, lowercase, trimmed, max 254 characters.
  - `password`: String, required (hashed using `bcryptjs` with 12 salt rounds; never stored plain-text).
  - `role`: String, default `"customer"`, strictly enum-restricted to `["customer"]` to prevent privilege escalation attacks.
  - `isActive`: Boolean, default `true`.
  - `address` and `phone` profile fields.
- [x] Created `lib/customerAuth.js`:
  - Independent customer cookie: `ak_customer_session` (completely isolated from `ak_admin_session`).
  - Independent customer signing secret: `CUSTOMER_JWT_SECRET` with secure development fallback.
  - Password hashing and comparison using `bcryptjs`.
  - Cryptographically signed JWT tokens via `jose` with `HS256` (24h default or 7d remember-me).
  - Secure HTTP-only cookie configuration: `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`.

### 2. Customer Authentication Endpoints
- [x] **`POST /api/auth/register`**:
  - Server-side rate limiting (10 attempts per 10 minutes per IP).
  - Input validation: required name, email regex, confirm password matching.
  - Password strength validation: min 8 characters, alphanumeric (letters & numbers required).
  - Duplicate email detection with HTTP 409 Conflict.
  - Forced `customer` role assignment (blocks admin/trainer role injection).
  - Automatic session creation and HTTP-only cookie setting upon successful registration.
  - Never returns password hashes in API responses.
- [x] **`POST /api/auth/login`**:
  - Server-side rate limiting (10 attempts per 10 minutes per IP).
  - Credentials validation with generic error messages ("Invalid email address or password") to prevent email enumeration.
  - Account status verification (`isActive`).
  - Sets secure HTTP-only `ak_customer_session` cookie on success.
- [x] **`POST /api/auth/logout`**:
  - Clears `ak_customer_session` cookie (`maxAge: 0`, `expires: epoch`).
- [x] **`GET /api/auth/me`**:
  - Verifies customer JWT from cookie and returns customer profile excluding password.
  - Returns HTTP 401 when unauthenticated.
- [x] **`GET /api/account/orders`**:
  - Protected endpoint authenticating customer session.
  - Scoped strictly to the authenticated customer's email from verified JWT payload.
  - Prevents cross-account order access.

### 3. Edge Route Guarding & Context
- [x] Updated `middleware.js`:
  - Added route matching for `/account/:path*` and `/api/account/:path*`.
  - Validates `ak_customer_session` using `CUSTOMER_JWT_SECRET`.
  - Unauthenticated visits to `/account` redirect to `/login?from=/account`.
  - Admin routes (`/admin/*`, `/api/admin/*`) remain strictly guarded with `ak_admin_session` and `ADMIN_JWT_SECRET`.
- [x] Enhanced `context/AuthContext.jsx`:
  - Automatic session restoration on load via `/api/auth/me`.
  - Exposed `login`, `register`, `logout`, `user`, `loading`, and `isLoggedIn`.
  - Zero storage of passwords or tokens in `localStorage`.
- [x] Customer Account Page at `app/account/page.js`:
  - Verified customer profile card.
  - Live order history with status badges, delivery details, and collapsible item drawers.
  - Sign out button with redirection to `/`.
  - Loading skeleton, empty state with "Start Shopping" button, and error alerts.
- [x] Login & Register Pages (`app/login/page.js` & `app/register/page.js`):
  - Preserves intended destination (`?from=...`) with seamless post-auth redirection.
  - Password visibility toggles on password and confirm password fields.
  - Real-time password strength indicators.
  - Wrapped in `<Suspense>` for safe client rendering and Next.js static generation.
- [x] Integrated Storefront Navigation:
  - Updated `components/layout/Navbar.jsx` with direct links to "My Account & Orders" and "Sign Out".
  - Updated `components/layout/MobileMenu.jsx` with account drawer items.
  - Pre-populates customer details on `/checkout` for authenticated shoppers while preserving guest checkout.

### 4. Verification & Testing
- [x] **Stage 8 Comprehensive Automated Test Suite (`scratch/stage8_test.mjs`)**:
  - Scenario 1 & 2: Rejection of empty name, invalid email, and mismatched confirmPassword (passed).
  - Scenario 3: Duplicate email rejection with HTTP 409 (passed).
  - Scenario 4: Rejection of weak passwords (< 8 chars, letters only, numbers only) (passed).
  - Scenario 5: Successful registration & login with correct credentials and HTTP-only cookie issuance (passed).
  - Scenario 6: Rejection of wrong password and non-existent email with generic enumeration-safe errors (passed).
  - Scenario 7: Session restoration via `GET /api/auth/me` without password hash exposure (passed).
  - Scenario 8: Successful logout and cookie invalidation (passed).
  - Scenario 9: Unauthenticated access prevention to `/api/account/orders` with HTTP 401 (passed).
  - Scenario 10 & 11: Multi-tenant customer order isolation — Customer B strictly cannot access Customer A's orders (passed).
  - Scenario 12: Admin authentication separation — Customer cookies cannot access `/api/admin/*` (passed).
  - Scenario 13: Storefront health and MongoDB Atlas replica set integrity (passed).
  - **Results**: **44 passed, 0 failed**.
- [x] **Database Cleanup**:
  - Targeted deletion script safely removed only the synthetic test customer records (`test_customer_stage8_a@akkiosk-test.de`, `test_customer_stage8_b@akkiosk-test.de`), leaving all real data untouched.
- [x] **Production Build (`npm run build`)**:
  - Verified exit code 0 across all 26 static & dynamic App Router routes (including new `/account` and `/api/auth/*` routes).

---

## 📋 Stage 9 Checklist: Dynamic Product Details & Customer Experience

### 1. Data Modeling & Database Migration
- [x] **`models/Product.js`**:
  - Added indexed `slug` field (lowercase, trimmed, URL-friendly).
  - Exported standalone `slugify(text)` utility helper.
  - Added Mongoose `pre("validate")` hook to automatically generate clean slugs from product name when omitted.
  - Added indexes on `slug`, `category`, and `createdAt` for fast query performance.
  - Synchronized `image` and `images` array (up to 3 images) in validation hook.
- [x] **Database Migration & Backfill**:
  - Migrated existing MongoDB Atlas products to ensure compatible, permanent slugs (`samyang-buldak-hot-chicken-ramen`, `caramel-latte`, `burfi`) without data loss.

### 2. API Routes & Query Resolution
- [x] **`app/api/products/route.js`**:
  - Imports `slugify` and assigns auto-generated slugs upon admin product creation.
  - Case-insensitive category filtering (`?category=...`).
- [x] **`app/api/products/[id]/route.js`**:
  - Dual query support: resolves products by MongoDB `_id` OR `slug`.
  - Preserves or updates slug during admin PUT updates.
  - Returns HTTP 404 for missing or deleted products.

### 3. Server-Rendered Product Detail Page & Client UI
- [x] **`app/product/[slug]/page.js`**:
  - Server Component querying MongoDB Atlas directly via `connectToDatabase()` and `Product.findOne()`.
  - Case-insensitive slug matching (`slug.toLowerCase()`) with ObjectId fallback.
  - Invokes Next.js `notFound()` when product does not exist or was deleted (triggering global 404).
  - Dynamic SEO metadata generation (`generateMetadata`): custom page title with formatted price, truncated description, and OpenGraph images.
  - Related products query: retrieves products from the same category while strictly excluding the current product (`_id: { $ne: currentId }`).
  - Serializes Mongoose documents prior to passing to the client component.
- [x] **`app/product/[slug]/ProductDetailClient.jsx`**:
  - Multi-image gallery with high-resolution main viewport and interactive thumbnail selectors (up to 3 images).
  - Stock availability pill (`In Stock (x)` vs. `Out of Stock`).
  - Automatic discount calculation and pill badge display (`-X%`) when `originalPrice > price`.
  - Interactive quantity selector bounded strictly by available stock (`1 <= quantity <= stock`).
  - Add to Bag button with feedback states: "Add to Bag • €X.XX", "Added to Shopping Bag!", and disabled "Sold Out" state.
  - Store guarantee trust badges: Local Oberhausen delivery, free store pickup, and 100% freshness guarantee.
  - Related products grid section rendering live `ProductCard` components.
- [x] **`app/not-found.js`**:
  - Global branded 404 page featuring architectural navigation frame, helpful messaging, "Explore Shop Catalog" CTA, and "Return to Home" button.

### 4. Global Cart Integration & Stock Enforcement
- [x] **`context/CartContext.jsx`**:
  - Enforces physical inventory constraints in `addToCart`: prevents adding out-of-stock items and clamps quantities to available stock.
  - Normalized product identification (`_id || id`) to eliminate duplicate cart items between static and MongoDB products.
  - Added `refreshCartWithServer()`: queries server API on mount, updates prices to live catalog values, adjusts excessive quantities down to current stock, and purges deleted or depleted items.
  - Returns structured feedback `{ success, message }` for user-facing UI notifications.
- [x] **`components/products/ProductCard.jsx`**:
  - Displays dynamic slug URLs (`/product/${product.slug || product._id}`).
  - Out-of-stock detection: disables Add button, shows "Sold Out" label, and applies muted styling.
- [x] **`components/layout/CartDrawer.jsx` & `app/cart/page.js`**:
  - Updated to link directly to `/product/${item.slug || itemKey}`.
  - Quantity controls clamped to available stock.
- [x] **`components/home/Bestsellers.jsx` & `components/home/NewArrivals.jsx`**:
  - Automatically load and display live catalog products from MongoDB Atlas.
- [x] **`components/layout/SearchModal.jsx`**:
  - Live catalog product search with direct routing to `/product/[slug]`.
- [x] **`app/checkout/page.js`**:
  - Runs `refreshCartWithServer()` on mount to validate cart items, live prices, and stock levels prior to order placement.
  - Preserved COD and Stripe payment execution.

### 5. Category Pages Live Integration
- [x] **`app/categories/groceries/page.js`**: Migrated to live `/api/products?category=groceries` with loading skeletons and empty states.
- [x] **`app/categories/snacks/page.js`**: Migrated to live `/api/products?category=snacks` with loading skeletons and empty states.
- [x] **`app/categories/drinks/page.js`**: Migrated to live `/api/products?category=drinks` with loading skeletons and empty states.

### 6. Verification & Automated Test Suite
- [x] **Stage 9 Automated Test Suite (`scratch/stage9_test.mjs`)**:
  - Test 1: Slug helper validation with spaces, accents, and special characters (passed).
  - Test 2: Existing catalog integrity check — verified 3 existing live products with valid slugs and pricing (passed).
  - Test 3: Synthetic product creation with automatic slug generation and multi-image array storage (passed).
  - Test 4: Product query resolution by slug and by MongoDB ObjectId (passed).
  - Test 5: Related products category query strictly excluding current product (passed).
  - Test 6: Product update (price, stock, and discount computation) (passed).
  - Test 7: Out-of-stock condition handling (passed).
  - Test 8: Product deletion and verification that subsequent queries return `null` (notFound trigger) (passed).
  - Test 9: Admin and customer model integrity check (Stage 1–8 preserved) (passed).
  - **Results**: **26 passed, 0 failed**.
- [x] **Live Server Endpoint Verification**:
  - `GET /api/products`: HTTP 200, returns all 3 products with slugs.
  - `GET /api/products/samyang-buldak-hot-chicken-ramen`: HTTP 200, returns product details.
  - `GET /api/products/nonexistent-item`: HTTP 404.
  - `GET /product/samyang-buldak-hot-chicken-ramen`: HTTP 200, server-rendered with metadata.
  - `GET /product/non-existent-product-slug`: HTTP 404 (invokes `notFound()`).
  - `GET /categories/groceries`, `/categories/snacks`, `/categories/drinks`: All return HTTP 200.
  - `GET /api/health`: HTTP 200.
  - `GET /api/auth/me` & `GET /api/admin/me`: Both return HTTP 401 unauthenticated.
- [x] **Production Build (`npm run build`)**:
  - Verified exit code 0 across all 26 App Router routes including dynamic `/product/[slug]`.

---

## 📋 Stage 10 Checklist: Complete Storefront QA, Regression Testing & Bug Fixing

### 1. Customer Storefront Inspection & Cross-Page Testing
- [x] **Home (`/`)**: Centered-notched architectural navbar, animated hero section with live Buldak ramen quick-add and product page link, department showcases, bestsellers, promotional banner, new arrivals, and store location.
- [x] **Shop (`/shop`)**: Dynamic category tabs (All Items, Asian Groceries, Snacks & Sweets, Drinks & Teas), search, price sorting, loading skeletons, and empty states.
- [x] **Product Details (`/product/[slug]`)**: Server-rendered from MongoDB Atlas, dynamic SEO metadata, thumbnail selector gallery, discount badge, stock-aware quantity controls, out-of-stock disabled states, store guarantees, and related products grid.
- [x] **Category Pages (`/categories/groceries`, `/snacks`, `/drinks`)**: Live catalog data fetched from `/api/products?category=...`, responsive grids, loading spinners, and empty states.
- [x] **About Us (`/about`)**: Store heritage, location highlights (Buschhausener Str. 63), and direct import guarantees.
- [x] **Contact (`/contact`)**: Form validation, rate limiting, and database storage in Inquiry collection.
- [x] **Customer Authentication (`/login` & `/register`)**: Input validation, password strength indicators, generic authentication error messaging, remember-me persistence, and post-auth destination preservation (`?from=...`).
- [x] **Shopping Bag (`/cart`)**: Responsive items list, live links to `/product/[slug]`, quantity increments clamped to stock, coupon discount calculation (`AKWELCOME10`), free delivery threshold meter (€35), and subtotal computation.
- [x] **Checkout (`/checkout`)**: Pre-checkout cart refresh against server catalog via `refreshCartWithServer()`, customer detail autofill for authenticated users, delivery method toggle (Delivery vs. Store Pickup), payment selection (COD vs. Stripe), server-side input validation, and atomic order creation.
- [x] **Order Confirmation (`/order-confirmation`)**: Order status badge, payment status badge, delivery coordination notice, line-by-line item receipt, and total calculations.
- [x] **Customer Account (`/account`)**: Protected route with Edge middleware guard, profile verification, live order history from `/api/account/orders`, collapsible order details, and session termination.

### 2. Responsiveness & Layout Stability
- [x] Verified mobile viewports (375px, 390px): Notched header adapts to clean mobile bar with drawer navigation; hero section stacks symmetrically; buttons and inputs have comfortable tap targets; `overflow-x: hidden` prevents horizontal scrolling.
- [x] Verified tablet viewports (768px): Category grids and product cards scale across 2-column layouts; modals and slide-out cart drawers adapt cleanly.
- [x] Verified desktop viewports (1440px): 4-column product grids, high-fashion hero composition with desktop cursor parallax, and 12-column footer.

### 3. Concurrency, Stock Atomicity & Security Hardening
- [x] **Atomic Stock Deduction**:
  - Implemented conditional `$gte` stock decrement (`findOneAndUpdate({ _id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })`) for COD orders with automatic batch rollback on stock race failure.
  - Hardened Stripe payment finalization in `lib/orderFinalizer.js` with conditional stock deduction inside mandatory multi-document transactions.
- [x] **Duplicate Index Warning Elimination**:
  - Removed duplicate schema index definitions in `models/Customer.js`, `models/Subscriber.js`, `models/Product.js`, and `models/Order.js`, eliminating Mongoose duplicate index warnings.
- [x] **Hero Quick-Add Live Integration**:
  - Updated `components/home/HeroSection.jsx` to bind to the live Samyang product with real MongoDB `_id` and `slug`, enabling valid cart checkout and direct product detail navigation.
- [x] **SEO & Crawling**:
  - Created static `public/robots.txt` specifying allowed and disallowed routes.

### 4. Verification & Automated QA Suite
- [x] **Stage 10 Comprehensive QA Test Suite (`scratch/stage10_qa_test.mjs`)**:
  - Section 1: Catalog & model integrity check — verified 3 existing products with valid slugs, prices, and stock (passed).
  - Section 2: Slug generation & dual-query resolution by slug and by ObjectId (passed).
  - Section 3: Related products recommendation query strictly excluding current item (passed).
  - Section 4: Atomic stock decrement and over-stock rejection (passed).
  - Section 5: Stripe idempotency — confirmed second finalization does not re-deduct stock (`alreadyPaid = true`) (passed).
  - Section 6: Customer authentication & multi-tenant order isolation — confirmed Customer Bob cannot access Customer Alice's orders (passed).
  - Section 7: Newsletter subscriber unique index prevention & inquiry status transition (passed).
  - Section 8: Teardown of synthetic test records — confirmed real catalog items remain completely untouched (passed).
  - **Results**: **36 passed, 0 failed**.
- [x] **Production Build (`npm run build`)**:
  - Verified exit code 0 across all 26 App Router routes.

---

## 📋 Stage 11 Checklist: Vercel Deployment Preparation

### 1. Serverless Runtime & Architecture Audit
- [x] **Next.js App Router Architecture**: Preserved standard App Router structure with 26 routes, zero TypeScript, no `src/` directory, and pure JavaScript/JSX.
- [x] **MongoDB Atlas Connection Caching**:
  - Validated `lib/mongodb.js` uses singleton `global.mongoose = { conn: null, promise: null }` pattern.
  - Confirmed `bufferCommands: false` prevents serverless hanging on connection cold starts.
  - DNS resolution fix `dns.setDefaultResultOrder("ipv4first")` verified.
- [x] **Stateless Media Uploads**:
  - Verified `app/api/admin/upload/route.js` uses streaming memory buffers (`Buffer.from(...)` and `cloudinary.uploader.upload_stream`).
  - Zero local disk writes in production.
- [x] **Stripe Serverless Webhook Handling**:
  - `app/api/orders/stripe/webhook/route.js` consumes raw request body via `request.text()` for cryptographic signature verification without JSON parser interference.
  - Idempotent finalization with multi-document transactions in `lib/orderFinalizer.js`.
- [x] **Production Cookie Security**:
  - `lib/customerAuth.js` and `app/api/admin/login/route.js` configure `secure: process.env.NODE_ENV === "production"`, `httpOnly: true`, and `sameSite: "lax"`.
- [x] **Remote Image Optimization**:
  - `next.config.mjs` configures `images.remotePatterns` for `images.unsplash.com`, `plus.unsplash.com`, and `res.cloudinary.com`.

### 2. Environment Variables & Secret Hygiene
- [x] **`.env.example` Audit**:
  - Verified complete documentation for all required variables: `MONGODB_URI`, `MONGODB_DB`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_JWT_SECRET`, `CUSTOMER_JWT_SECRET`, `CLOUDINARY_*`, `STRIPE_*`, `SMTP_*`, and `NEXT_PUBLIC_BASE_URL`.
  - Zero actual secret values present in template.
- [x] **Git Repository Privacy (`.gitignore`)**:
  - Configured to ignore `.env*.local`, `scratch/`, `.vercel/`, `.next/`, and `node_modules/`.
- [x] **Secret Leak Scan**:
  - Scanned all tracked source files (`app/`, `components/`, `lib/`, `models/`, `context/`, `public/`) for hardcoded secrets; verified zero exposed credentials.

### 3. SEO & Static Deployment Assets
- [x] **Static Robots File (`public/robots.txt`)**:
  - Configured crawler permissions allowing public storefront pages and disallowing `/admin/`, `/api/admin/`, and `/account/`.
  - References `Sitemap: https://ak-kiosk.de/sitemap.xml`.
- [x] **Static XML Sitemap (`public/sitemap.xml`)**:
  - Created pre-indexed XML sitemap covering all storefront departments, store information, and catalog product detail pages with priority weightings.

### 4. Build & Verification
- [x] **Production Build (`npm run build`)**:
  - Verified exit code 0 across all 26 App Router routes.
- [x] **Documentation**:
  - Updated `README.md` with complete step-by-step Vercel deployment guide, network access instructions, and environment variable reference table.

---

## 🔮 Production Readiness & Deployment Summary
- [x] All 11 stages completed and verified.
- [x] Zero mock product data in storefront.
- [x] Zero hardcoded secrets in repository.
- [x] Application fully prepared for one-click Vercel import and deployment.

---

## 📋 Stage 12 Checklist: Admin Settings, Documentation & Secure Credential Management

### 1. Admin Profile & Client Handover Credential Management
- [x] **Display Name Management**:
  - Implemented display name viewing and editing with inline feedback in `app/admin/(dashboard)/profile/page.js`.
  - Refreshes session tokens upon name-only update without forcing unnecessary re-authentication.
- [x] **Secure Email Address Modification**:
  - Implemented email address update with mandatory current password authorization.
  - Server-side email format validation with duplicate prevention checking existing admin records (`Admin.findOne({ email, _id: { $ne: admin._id } })`).
  - Automatic session revocation clearing `ak_admin_session` HTTP-only cookie with redirect countdown prompt to `/admin/login`.
- [x] **Secure Master Password Modification**:
  - Current password verification using `bcryptjs` compare against stored hash.
  - Enforced strong password requirements: minimum 8 characters, uppercase, lowercase, and numeric characters.
  - Password confirmation matching check.
  - Live password strength checklist indicators in UI.
  - Passwords securely hashed with salted bcrypt (cost factor 12).
  - Immediate session termination and re-login enforcement upon password change.
- [x] **Environment Variable Provisioning Logic**:
  - Updated `ensureInitialAdmin` in `lib/auth.js` to strictly check `Admin.countDocuments() === 0`.
  - Initial administrator is provisioned from `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` only when no admin exists in the database.
  - Prevents automated overwriting of client credentials during application startup, deployment, or login.
  - Zero password hashes or sensitive keys exposed through API endpoints or logs.

### 2. Part A – Store & System Settings
- [x] **Settings Model (`models/Settings.js`)**:
  - Created singleton Mongoose schema with default values matching the physical Oberhausen store:
    - Store Information: name, address, contact email, phone.
    - Business Hours: 7-day configuration with opening/closing times and closed-day toggles.
    - Local Delivery Settings: standard delivery fee (€3.50 default), free delivery threshold (€35.00 default), and supported delivery districts.
    - Tax Settings: VAT rate (7.0% German grocery reduced default) and price tax-inclusive flag.
    - Payment Settings: COD and Stripe availability flags. Never stores secret keys in database.
    - Notification Preferences: order notifications, inquiry notifications, and notification recipient email.
- [x] **Protected Settings API (`app/api/admin/settings/route.js`)**:
  - `GET /api/admin/settings`: Protected by admin session token; returns store configuration singleton.
  - `PUT /api/admin/settings`: Protected by admin session token; validates all inputs server-side with strict type and boundary checking.
- [x] **Settings Dashboard UI (`app/admin/(dashboard)/settings/page.js`)**:
  - Built comprehensive configuration interface matching AK Kiosk design tokens.
  - Interactive operating hours editor with per-day closed toggles.
  - Oberhausen delivery district tag manager with add/remove capabilities.
  - Tax percentage, payment method switches, notification email preferences, and sticky save actions with feedback toasts.

### 3. Part B – Help & Documentation
- [x] **Documentation Dashboard (`app/admin/(dashboard)/help/page.js`)**:
  - Replaced placeholder stub with full multi-tab searchable knowledge base:
    - **Admin Operating Manual**: Authentication & session security, real-time dashboard analytics, order status lifecycle & fulfillment (COD vs Stripe), customer inquiries workflow, newsletter subscribers with formula-injection-safe CSV export, and troubleshooting.
    - **Product Management Guidelines**: Step-by-step product cataloging, taxonomy mapping, pricing & strikethrough promotional discounts, Cloudinary multi-image uploads (up to 3 images), physical stock management, SKU labeling, and common mistakes.
    - **Developer Reference**: Actual Next.js 14 App Router architecture, MongoDB connection pool singleton, complete API endpoint reference table, environment variable configuration for Netlify/Vercel with sensitivity classification, client handover credential policy, and emergency password recovery.
  - **Global Live Search**: Client-side keyword search bar filtering topics across all sections with instant navigation.

### 4. Verification & Testing
- [x] **Automated Credential Management & Settings QA Test Suite**:
  - Test 1: Created test admin in MongoDB Atlas (passed).
  - Test 2: Unauthenticated PUT `/api/admin/profile` rejected with 401 (passed).
  - Test 3: Authenticated GET `/api/admin/profile` returned 200 with zero password hash exposure (passed).
  - Test 4: Display name update succeeded without forcing session revocation (passed).
  - Test 5: Incorrect current password rejected with 401 (passed).
  - Test 6: Invalid email format rejected with 400 (passed).
  - Test 7: Duplicate email address rejected with 409 Conflict (passed).
  - Test 8: Password validation checks (mismatched confirmation, short length, no numbers) rejected with 400 (passed).
  - Test 9: Successful email update succeeded with status 200, session cookie invalidated, and MongoDB record updated (passed).
  - Test 10: Successful password update succeeded with status 200, session cookie invalidated, and bcrypt hash updated (passed).
  - Test 11: Old credentials verified as no longer working against stored hash (passed).
  - Test 12: New credentials successfully verified against stored hash (passed).
  - Test 13: GET & PUT `/api/admin/settings` verified with server-side validation and persistence (passed).
  - Test 14: Cleaned up all synthetic test admin records with zero remaining artifacts (passed).
  - **Result**: **28 passed, 0 failed**.
- [x] **Production Build (`npm run build`)**:
  - Cleared cache and compiled all 26 App Router routes with **exit code 0**.
- [x] **Documentation Updates**:
  - Updated `README.md` with client handover procedures, Netlify/Vercel environment variables, and password recovery instructions.

---

## 📋 Stage 13 Checklist: Final Client Requirements Update (Netlify & Manual Order Now Workflow)

### 1. Feature Flag Configuration (`lib/features.js`)
- [x] Created `lib/features.js` providing centralized feature toggles:
  - `ENABLE_CUSTOMER_AUTH: false` (temporarily hides customer registration and login)
  - `ENABLE_STRIPE_PAYMENTS: false` (deactivates online Stripe checkout)
  - `ENABLE_COD_PAYMENTS: false` (deactivates Cash on Delivery)
  - `ENABLE_ORDER_NOW: true` (activates direct manual payment ordering flow)
- [x] Structured for instant reactivation without code rewrites or schema changes.

### 2. Customer Authentication Hiding & Access Guard
- [x] **Navigation Hiding**:
  - `components/layout/Navbar.jsx`: Conditionally wrapped the desktop user account dropdown menu with `{FEATURES.ENABLE_CUSTOMER_AUTH && (...)}`.
  - `components/layout/MobileMenu.jsx`: Conditionally wrapped mobile drawer customer login/register links with `{FEATURES.ENABLE_CUSTOMER_AUTH && (...)}`.
  - Storefront navigation no longer exposes customer login or account links.
- [x] **Route Access Interception**:
  - `middleware.js`: Intercepts direct requests to `/login` and `/register` when `ENABLE_CUSTOMER_AUTH === false` and redirects to `/` with HTTP 307.
  - `app/login/page.js` & `app/register/page.js`: Added client-side fallback `useEffect` redirect to `/` when authentication is toggled off.
- [x] **Preservation of Core Auth & Data**:
  - Preserved `models/Customer.js`, `lib/customerAuth.js`, `context/AuthContext.jsx`, `/api/auth/*`, `/api/account/*`, and customer profile components.
  - Customer MongoDB collection remains intact with all historical customer records.
  - Guest checkout remains fully functional for all customers without login.

### 3. "Order Now" Manual Payment Checkout Workflow
- [x] **Checkout UI Transformation (`app/checkout/page.js`)**:
  - Removed Stripe Card Payment option and Cash on Delivery option.
  - Removed payment method selection radio controls and icons (`CreditCard`, `Banknote`).
  - Added "Payment & Order Confirmation" notice card informing the customer that payment will be arranged manually by store staff after order placement.
  - Replaced payment button with prominent **"Order Now (€{total})"** action button.
  - Preserved customer details: Full Name, Phone Number, Email, Delivery vs. Store Pickup toggle, Shipping Address, Postal Code, and Order Notes.
  - Form validation with inline feedback before submission.
  - Spinner loading state and submission disabling to prevent duplicate order placements.
  - Redirects seamlessly to `/order-confirmation?orderNumber={orderNumber}&email={email}` upon order creation.
- [x] **Order Confirmation Updates (`app/order-confirmation/page.js`)**:
  - Displays order number, full items breakdown, quantities, delivery fee, and total amount.
  - Displays `PaymentStatusBadge` indicating "Payment: Pending (To Be Arranged)".
  - Displays clear notice: *"Thank you for your order! Our team will contact you shortly to confirm your order and arrange payment."*
  - Does NOT claim payment has been completed.
- [x] **Notification Emails (`lib/mailer.js`)**:
  - Customer order confirmation email: Explains store staff will reach out directly to confirm details and arrange payment; indicates payment status is pending manual arrangement.
  - Admin new order notification email: Clearly labels payment as "Manual Arrangement (Direct Confirmation)" with customer contact phone and address prominently highlighted.

### 4. Backend Order Processing & Database Integrity
- [x] **Order Model Schema (`models/Order.js`)**:
  - Updated `paymentMethod` enum to `["cod", "stripe", "manual", "order_now"]` with default `"manual"`.
  - Preserves historical `"cod"` and `"stripe"` values for all existing orders.
- [x] **Order Creation API (`app/api/orders/route.js`)**:
  - Resolves `paymentMethod` to `"manual"` for new customer orders.
  - Initial `orderStatus` set to `"pending"`.
  - Initial `paymentStatus` set to `"pending"` (orders are never marked as paid automatically).
  - Server-side catalog price lookup in cents to prevent client price tampering.
  - Conditional `$gte` atomic stock deduction with batch rollback protection on inventory race conditions.
  - Idempotency and duplicate submission safeguards preserved.
- [x] **Historical Stripe Isolation**:
  - Existing Stripe route files (`app/api/orders/stripe/route.js`, `webhook/route.js`, `lib/orderFinalizer.js`) remain untouched and safely isolated.
  - Historical Stripe orders (17 verified in MongoDB Atlas) remain fully queryable and viewable.
  - Ordinary order placement requires zero Stripe API keys or Stripe environment variables.

### 5. Admin Dashboard & Settings Updates
- [x] **Admin Orders Management (`app/admin/(dashboard)/orders/page.js` & `app/api/admin/orders/route.js`)**:
  - Added "Manual / Order Now" badge to `PaymentMethodBadge` component with phone icon.
  - Added "Manual / Order Now" option to payment method filter dropdown.
  - Admin orders API supports filtering by `paymentMethod=manual`.
  - Orders received via Order Now display full customer contact phone and address for manual fulfillment.
- [x] **Admin Settings (`app/admin/(dashboard)/settings/page.js` & `app/api/admin/settings/route.js`)**:
  - Replaced Payment Gateways section with "Payment Workflow" card clearly showing "Manual Payment Arrangement (Active)".
  - Stripe and COD toggles deactivated with "Inactive" badges.
  - Server-side `PUT /api/admin/settings` enforces `codEnabled = false` and `stripeEnabled = false` while manual workflow is active.
  - Preserved store info, business hours, delivery fees, free delivery threshold (€35), delivery districts, and notification preferences with MongoDB Atlas persistence.

### 6. Help & Documentation Updates (`app/admin/(dashboard)/help/page.js`)
- [x] **Admin Operating Manual**:
  - Updated Order Fulfillment guide to detail the Order Now workflow: reviewing incoming orders, contacting the customer via phone/email, collecting payment manually (cash/bank transfer/in-store), updating status to Confirmed, and handling cancellation if unreachable.
- [x] **Product Management Guidelines**:
  - Preserved catalog instructions: Cloudinary uploads (up to 3 images), stock limits, pricing, categories, and SKU tracking.
- [x] **Developer Reference**:
  - Updated architecture to highlight Next.js 14 App Router, feature flag system, Order Now manual ordering flow, and isolated Stripe subsystem.
  - Replaced deployment instructions with comprehensive Netlify Production Deployment guide including environment variables table and sensitivity classifications.

### 7. Netlify Deployment & Client Handover (`README.md` & `netlify.toml`)
- [x] Created `netlify.toml` with standard Next.js build command (`npm run build`), publish directory (`.next`), and `@netlify/plugin-nextjs`.
- [x] Replaced Vercel deployment guide in `README.md` with complete Netlify deployment walkthrough:
  - Repository linking & Netlify build settings.
  - External services checklist: MongoDB Atlas, Cloudinary, Gmail App Password, Netlify.
  - Full production environment variables reference with exact keys and instructions.
  - Gmail SMTP App Password setup guide (2-Step Verification + 16-character App Password).
  - First-time admin provisioning via `ensureInitialAdmin` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`).
  - Admin credential management via Admin Profile (`/admin/profile`).
  - Emergency admin password recovery procedure via database script or direct hash update.
  - Explanation of the Order Now manual ordering workflow and feature flags.

### 8. Verification & QA Results
- [x] **Automated Verification Suite (`scratch/test_final_client_requirements.js`)**:
  - Section 1: Customer Auth feature flag verified false, Order Now verified active (passed).
  - Section 2: Customer model and existing records (1 customer) verified intact (passed).
  - Section 3: `POST /api/orders` created order with status 201 and paymentMethod="manual" (passed).
  - Section 4: Initial `orderStatus` and `paymentStatus` verified as "pending" (not marked as paid) in MongoDB Atlas (passed).
  - Section 5: Atomic stock deduction verified (decremented from 49 to 47) (passed).
  - Section 6: Admin Orders query and `paymentMethod=manual` filter verified (status 200) (passed).
  - Section 7: Admin Settings loaded, updated, and verified deactivated Stripe/COD (passed).
  - Section 8: Historical Stripe orders in MongoDB Atlas verified intact (17 existing records preserved) (passed).
  - Section 9: Inquiries (1) and Subscribers (1) collections verified intact (passed).
  - Section 10: Test teardown restored stock to 49 and purged synthetic test order (passed).
  - **Results**: **27 passed, 0 failed**.
- [x] **Production Build (`npm run build`)**:
  - Full clean build executed with `@netlify/plugin-nextjs` compatibility.
  - All 26 App Router routes statically generated or dynamically server-rendered with **exit code 0**.

---

## 📋 Stage 14 Checklist: Final Order Workflow, Admin Orders, Settings Integration & Documentation Updates

### 1. Diagnosis & Resolution of Missing Order Confirmation Page
- [x] **Root Cause Diagnosis**:
  - In `app/checkout/page.js`, upon successful order submission, `clearCart()` synchronously emptied the cart items (`items = []`).
  - An uncontrolled `useEffect` listening to `items.length === 0` immediately triggered `router.replace("/cart")`, which cancelled or superseded the in-flight `router.push('/order-confirmation?orderNumber=...')` navigation and dumped the customer onto an empty shopping cart page.
  - Furthermore, `GET /api/orders` omitted `subtotal` and `deliveryFee` from the response payload, preventing the order confirmation view from formatting itemized totals.
- [x] **Checkout Navigation & State Hardening (`app/checkout/page.js`)**:
  - Introduced `orderPlaced` state flag to prevent the empty-cart redirection effect from executing once an order has been successfully placed.
  - Ensured cart is cleared **only after** order creation succeeds (`res.ok && data.success`).
  - Smoothly redirects to `/order-confirmation?orderNumber=${orderNumber}&email=${email}`.
- [x] **API Order Lookup Enhancement (`app/api/orders/route.js`)**:
  - Enhanced `GET /api/orders` to return `subtotal`, `deliveryFee`, `total`, `deliveryMethod`, `paymentMethod`, `paymentStatus`, `orderStatus`, and full customer details (`fullName`, `email`, `phone`, `address`, `city`, `postalCode`, `country`).
  - Supports secure lookup by `orderNumber` AND `email`, or `orderId` AND `email`.
  - Rejects unauthorized queries missing the customer email (HTTP 400/404) to prevent enumeration attacks.
  - Confirmed that refreshing the confirmation page only triggers read queries, never duplicating orders, emails, or stock deductions.
- [x] **Order Confirmation Presentation (`app/order-confirmation/page.js`)**:
  - Displays prominent "Order Successfully Placed!" banner with the customer name and order number.
  - Displays exact requested notice: *"Thank you for your order! Our store team will contact you shortly to confirm your order and arrange payment."*
  - Shows ordered items, quantities, subtotal, delivery fee, and final total.
  - Shows delivery method (`Home Delivery` or `Store Pickup`).
  - Shows payment method as **Manual Payment** and payment status badge as **Payment: Pending**.

### 2. Admin Orders Management Enhancements
- [x] **Delivered Order Status (`models/Order.js` & `app/api/admin/orders/[id]/route.js`)**:
  - Added `"delivered"` to `orderStatus` enum in Mongoose schema: `["pending", "confirmed", "delivered", "canceled"]`.
  - Updated backend route validation in `PATCH /api/admin/orders/[id]` to accept `"delivered"`.
  - Added "Delivered" badge with icon in `OrderStatusBadge` and added "Delivered" filter to admin orders view and stat cards.
- [x] **Payment Status Reconciliation (Pending & Paid)**:
  - Updated `PATCH /api/admin/orders/[id]` to validate and accept `paymentStatus: "pending" | "paid"`.
  - Automatically records `paidAt` timestamp when payment is marked as `paid`.
  - Added interactive buttons in `app/admin/(dashboard)/orders/page.js` for store administrators to manually toggle payment status to **Paid (Received)** after collecting payment outside the website.
  - Strictly prevents emails, duplicate orders, or additional stock deductions when updating payment status.
  - Status updates persist across page reloads and browser refreshes in MongoDB Atlas.
- [x] **Delivery Method Visibility**:
  - Added dedicated `DeliveryMethodBadge` component in admin orders table displaying `Home Delivery` (with truck icon) or `Store Pickup` (with store icon).
  - For historical orders lacking delivery method data, displays `"Not specified"` cleanly without fallback invention.
  - Expanded order details explicitly display the customer's selected delivery method and fulfillment address.

### 3. Storewide Settings Integration & MongoDB Persistence
- [x] **Public Settings API Endpoint (`app/api/settings/route.js`)**:
  - Created public `GET /api/settings` retrieving the store configuration singleton from MongoDB Atlas (`Settings.getSingleton()`).
  - Exposes `deliveryFee`, `freeDeliveryThreshold`, `storeName`, `storeAddress`, `contactEmail`, `phone`, `businessHours`, `deliveryAreas`, and tax rates with zero secrets.
- [x] **Storewide Dynamic Delivery Fee Reflection**:
  - `app/cart/page.js`: Fetches `/api/settings` on mount; dynamically calculates `deliveryFee` and displays real-time free delivery qualification threshold note.
  - `app/checkout/page.js`: Fetches `/api/settings` on mount; dynamically applies the saved `deliveryFee` and `freeDeliveryThreshold` in the order summary.
  - `components/layout/CartDrawer.jsx`: Dynamically updates the Oberhausen free delivery progress bar to the configured threshold.
  - `app/api/orders/route.js`: Server-side `POST /api/orders` retrieves `Settings.getSingleton()` and computes delivery fees and totals using live database settings.
- [x] **Admin Settings Page Persistence (`app/admin/(dashboard)/settings/page.js` & `route.js`)**:
  - Validated that editing store information, business hours, delivery fee, threshold, tax rate, and notifications persists to MongoDB Atlas.
  - Displays success message only when database update completes successfully; returns meaningful error messages on failure.
  - Verified changes remain intact after refreshing or reopening the settings dashboard.

### 4. Stripe Documentation Cleanup
- [x] **`README.md` Modernization**:
  - Updated Technology Stack to designate **Manual Order Now** as the active ordering workflow.
  - Replaced outdated "Stripe Payment Setup" section with "Payment Workflow & Legacy Integration Notice", clarifying that Stripe and COD are disabled for checkout and explaining the manual order reconciliation lifecycle.
  - Updated Environment Variables table: clearly separated active required operational variables (MongoDB, Admin Auth, Cloudinary, Gmail SMTP) from legacy/inactive Stripe variables.
  - Clarified that configuring Stripe is **not required** to operate or deploy the application to Netlify.
  - Updated API Endpoints table to reflect `/api/settings`, Order Now workflow, and PATCH order/payment status updates.
- [x] **`app/admin/(dashboard)/help/page.js` Synchronization**:
  - Added "Delivered" operational step to the Order Status Lifecycle table.
  - Added `GET /api/settings` and updated `PATCH /api/admin/orders/[id]` capabilities in the Developer Reference API table.

### 5. Verification & Test Results
- [x] **Automated Regression Test Suite (`scratch/test_stage14_fixes.js`)**:
  - Order creation and confirmation data flow (order number, items, subtotal, delivery fee, total, customer details, pending payment status, atomic stock decrement) verified.
  - Order lookup via `GET /api/orders?orderNumber=&email=` and `?orderId=&email=` verified.
  - Security verification: Unauthenticated or mismatched email lookups rejected (400/404).
  - Admin PATCH updating `orderStatus` to confirmed, delivered, and canceled verified.
  - Admin PATCH updating `paymentStatus` to paid and pending verified with timestamp recording.
  - Public `GET /api/settings` and Admin `PUT /api/admin/settings` persistence verified.
  - Dynamic delivery fee computation verified in order creation.
  - **Results**: **50 passed, 0 failed**.
- [x] **Production Build (`npm run build`)**:
  - Full clean production build executed.
  - All 26 App Router routes statically generated or dynamically server-rendered with **exit code 0**.

---

## 📋 Stage 15 Checklist: Hero Section Targeted Corrections

### 1. Video Section Removal (`components/home/HeroSection.jsx`)
- [x] **Store Walkthrough Preview Card Removed**:
  - Completely removed the right-flank video preview card (`Image`, dark gradient, play button icon, duration tag `0:45`, and store address text).
- [x] **Video Modal & Overlay Removed**:
  - Removed `<AnimatePresence>` modal container and backdrop overlay.
  - Removed embedded YouTube iframe (`dQw4w9WgXcQ`).
  - Removed modal header, close button, and click dismiss handlers.
- [x] **State & Unused Import Cleanup**:
  - Removed `isVideoModalOpen` state (`useState(false)`).
  - Removed unused Lucide icon imports: `Play`, `X`, `ArrowRight`, `Sparkles`.
  - Removed unused Framer Motion import: `AnimatePresence`.
  - Cleaned up click triggers and modal state handlers.

### 2. Product Image Fixes & Display Optimization
- [x] **Central Position Preservation**:
  - Maintained the central featured product visual in its exact position (`lg:col-span-4 lg:col-start-5`), directly aligned below the headline and CTAs.
  - Symmetrical 12-column layout preserved across desktop, tablet, and mobile views.
- [x] **Image Loading & Sizing**:
  - Image configured with Next.js `<Image fill priority />` and `object-cover`.
  - Responsive sizes set to `(max-width: 640px) 256px, (max-width: 768px) 320px, 384px`.
  - Aspect ratio container (`aspect-[4/5]`) prevents Cumulative Layout Shift (CLS).
- [x] **Dynamic Fetch & Fallback Resilience**:
  - Dynamically fetches Samyang Ramen from `/api/products/samyang-buldak-hot-chicken-ramen` (with fallback to `samyang-buldak-carbonara-ramen`).
  - High-resolution fallback state (`FALLBACK_RAMEN`) preserved in case of network or API failure.
  - Added `onError` fallback on `<Image>` to ensure visual displays consistently even on image load errors.
  - Maintained rounded corners (`rounded-3xl` / `rounded-2xl`), ambient backdrop blur, grounding shadow, "Korean Buldak Carbonara" badge (`Flame` icon), and live price label.

### 3. Preservation of Hero Section Layout & Functionality
- [x] **Storefront & Navigation Integrity**:
  - Preserved `Navbar` integration (`variant="hero-integrated"`).
  - Preserved heading ("Your Asian Market. One Click Away.") and eyebrow text ("DISCOVER YOUR ASIAN FAVORITES • OBERHAUSEN, GERMANY").
  - Preserved CTA pill buttons ("SHOP NOW" and "EXPLORE ALL").
  - Preserved left-side avatar stack, 5-star rating, "800+ Oberhausen Shoppers" copy, description, and location tag ("Buschhausener Str. 63, 46049 Oberhausen").
  - Preserved bottom indicator dots and background architectural SVG perspective lines.
  - Preserved smooth mouse parallax physics (`useMotionValue`, `useSpring`, `useTransform`).
  - Preserved Add to Cart functionality (`addToCart(heroRamen, 1)`) and product detail page links.
  - Zero modifications to components outside `HeroSection.jsx`.

### 4. Verification & Build Confirmation
- [x] **Production Build (`npm run build`)**:
  - Executed production build with **exit code 0**.
  - All 26 App Router routes statically generated or dynamically server-rendered without errors.

---

## 📋 Stage 16 Checklist: Hero Section 3-Product Horizontal Showcase

### 1. Three-Product Horizontal Display (`components/home/HeroSection.jsx`)
- [x] **Product Data Selection from MongoDB**:
  - Maintained the existing hero image: **Samyang Buldak Hot Chicken Ramen** (Groceries, €1.99).
  - Added two distinct additional products from live MongoDB Atlas records:
    - **Caramel Latte** (Drinks & Teas, €4.49, Cloudinary product image).
    - **Burfi** (Snacks & Sweets, €1.50, Cloudinary product image).
  - Representing the 3 primary store categories: Groceries, Drinks, and Snacks.
  - Implemented dynamic fetching via `/api/products` with robust fallback dataset (`FALLBACK_PRODUCTS`).
- [x] **Horizontal Alignment & Equal Dimensions**:
  - Formatted all 3 products side by side in a single horizontal row directly below the centered hero headline and CTA buttons.
  - Configured with identical card containers, equal `aspect-[4/5]` image ratios, consistent spacing (`gap-4 sm:gap-6`), and matching padding.
  - Each product includes:
    - Next.js `<Image />` with `object-cover` and `onError` image fallback protection.
    - Floating category/origin badge with `Flame` icon.
    - Price pill tag formatted in Euro (`€{price.toFixed(2)}`).
    - Product origin & name links leading to `/product/[slug]`.
    - Integrated `+ Add` button invoking `addToCart(product, 1)`.
- [x] **Responsive Layout**:
  - Desktop & Tablet: 3 equal-width columns side by side (`md:grid-cols-3`).
  - Mobile: Clean single-column layout centered with `max-w-xs sm:max-w-sm`.

### 2. Preservation of Storefront Features & Atmosphere
- [x] **Hero Canvas & Aesthetics**:
  - Preserved the notched integrated Navbar (`variant="hero-integrated"`).
  - Preserved centered eyebrow ("DISCOVER YOUR ASIAN FAVORITES • OBERHAUSEN, GERMANY"), headline ("Your Asian Market. One Click Away."), and CTAs ("SHOP NOW", "EXPLORE ALL").
  - Preserved smooth mouse parallax physics (`parallaxX`, `parallaxY`, `useSpring`).
  - Preserved background SVG architectural perspective lines and top ambient glow.
- [x] **Customer Social Proof & Physical Location**:
  - Positioned clean horizontal footer bar below the product row with customer avatar stack, 5-star rating, "800+ Oberhausen Shoppers" copy, description snippet, and location tag ("Buschhausener Str. 63, 46049 Oberhausen").
- [x] **Scope Restriction**:
  - Modified strictly `components/home/HeroSection.jsx`. No modifications made to `Navbar.jsx`, backend APIs, or homepage sections below the hero.

### 3. Verification & Build
- [x] **Production Build (`npm run build`)**:
  - Executed production build with **exit code 0**.
  - All 26 App Router routes statically generated or dynamically server-rendered without errors.

---

## 📋 Stage 17 Checklist: Homepage Hero Inner Content Reference Redesign

### 1. Hero Inner Content Redesign (`components/home/HeroSection.jsx`)
- [x] **Top Centered Badge**:
  - Centered badge with storefront icon: `AK KIOSK & ASIAN MARKET` (`Store` icon, warm cream background `#FAF6EF`, border `#E8DCC9`, burgundy letterspaced text).
- [x] **Headline with Reference Accents**:
  - Primary line: *"A Little Taste of Asia,"* with decorative burgundy accent rays.
  - Sub-line: *"Right Around the Corner."* in italic burgundy serif, featuring the exact reference underline under *"the Corner."*.
- [x] **Shop Description**:
  - Clean, concise text: *"Discover authentic Asian groceries, delicious snacks, refreshing drinks, and everyday essentials in Oberhausen."*.
- [x] **Central Visual & 4 Floating Category Labels**:
  - One medium-sized rectangular Asian grocery shop image (`aspect-[16/10]`) with `rounded-2xl sm:rounded-3xl`, `border-4 sm:border-[6px] border-white`, and soft drop shadow.
  - Four category cards flanking the image:
    - **Asian Groceries** (noodle bowl icon `Soup`, linked to `/categories/groceries`).
    - **Snacks & Treats** (snack icon `Cookie`, linked to `/categories/snacks`).
    - **Drinks & Beverages** (drink cup icon `CupSoda`, linked to `/categories/drinks`).
    - **Authentic Selection** (leaf icon `Leaf`, linked to `/shop`).
  - Mobile responsiveness: cards adapt to a responsive 2x2 grid on small screens.
- [x] **Action Buttons (Below Image)**:
  - **SHOP NOW** (`/shop`): Dark charcoal pill button with shopping cart icon (`ShoppingCart`).
  - **ABOUT US →** (`/about`): Cream pill button with arrow icon (`ArrowRight`).
- [x] **Bottom Trust & Location Bar**:
  - Three-column footer bar separated by vertical dividers:
    - Overlapping customer avatars, 5 stars, and *"800+ OBERHAUSEN SHOPPERS"*.
    - Red `MapPin` icon with verified physical store address: *"Buschhausener Str. 63, 46049 Oberhausen"*.
    - Red delivery `Truck` icon with *"Local & Reliable Service"*.
- [x] **Corner Wave Aesthetics**:
  - Added traditional Japanese/Asian wave pattern (Seigaiha) in the bottom-left and bottom-right corners matching the reference image.
- [x] **Removal of Product Fetching & Add to Cart from Hero**:
  - Removed all product querying, MongoDB dependencies, and cart state from `HeroSection.jsx`.
  - Zero modifications made outside the hero inner content.

### 2. Verification & Build
- [x] **Production Build (`npm run build`)**:
  - Executed production build with **exit code 0**.
  - All 26 App Router routes statically generated or dynamically server-rendered cleanly.

---

## 🛒 Stage 18 Checklist: Bestsellers & New Arrivals Layout Fix

### 1. `components/products/ProductCard.jsx` — Responsive Mobile Changes
- [x] Card class: `rounded-2xl sm:rounded-3xl`, `p-2.5 sm:p-4`, `w-full h-full`
- [x] Image link: `rounded-xl sm:rounded-2xl`
- [x] Image `sizes`: `50vw` on mobile (was `100vw`)
- [x] Badges: `top-2 left-2 sm:top-3 sm:left-3`, `text-[9px] sm:text-[10px]`, `max-w-[70%] truncate`
- [x] Product info section: `pt-2.5 sm:pt-4`, `text-[10px] sm:text-[11px]`
- [x] Product name: `text-xs sm:text-sm`, `min-h-[32px] sm:min-h-[40px]`, `leading-snug`
- [x] Price: `text-xs sm:text-base`, `truncate`
- [x] Add button: `px-2.5 sm:px-3.5`, `py-1.5 sm:py-2`, `text-[10px] sm:text-xs`, `gap-1 sm:gap-1.5`
- [x] Icon sizes: `w-3 h-3 sm:w-3.5 sm:h-3.5`
- [x] All MongoDB integration and cart functionality (`addToCart`, `handleAdd`, `isAdded`) preserved

### 2. `components/products/ProductGrid.jsx` — Responsive Grid Fix
- [x] Grid: `grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full` (was `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`)
- [x] Ensures 2 columns on mobile/tablet, 4 on desktop

### 3. `components/home/Bestsellers.jsx` — Layout Match to CategorySection
- [x] Import: `ArrowRight` → `ArrowUpRight`
- [x] View All link: changed from bordered pill to CategorySection-matching inline `ArrowUpRight` style (`inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase ... group`)
- [x] Section class matches `max-w-7xl` container width and horizontal spacing
- [x] Fetch logic: products sorted to prioritize Samyang/bestseller-badged items

### 4. `components/home/NewArrivals.jsx` — Latest Products + Layout Match
- [x] Default state: `PRODUCTS.slice(0, 4)` (was `slice(4,8)` — only 5 static items, returned wrong fallback)
- [x] Live fetch: client-side sort by `createdAt` descending, takes first 4 — always shows newest admin-added products
- [x] Heading renamed to **"New Arrivals"**
- [x] Description updated: *"Directly imported authentic snacks, drinks, and grocery essentials newly added to our shelves in Oberhausen."*
- [x] View All link: `ArrowUpRight` style matching CategorySection
- [x] Section class: `py-16 sm:py-24 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto`
- [x] Header div: `flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4`

### 5. API & Data Verification
- [x] `app/api/products/route.js` already sorts by `{ createdAt: -1 }` and returns `createdAt` in all responses
- [x] `models/Product.js` has `timestamps: true` with `createdAt` index
- [x] Confirmed 5 MongoDB products with valid timestamps (newest: Citrusy Shrimp Skewers, Lemon Mojito, Burfi, Caramel Latte, Samyang)

### 6. Verification & Build
- [x] **Production Build (`npm run build`)**: exit code **0**
- [x] All **26 App Router routes** statically generated or dynamically server-rendered without errors
- [x] No JSX/TypeScript errors, no compilation warnings
- [x] Homepage (`/`): 9.88 kB, middleware: 31.9 kB

---

## 🗂️ Stage 19 Checklist: CategorySection Mobile Design Polish

### Modified File
- `components/home/CategorySection.jsx` — mobile-only responsive improvements

### Changes Made (mobile-targeted, desktop preserved)

| Element | Before (mobile) | After (mobile) |
|---|---|---|
| Grid gap | `gap-6` | `gap-3 sm:gap-5 lg:gap-6` |
| Card corners | `rounded-3xl` | `rounded-2xl sm:rounded-3xl` |
| Card height | no `h-full` | `h-full` (equal height in row) |
| Image container | no `shrink-0` | `shrink-0` (prevents image compression) |
| Image `sizes` | `100vw` on mobile | `50vw` on mobile (correct for 2-col grid) |
| Item count badge position | `top-3 right-3` | `top-2 right-2 sm:top-3 sm:right-3` |
| Item count badge padding | `px-2.5 py-1` | `px-1.5 sm:px-2.5 py-0.5 sm:py-1` |
| Item count badge text | `text-[10px]` | `text-[8px] sm:text-[10px]`, `truncate max-w-[80%]` |
| Card inner padding | `p-5` | `p-3 sm:p-5` |
| Category title size | `text-lg` | `text-sm sm:text-lg` |
| Category title overflow | no clamp | `line-clamp-1 leading-snug` |
| Description text size | `text-xs` | `text-[10px] sm:text-xs` |
| Description top margin | `mt-1.5` | `mt-1 sm:mt-1.5` |
| Browse button top padding | `pt-4 mt-3` | `pt-2.5 sm:pt-4 mt-2.5 sm:mt-3` |
| Browse button text size | `text-xs` | `text-[9px] sm:text-xs` |
| Browse button text | no truncate | `truncate pr-1` (prevents overflow) |
| Arrow icon circle | `w-7 h-7` | `w-5 h-5 sm:w-7 sm:h-7`, `shrink-0` |
| Arrow icon size | `w-3.5 h-3.5` | `w-2.5 h-2.5 sm:w-3.5 sm:h-3.5` |

### What Was Preserved (unchanged)
- Desktop layout: 4-column grid, `lg:gap-6`, `sm:p-5`, `sm:rounded-3xl`
- All CATEGORIES data, slugs, links, and hover effects
- `aspect-[4/3]` image proportions
- Image gradient overlay and hover scale
- Section header, "Curated Collections" label, "Explore By Department" heading
- "View All 800+ Products" ArrowUpRight link
- `max-w-7xl` container and section padding

### Verification & Build
- [x] **Production Build (`npm run build`)**: exit code **0**
- [x] All **26 App Router routes** generated without errors or warnings
- [x] Homepage (`/`): 9.99 kB
