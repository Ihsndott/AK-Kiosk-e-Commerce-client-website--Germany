# AK Kiosk & Asian Market — Premium E-Commerce Experience

A premium, futuristic e-commerce web application designed for **AK Kiosk & Asian Market**, an authentic Asian grocery and convenience store located at **Buschhausener Str. 63, 46049 Oberhausen, Germany**.

Inspired by minimalist, architectural luxury e-commerce compositions, this interface combines a calm pale blue-grey canvas, soft ivory borders, an icy-blue rounded hero frame, and a centered brand identity with interactive shopping capabilities and a full-featured administrator portal.

---

## 🎨 Color Palette & Aesthetic Identity

| Color Name | Hex Code | Visual Role |
| :--- | :--- | :--- |
| **Pale Blue-Grey** | `#CBD8DC` | Outer background canvas & framing margins |
| **Soft Icy Blue** | `#DCE8EB` | Inner hero frame interior & gradient depth |
| **Warm Ivory** | `#F7F5EF` | Soft architectural borders, cards, secondary pill buttons |
| **Deep Charcoal** | `#17191B` | Primary headlines, dominant typography & primary CTA buttons |
| **Burgundy** | `#7A1735` | Refined accents, brand subheadings, active highlights |
| **Muted Gold** | `#D1AE70` | Premium badges, star ratings, specialty discounts |

---

## 🚀 Key Features

### 1. Architectural Centered-Logo Navbar
- **Centered Brand Identity**: `"AK KIOSK"` with `"ASIAN MARKET"` prominently centered across the navigation bar.
- **Left Navigation Links**: `HOME` (`/`), `SHOP` (`/shop`), `ABOUT US` (`/about`), and `CONTACT` (`/contact`) with smooth underline hover transitions.
- **Right Interactive Controls**:
  - **Live Search**: Interactive search modal with real-time filtering and `Ctrl+K` keyboard shortcut support.
  - **Customer Account**: Account menu with sign-in and registration links.
  - **`SHOP NOW` Pill Button**: High-contrast pill CTA.
  - **Shopping Bag with Live Badge**: Dynamic item counter that opens an animated slide-over cart drawer with free Oberhausen delivery progress indicator.
- **Hero-Integrated Frame**: Integrated cleanly inside the top of the large rounded hero container.
- **Mobile Responsive Drawer**: Animated slide-in navigation drawer with store address, hours, and quick search.

### 2. Futuristic Hero Section
- **Outer Pale Blue-Grey Margin**: Sets off the inner rounded frame.
- **Soft Ivory Frame & Icy-Blue Interior**: Large rounded container (`rounded-[2.5rem]` / `rounded-[3.5rem]`) with soft ivory borders and subtle drop shadows.
- **Central Layered Product Arrangement**:
  - Centerpiece: Korean Buldak Carbonara & gourmet noodles with ambient glow and quick-add button.
  - Left Floating Element: Japanese Sangaria Ramune marble soda with floating animation.
  - Right Floating Element: Glico Uji Matcha Pocky biscuit sticks with gentle counter-floating motion.
  - Floating Interactive Badges: Same-day Oberhausen fulfillment badge & 4.9/5.0 verified review badge.
- **Mouse Parallax**: Responsive desktop perspective shift reacting naturally to cursor motion.
- **Copy & CTAs**:
  - Eyebrow: `DISCOVER YOUR ASIAN FAVORITES`
  - Headline: `Your Asian Market. One Click Away.`
  - Description: Curated authentic imports direct to your doorstep.
  - Pill CTAs: `SHOP NOW` and `EXPLORE COLLECTION`.
  - Location Badge: `OBERHAUSEN, GERMANY`.

### 3. Complete Shopping Experience & Live Catalog
- **MongoDB Atlas Integration**: Live product data fetched from the database via `/api/products`.
- **Dynamic Category Filtering**: Instant filtering for Groceries, Snacks, and Drinks.
- **Data States**: Polished loading skeletons, empty state messaging, and error boundaries with retry buttons.
- **Interactive Global Cart State**: Add to cart, increment/decrement quantities, remove items, clear bag, and real-time subtotal calculation.
- **Free Oberhausen Delivery Meter**: Visual progress bar tracking orders towards the €35 free delivery threshold.
- **Store Location & Hours**: Dedicated section with embedded map view and directions for Buschhausener Str. 63, Oberhausen.

### 4. Secure Administrator Portal & Product Management (Stages 1 & 2)
- **Subtle Gateway Link**: Small, unobtrusive "Admin" link in the customer footer linking to `/admin/login`.
- **Server-Side Authentication**: Password hashing with `bcryptjs` and cryptographically signed JWT sessions with `jose`.
- **HTTP-Only Cookies**: Secure, `SameSite=Lax` cookie session delivery (`ak_admin_session`).
- **Edge Route Guarding**: Next.js `middleware.js` automatically protects all `/admin/*` and `/api/admin/*` routes.
- **Operations Dashboard**: Responsive desktop sidebar and mobile drawer with live product counts from MongoDB, quick action navigation, and recent orders queue.
- **Interactive Product Management (`/admin/products`)**:
  - Live inventory statistics: Total catalog items, In Stock, Low Stock (<=10), and Out of Stock (0).
  - Search by name, description, or SKU, alongside instant Category and Stock Status filters.
  - Add & Edit Product Modal with validation for name, description, pricing (including optional strike-through price), stock, SKU, and categories.
  - Inline category creator: Add new categories to MongoDB on the fly without leaving the modal.
  - Multi-image manager supporting up to 3 images with Cloudinary file uploads or direct URL entry.
  - Delete product confirmation dialog with instant UI update.
  - Loading skeleton, empty state, and animated toast feedback for operations.

### 5. Customer Authentication & Account Management (Stage 8)
- **Customer Registration (`/register`)**: Full name, email address, password strength validation (min 8 chars, alphanumeric), confirm password, duplicate detection, and automated sign-in.
- **Customer Sign In (`/login`)**: Email and password validation, remember-me persistence, generic authentication error messaging to prevent user enumeration.
- **Protected Customer Account Dashboard (`/account`)**:
  - Customer profile overview with verified shopper status.
  - Live order history retrieved from MongoDB via `/api/account/orders`.
  - Detailed collapsible order drawers displaying items, unit pricing, quantities, delivery fees, and order/payment statuses.
  - Direct logout and quick store navigation.
- **Security & Concurrency**:
  - Independent customer JWT secret (`CUSTOMER_JWT_SECRET`) completely segregated from administrator secrets (`ADMIN_JWT_SECRET`).
  - Independent HTTP-only cookie (`ak_customer_session`, `SameSite=Lax`, `Secure` in production).
  - Passwords hashed using `bcryptjs` (cost factor 12).
  - Next.js Edge Middleware route guarding (`/account/*`, `/api/account/*`).
  - Server-side order isolation: shoppers can strictly query only their own orders.

### 6. Dynamic Product Details & Customer Experience (Stage 9)
- **Server-Rendered Product Details (`/product/[slug]`)**:
  - Live data query from MongoDB Atlas by unique slug or ObjectId identifier.
  - Real-time catalog updates: additions, edits, and deletions in the admin panel reflect automatically on the storefront.
  - Proper `notFound()` 404 response for deleted or non-existent products.
- **Multi-Image Gallery & Product Presentation**:
  - Interactive image stage with thumbnail selector for up to 3 high-resolution images.
  - Price formatting with original price strike-through and computed discount pill badges.
  - Real-time stock availability indicators (`In Stock (x)` vs. `Out of Stock`).
  - Stock-bounded quantity selector preventing orders exceeding physical inventory.
- **Stock-Aware Global Cart Integration**:
  - Synchronized cart across shop, product details, search modal, and cart drawer.
  - Out-of-stock items disable add-to-bag controls with clear feedback.
  - Quantity capping: items in cart are bounded by available inventory.
  - Server validation on checkout via `refreshCartWithServer` to ensure pricing and stock integrity prior to payment.
- **Related Products Discovery**:
  - Category-aware recommendations dynamically querying MongoDB for matching items while strictly excluding the current product.
- **Dynamic SEO & Metadata**:
  - Next.js App Router `generateMetadata` generating dynamic page titles, descriptions, and OpenGraph tags per product.
  - Global custom 404 page (`/not-found`) maintaining store branding.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router 14)
- **Language**: JavaScript & JSX only (`.js` / `.jsx` — zero TypeScript)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: Signed cryptographic JWT sessions (`jose`) via HTTP-only cookies & `bcryptjs` password hashing
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (`motion`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Ordering Workflow**: Manual Order Now (customers place orders without online payment; store team confirms and arranges payment directly; legacy Stripe & COD infrastructure preserved for future reactivation)
- **Email**: [Nodemailer](https://nodemailer.com/) (SMTP notifications)
- **Media Uploads**: [Cloudinary](https://cloudinary.com/) (product images)
- **Project Structure**: Direct root architecture without `src/` directory.

---

## 📂 Project Structure

```text
AK-Kiosk/
├── app/
│   ├── layout.js                 # Root layout with fonts, metadata & providers
│   ├── page.js                   # Customer homepage with Hero & showcases
│   ├── globals.css               # Global Tailwind directives & custom CSS
│   ├── shop/page.js              # Live market catalog connected to MongoDB API
│   ├── categories/
│   │   ├── groceries/page.js     # Asian groceries & noodles category
│   │   ├── snacks/page.js        # Snacks & sweets category
│   │   └── drinks/page.js        # Asian drinks & teas category
│   ├── product/[slug]/page.js    # Dynamic product detail page
│   ├── cart/page.js              # Shopping bag with localStorage persistence (Stage 3)
│   ├── checkout/page.js          # Streamlined Order Now checkout (manual payment workflow)
│   ├── order-confirmation/page.js # Dynamic order confirmation and status
│   ├── login/page.js             # Customer sign-in (temporarily hidden via feature flag)
│   ├── register/page.js          # Customer account creation
│   ├── about/page.js             # Store heritage & mission in Oberhausen
│   ├── contact/page.js           # Store directions, hours & inquiry form
│   ├── admin/
│   │   ├── page.js               # Admin root redirecting to /admin/dashboard
│   │   ├── login/page.js         # Administrator sign-in gateway
│   │   └── (dashboard)/
│   │       ├── layout.js         # Responsive admin layout (sidebar + header)
│   │       ├── dashboard/page.js # Admin operations hub with live metrics
│   │       ├── products/page.js  # Product catalog management (Stage 2)
│   │       ├── orders/page.js    # Customer orders & fulfillment (Stage 3)
│   │       ├── inquiries/page.js # Customer inquiries inbox
│   │       ├── subscribers/page.js # Newsletter subscriber audience
│   │       ├── settings/page.js  # Store & delivery configuration
│   │       ├── help/page.js      # Operating manual & documentation
│   │       └── profile/page.js   # Administrator security profile
│   └── api/
│       ├── health/route.js       # Database connectivity health check
│       ├── categories/route.js   # Category list and admin category creation
│       ├── products/
│       │   ├── route.js          # Product catalog GET (public) & POST (admin)
│       │   └── [id]/route.js     # Single product GET, PUT & DELETE handlers
│       ├── orders/
│       │   ├── route.js          # COD order POST + public order lookup (Stage 3)
│       │   └── stripe/
│       │       ├── route.js      # Stripe Checkout Session creation (Stage 3)
│       │       └── webhook/route.js # Stripe webhook handler + signature (Stage 3)
│       └── admin/
│           ├── login/route.js    # Admin authentication & cookie issuance
│           ├── logout/route.js   # Admin session invalidation
│           ├── me/route.js       # Current administrator session details
│           ├── stats/route.js    # Live metrics: products, orders & revenue
│           ├── upload/route.js   # Secure Cloudinary file upload handler
│           └── orders/
│               ├── route.js      # Paginated admin order list (Stage 3)
│               └── [id]/route.js # Single order GET + status PATCH (Stage 3)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx            # Centered-logo navbar (desktop & mobile)
│   │   ├── MobileMenu.jsx        # Animated mobile slide-in drawer
│   │   ├── CartDrawer.jsx        # Slide-over shopping bag drawer
│   │   ├── SearchModal.jsx       # Real-time search modal with Ctrl+K
│   │   └── Footer.jsx            # Footer with store hours, links & Admin gateway
│   ├── home/
│   │   ├── HeroSection.jsx       # Layered floating hero composition
│   │   ├── CategorySection.jsx   # Curated department highlights
│   │   ├── Bestsellers.jsx       # Oberhausen top trending products
│   │   ├── PromotionalBanner.jsx # Voucher banner (AKWELCOME10)
│   │   ├── NewArrivals.jsx       # Just-landed specialty restocks
│   │   └── StoreLocation.jsx     # Physical store details & map
│   ├── products/
│   │   ├── ProductCard.jsx       # Product card with live MongoDB support
│   │   └── ProductGrid.jsx       # Responsive product grid wrapper
│   └── ui/
│       └── Button.jsx            # Pill-shaped animated button component
├── context/
│   ├── CartContext.jsx           # Global shopping bag state & notifications
│   └── AuthContext.jsx           # Customer session state
├── hooks/
│   └── useCart.js                # Custom hook for consuming cart context
├── lib/
│   ├── auth.js                   # Admin token creation, verification & seeding
│   ├── cloudinary.js             # Cloudinary SDK configuration & checks
│   ├── mailer.js                 # Nodemailer email utility (Stage 3)
│   ├── mongodb.js                # Reusable MongoDB Atlas cached connection
│   ├── products.js               # Static reference catalog & store info
│   └── utils.js                  # Tailwind class merger & Euro formatting
├── models/
│   ├── Admin.js                  # Administrator Mongoose schema
│   ├── Category.js               # Product Category Mongoose schema
│   ├── Order.js                  # Customer Order Mongoose schema (Stage 3)
│   └── Product.js                # Grocery Product Mongoose schema
├── middleware.js                 # Edge-compatible admin route protection
├── public/                       # Static public assets
├── .env.example                  # Environment configuration template
├── .env.local                    # Local environment variables (not committed)
├── jsconfig.json                 # Path aliases configuration (@/*)
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Custom color palette & animation tokens
├── postcss.config.mjs            # PostCSS configuration
├── Task.md                       # Implementation roadmap & checklist
└── package.json                  # Dependencies and scripts
```

---

## ⚙️ Environment Variables

Create `.env.local` based on `.env.example`:

```ini
# Public Store Metadata
NEXT_PUBLIC_STORE_NAME="AK Kiosk & Asian Market"
NEXT_PUBLIC_STORE_ADDRESS="Buschhausener Str. 63, 46049 Oberhausen, Germany"
NEXT_PUBLIC_STORE_CITY="Oberhausen, Germany"
NEXT_PUBLIC_STORE_PHONE="+49 208 1234567"
NEXT_PUBLIC_STORE_HOURS="Mon - Sat: 09:00 - 22:00 | Sun: 12:00 - 20:00"

# MongoDB Atlas Connection URI
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/akkiosk?retryWrites=true&w=majority"

# Administrator Authentication (Auto-provisioned on first launch)
ADMIN_EMAIL="admin@ak-kiosk.de"
ADMIN_PASSWORD="your_secure_password"
ADMIN_NAME="Store Administrator"
ADMIN_JWT_SECRET="your_random_64_character_signing_secret"

# Cloudinary Media Uploads (Optional: direct URLs supported as fallback)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# ─── Stage 3: Orders, Payments & Email ───────────────────────────────────────

# Admin Email Notifications (Nodemailer)
ADMIN_NOTIFICATION_EMAIL="store@ak-kiosk.de"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"

# ─── Active Operations: Email Notifications & Base URL ───────────────────────

# Admin Email Notifications (Nodemailer)
ADMIN_NOTIFICATION_EMAIL="store@ak-kiosk.de"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_store_email@gmail.com"
SMTP_PASS="your_16_character_google_app_password"

# Base URL for canonical links and Netlify deployment
NEXT_PUBLIC_BASE_URL="https://ak-kiosk.de"

# ─── Legacy / Inactive Subsystems (Preserved for Future Reactivation) ────────
# Note: The active checkout uses the manual "Order Now" workflow.
# Stripe and COD checkout options are disabled in customer UI.
# The variables below are NOT required for running the current application.
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

> **Note**: Passwords containing special characters (e.g. `#`) must be enclosed in double quotes in `.env` files.

---

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies MongoDB Atlas connectivity |
| `GET` | `/api/products` | Retrieves products with optional `?category=` filter |
| `GET` | `/api/products/[id]` | Retrieves a single product by MongoDB ID |
| `GET` | `/api/categories` | Retrieves merged categories (registered + products) |
| `GET` | `/api/settings` | Public store configuration (delivery fee, thresholds, business hours) |
| `POST` | `/api/orders` | Creates an Order Now order (manual payment arrangement) |
| `GET` | `/api/orders?orderNumber=&email=` or `?orderId=&email=` | Secure customer order lookup |
| `POST` | `/api/orders/stripe` | *Legacy / Inactive*: Stripe Checkout Session creation (preserved) |
| `POST` | `/api/orders/stripe/webhook` | *Legacy / Inactive*: Stripe webhook payment verification (preserved) |

### Admin Endpoints (require `ak_admin_session` cookie)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticates admin & sets secure session cookie |
| `POST` | `/api/admin/logout` | Clears admin session cookie |
| `GET` | `/api/admin/me` | Returns current administrator profile |
| `GET` | `/api/admin/stats` | Returns live products, orders & revenue metrics |
| `POST` | `/api/products` | Validates & inserts a new product document |
| `PUT` | `/api/products/[id]` | Updates existing product details & inventory |
| `DELETE` | `/api/products/[id]` | Permanently deletes a product from catalog |
| `POST` | `/api/categories` | Adds a new category |
| `POST` | `/api/admin/upload` | Validates & streams image uploads to Cloudinary |
| `GET` | `/api/admin/orders` | Paginated order list with search & filters |
| `GET` | `/api/admin/orders/[id]` | Full single order details |
| `PATCH` | `/api/admin/orders/[id]` | Updates order status (pending/confirmed/delivered/canceled) and/or payment status (pending/paid) |
| `GET` | `/api/admin/settings` | Retrieves store settings singleton from MongoDB |
| `PUT` | `/api/admin/settings` | Validates and updates store settings in MongoDB |
| `GET` | `/api/admin/profile` | Retrieves admin profile (name & email) |
| `PUT` | `/api/admin/profile` | Updates admin display name, email, or password |

---

## 🛡️ Admin Portal & Security

- **Login URL**: Accessible at `/admin/login` or via the discreet "Admin" link in the website footer.
- **Route Guarding**: Next.js `middleware.js` automatically intercepts unauthenticated visits to `/admin/*` and `/api/admin/*`, redirecting to `/admin/login`.
- **Session Security**: Authenticated sessions are cryptographically signed using `HS256` via `jose` and delivered via an **HTTP-only, Secure, SameSite=Lax** cookie (`ak_admin_session`). No tokens are stored in `localStorage`.
- **Password Security**: Passwords are saved as salted `bcrypt` hashes (12 rounds). Zero plaintext passwords exist in the database.
- **Auto-Provisioning**: On startup, if no administrator exists matching `ADMIN_EMAIL`, the account is securely hashed and provisioned in the MongoDB `admins` collection.

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your MongoDB Atlas connection string and administrator credentials.

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the customer storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to view the Admin Portal.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 💳 Payment Workflow & Legacy Integration Notice

### Active Workflow: Manual "Order Now"
- The storefront uses the **Order Now** manual workflow. Customers do not submit credit card details or make online payments on the website.
- When an order is placed:
  - Initial `orderStatus` is set to **Pending**.
  - Initial `paymentStatus` is set to **Pending**.
  - Stock is atomically reserved in MongoDB Atlas.
  - Email confirmations are dispatched to both the customer and the store administrator.
- Store staff review incoming orders in the **Admin Orders** dashboard (`/admin/orders`), contact the customer via phone or email to confirm order items, and coordinate payment manually (e.g. cash on delivery/pickup, direct bank transfer).
- After receiving payment, the authenticated administrator updates `paymentStatus` from **Pending** to **Paid** via the admin interface.

### Legacy Stripe & COD Preservation
- Both Stripe online checkout and Cash on Delivery (COD) are **disabled** as active customer checkout options.
- All Stripe-related source files (`/app/api/orders/stripe/route.js`, `/app/api/orders/stripe/webhook/route.js`, and `lib/orderFinalizer.js`) remain preserved and cleanly isolated in the repository for potential future reactivation.
- All historical Stripe orders and payment transaction records in MongoDB Atlas remain accessible in the admin portal.
- **Configuring Stripe is NOT required to deploy or operate the store.**

---

## 📧 Email Notifications Setup (Optional)

Email notifications require an SMTP server. Recommended options:
- **Gmail**: Use [App Passwords](https://myaccount.google.com/apppasswords) with `smtp.gmail.com:587`.
- **Outlook / Hotmail**: `smtp-mail.outlook.com:587`.
- **Mailgun / SendGrid / Brevo**: Use their SMTP credentials.

---

## ☁️ Netlify Deployment Guide

This application is fully optimized for continuous deployment on [Netlify](https://www.netlify.com/) using the Next.js 14 App Router and `@netlify/plugin-nextjs`.

### 1. Pre-Deployment Setup
1. **MongoDB Atlas IP Whitelist**:
   - In MongoDB Atlas, go to **Network Access** &rarr; **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) since Netlify serverless functions run from dynamic IP ranges.
2. **Git Repository Hygiene**:
   - Verify `.env.local` is listed in `.gitignore` (already configured).
   - **Never commit `.env.local` or sensitive secrets to GitHub.**

### 2. Deploying to Netlify
1. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site" &rarr; "Import an existing project"**.
2. Connect your Git provider (GitHub, GitLab, or Bitbucket) and select the `AK-Kiosk` repository.
3. Configure the build settings (already defined in `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. Expand **Environment variables** and enter the production environment variables listed below.
5. Click **Deploy Site**.

> **Note on Environment Changes:** Any time you add or update an environment variable in Netlify Site Settings, you must trigger a new deploy (**Deploys &rarr; Trigger deploy &rarr; Clear cache and deploy site**) for the new variables to take effect.

---

## 🔐 Client Handover & Netlify Configuration Reference

### 1. External Accounts & Services the Client Must Own
To ensure full sovereignty and operational independence, the client should own or have administrator access to the following accounts:
- **Netlify Account**: Hosts and runs the storefront and administrator dashboard.
- **MongoDB Atlas Account**: Holds the store database (products, categories, orders, subscribers, inquiries, and settings).
- **Cloudinary Account**: Cloud storage for high-resolution product photography.
- **Gmail Account (or Business SMTP)**: Sends order confirmations and inquiry notifications.
- **Custom Domain Registrar (optional)**: Manages `ak-kiosk.de` DNS pointers to Netlify.

### 2. Production Environment Variables in Netlify

| Variable Name | Category | Sensitivity | Description |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Database | **Confidential Secret** | MongoDB Atlas connection string (`mongodb+srv://...`). |
| `ADMIN_JWT_SECRET` | Authentication | **Confidential Secret** | Random 64-character secret for signing administrator session cookies. |
| `CUSTOMER_JWT_SECRET` | Authentication | **Confidential Secret** | Random 64-character secret for signing customer session tokens. |
| `ADMIN_EMAIL` | Initial Provisioning | Confidential | Initial admin login email (only used to seed on fresh database). |
| `ADMIN_PASSWORD` | Initial Provisioning | **Confidential Secret** | Initial admin login password (only used to seed on fresh database). |
| `ADMIN_NAME` | Initial Provisioning | Config | Display name for initial administrator (defaults to "Store Administrator"). |
| `CLOUDINARY_CLOUD_NAME` | Media Uploads | Public Config | Cloudinary bucket cloud name. |
| `CLOUDINARY_API_KEY` | Media Uploads | Public Config | Cloudinary public API Key. |
| `CLOUDINARY_API_SECRET` | Media Uploads | **Confidential Secret** | Cloudinary API Secret for uploading product images. |
| `SMTP_HOST` | Email Notifications | Config | Mail server hostname (e.g. `smtp.gmail.com`). |
| `SMTP_PORT` | Email Notifications | Config | Mail server port (`587` for TLS or `465` for SSL). |
| `SMTP_SECURE` | Email Notifications | Config | `false` for port 587 (TLS), `true` for port 465 (SSL). |
| `SMTP_USER` | Email Notifications | Confidential | Gmail address or SMTP username sending notifications. |
| `SMTP_PASS` | Email Notifications | **Confidential Secret** | Google App Password (16 characters, not personal Gmail password). |
| `ADMIN_NOTIFICATION_EMAIL`| Email Notifications | Config | Store recipient email receiving new order and inquiry alerts. |
| `NEXT_PUBLIC_BASE_URL` | Application Domain | Public Config | Canonical domain URL (e.g. `https://ak-kiosk.de` or `https://ak-kiosk.netlify.app`). |

### 3. Setting Up Gmail SMTP with Google App Passwords
1. Sign in to the store's Google Account and navigate to **Security** &rarr; **2-Step Verification**. Ensure 2-Step Verification is active.
2. Search for **App passwords** (or go to `myaccount.google.com/apppasswords`).
3. Create a new App Password named `AK Kiosk Store`.
4. Copy the generated 16-character password and set it as `SMTP_PASS` in Netlify.
5. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, and `SMTP_USER=your_store_email@gmail.com`.

### 4. Initial Admin Account Creation & Overwrite Protection
When the application starts against an empty database, the primary administrator account is automatically created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`:
- The provisioning engine checks `await Admin.countDocuments() === 0`.
- Once created, existing credentials in MongoDB are **never automatically overwritten** by server restarts or Netlify deployments.
- The client can update their login email, password, and display name at any time via **Admin Profile** (`/admin/profile`).

### 5. Managing Credentials via Admin Profile
1. Log in to `/admin/login`.
2. Go to **Admin Profile** (`/admin/profile`).
3. **Change Display Name**: Update full name and click **Save Name**.
4. **Change Email Address**: Provide the new email and confirm with the current password.
5. **Change Master Password**: Enter current password, provide a strong new password (8+ characters, uppercase, lowercase, numbers), confirm the new password, and save.
6. For security, changing credentials terminates the current session cookie and prompts the administrator to re-authenticate with the new credentials.

### 6. Emergency Password Recovery Procedure
If the administrator completely forgets their password:
1. **Direct Atlas Password Hash Update**: An authorized engineer with MongoDB Atlas database access can update the document in the `admins` collection with a fresh bcrypt hash.
2. **Automated Re-Provisioning**: Alternatively, deleting the document in the `admins` collection triggers automated re-seeding from Netlify's `ADMIN_EMAIL` and `ADMIN_PASSWORD` on the next visit to `/admin/login`.

---

## 🛒 Customer Ordering Workflow (Order Now)

In accordance with the client's operational model, the customer shopping experience uses a streamlined **Order Now** manual payment workflow:
1. Customers browse the live catalog, adjust quantities, and click **Order Now**.
2. Customers enter their contact details (full name, email, phone number) and local delivery address.
3. No online card details or upfront payment is collected through the website.
4. Upon clicking **Order Now**:
   - Stock is atomically checked and deducted from MongoDB Atlas in real-time.
   - The order is recorded with order status **Pending** and payment status **Pending**.
   - Confirmation emails are dispatched to both the customer and store staff.
5. The customer is redirected to the **Order Confirmation** page displaying:
   > *"Thank you for your order! Our team will contact you shortly to confirm your order and arrange payment."*
6. Store administrators review the order under `/admin/orders`, contact the customer directly via phone or email, and mark the order as **Paid** and **Confirmed** once payment is settled.

> **Stripe Preservation**: Historical Stripe transactions and the underlying Stripe checkout infrastructure (`/api/orders/stripe`, webhook handlers, and `lib/orderFinalizer.js`) remain completely preserved in the codebase for easy future reactivation.

---

## 📍 Store Information
- **Store Name**: AK Kiosk & Asian Market
- **Address**: Buschhausener Str. 63, 46049 Oberhausen, Germany
- **Opening Hours**:
  - Monday – Saturday: 09:00 – 22:00
  - Sunday & Public Holidays: 12:00 – 20:00
