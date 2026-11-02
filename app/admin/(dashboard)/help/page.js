"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ArrowLeft,
  BookOpen,
  Package,
  Code2,
  Search,
  ChevronRight,
  Shield,
  Key,
  Database,
  Truck,
  CreditCard,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  Terminal,
  FileText,
  Server,
  Zap,
} from "lucide-react";

export default function AdminHelpPage() {
  const [activeTab, setActiveTab] = useState("manual"); // "manual" | "products" | "developer"
  const [searchQuery, setSearchQuery] = useState("");

  const TABS = [
    { id: "manual", label: "Admin Operating Manual", icon: BookOpen },
    { id: "products", label: "Product Guidelines", icon: Package },
    { id: "developer", label: "Developer Reference", icon: Code2 },
  ];

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const results = [];

    // Helper to search within sections
    const searchIn = (tabId, tabName, title, tags, description) => {
      if (
        title.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        tags.some((t) => t.toLowerCase().includes(q))
      ) {
        results.push({ tabId, tabName, title, description });
      }
    };

    // Manual topics
    searchIn("manual", "Operating Manual", "Admin Login & Session Security", ["auth", "login", "jwt", "cookies"], "Step-by-step instructions for signing into the administrative console and session timeout policies.");
    searchIn("manual", "Operating Manual", "Dashboard Overview & Live Stats", ["metrics", "sales", "revenue", "analytics"], "Explaining real-time gross revenue, order tallies, low-inventory alerts, and quick actions.");
    searchIn("manual", "Operating Manual", "Order Fulfillment & Manual Payment Workflow", ["orders", "fulfillment", "shipping", "statuses", "order now", "manual payment"], "Managing orders received via Order Now, contacting customers by phone/email to confirm items and coordinate payment manually.");
    searchIn("manual", "Operating Manual", "Customer Inquiries Management", ["inquiries", "contact", "messages", "support"], "Reviewing customer contact form submissions, updating progress statuses, and recording private notes.");
    searchIn("manual", "Operating Manual", "Newsletter Subscribers & CSV Export", ["subscribers", "newsletter", "export", "csv"], "Managing newsletter subscribers and exporting safe CSV rosters with formula-injection mitigation.");
    searchIn("manual", "Operating Manual", "Store Settings & Delivery Radius", ["settings", "hours", "delivery", "tax", "vat"], "Updating store address, weekly opening hours, Oberhausen delivery fees, and notification emails.");
    searchIn("manual", "Operating Manual", "Admin Profile & Credential Handover", ["password", "email", "credentials", "security", "profile"], "Changing administrator display name, login email, and updating master passwords with verification.");

    // Product topics
    searchIn("products", "Product Guidelines", "Adding a New Product", ["product", "modal", "create", "inventory"], "Step-by-step instructions for creating products with name, price, stock, and descriptions.");
    searchIn("products", "Product Guidelines", "Category Assignment & Taxonomy", ["categories", "groceries", "snacks", "drinks"], "Mapping products to Asian Groceries, Snacks & Sweets, Drinks & Teas, and Instant Ramen.");
    searchIn("products", "Product Guidelines", "Pricing & Promotional Discounts", ["price", "discount", "originalPrice", "vat"], "Configuring base prices and promotional strikethrough original prices.");
    searchIn("products", "Product Guidelines", "Uploading Images via Cloudinary", ["cloudinary", "images", "photos", "upload"], "Best practices for web-optimized product photography, resolution, and troubleshooting upload failures.");
    searchIn("products", "Product Guidelines", "Stock Management & Low Inventory Alerts", ["stock", "quantity", "inventory", "sold out"], "Setting accurate stock counts, atomic deduction during checkout, and out-of-stock indicators.");
    searchIn("products", "Product Guidelines", "SKU & Barcode Identification", ["sku", "barcode", "identifiers"], "Using unique stock keeping units (SKUs) for physical shelf alignment in the Oberhausen market.");

    // Developer topics
    searchIn("developer", "Developer Reference", "Technology Stack & Frameworks", ["nextjs", "react", "mongodb", "tailwind", "stripe"], "Next.js 14 App Router, Mongoose 9, Stripe 23, Nodemailer 10, Cloudinary 2.");
    searchIn("developer", "Developer Reference", "Initial Admin Provisioning & Env Overwrite Prevention", ["env", "admin_email", "admin_password", "provisioning"], "Explaining how ADMIN_EMAIL and ADMIN_PASSWORD only seed when 0 admins exist, never overwriting client credentials.");
    searchIn("developer", "Developer Reference", "Client Handover & Password Recovery", ["handover", "forgot password", "recovery", "mongodb"], "Procedures for client handover, environment variables in Netlify/Vercel, and database reset.");
    searchIn("developer", "Developer Reference", "Complete API Reference Table", ["api", "endpoints", "routes", "rest"], "All public and protected endpoints with methods, authentication requirements, and payloads.");
    searchIn("developer", "Developer Reference", "Order Finalization & Webhook Idempotency", ["stripe", "webhook", "idempotency", "stock"], "Idempotent Stripe checkout finalization and atomic MongoDB inventory decrement.");

    return results;
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ak-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/dashboard"
              className="text-xs text-ak-charcoal-light hover:text-ak-burgundy transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ak-charcoal">
            Help, Documentation & Operating Manual
          </h1>
          <p className="text-xs text-ak-charcoal-muted mt-0.5">
            Comprehensive guides for store administration, inventory cataloging, and technical developer specifications
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ak-charcoal/15 bg-white text-xs text-ak-charcoal placeholder-ak-charcoal-light/60 focus:outline-hidden focus:border-ak-burgundy transition-all"
          />
          <Search className="w-4 h-4 text-ak-charcoal-light absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ak-charcoal-light hover:text-ak-charcoal font-bold"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Search Results Display */}
      {filteredTopics !== null && (
        <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-ak-charcoal/10">
            <span className="text-xs font-bold text-ak-charcoal">
              Search Results for &ldquo;{searchQuery}&rdquo; ({filteredTopics.length} matches)
            </span>
          </div>

          {filteredTopics.length === 0 ? (
            <p className="text-xs text-ak-charcoal-muted py-4 text-center">
              No matching documentation topics found. Try different keywords such as &ldquo;password&rdquo;, &ldquo;orders&rdquo;, &ldquo;stripe&rdquo;, or &ldquo;cloudinary&rdquo;.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTopics.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab(res.tabId);
                    setSearchQuery("");
                  }}
                  className="p-3.5 rounded-2xl bg-[#F8FAFB] hover:bg-ak-icy-blue/40 border border-ak-charcoal/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ak-burgundy">
                      {res.tabName}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-ak-charcoal-light" />
                  </div>
                  <h4 className="text-xs font-bold text-ak-charcoal mb-1">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-ak-charcoal-muted leading-relaxed line-clamp-2">
                    {res.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ak-charcoal/10 pb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-ak-burgundy text-white shadow-xs"
                  : "bg-white text-ak-charcoal hover:bg-ak-charcoal/5 border border-ak-charcoal/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: ADMIN OPERATING MANUAL */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "manual" && (
        <div className="space-y-6">
          {/* Card: Authentication & Session Security */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-burgundy pb-2 border-b border-ak-charcoal/5">
              <Shield className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                1. Administrator Login, Sessions & Logout
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <p>
                The administrative dashboard is strictly protected by encrypted JSON Web Tokens (JWT) stored in HTTP-only, SameSite cookies. Public visitors and search crawlers cannot access administrative routes.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-ak-charcoal-muted ml-2">
                <li><strong className="text-ak-charcoal">Logging In:</strong> Navigate to <code className="bg-ak-charcoal/5 px-1.5 py-0.5 rounded text-ak-burgundy font-mono text-[11px]">/admin/login</code>, enter your administrator email and password. Selecting &ldquo;Remember me&rdquo; extends your session to 7 days; otherwise it expires after 24 hours.</li>
                <li><strong className="text-ak-charcoal">Session Invalidation:</strong> Changing your admin email or password immediately revokes your current session cookie for security, requiring you to re-authenticate with the new credentials.</li>
                <li><strong className="text-ak-charcoal">Logging Out:</strong> Click the &ldquo;Log Out&rdquo; button at the bottom of the admin sidebar or in the user menu. This clears the HTTP-only cookie and redirects you to the login screen.</li>
              </ul>
            </div>
          </div>

          {/* Card: Dashboard Overview */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-gold pb-2 border-b border-ak-charcoal/5">
              <Zap className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                2. Dashboard Overview & Real-Time Statistics
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <p>
                The primary dashboard (<code className="bg-ak-charcoal/5 px-1.5 py-0.5 rounded font-mono text-[11px]">/admin/dashboard</code>) aggregates store metrics directly from MongoDB Atlas:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Total Revenue</span>
                  <span className="text-base font-bold text-ak-charcoal mt-0.5 block">Live Aggregate</span>
                  <p className="text-[11px] text-ak-charcoal-muted mt-1">Calculates gross sum of all confirmed & paid orders.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Active Orders</span>
                  <span className="text-base font-bold text-ak-charcoal mt-0.5 block">Pending & Confirmed</span>
                  <p className="text-[11px] text-ak-charcoal-muted mt-1">Orders requiring packing or delivery dispatch.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Product Catalog</span>
                  <span className="text-base font-bold text-ak-charcoal mt-0.5 block">Live SKUs</span>
                  <p className="text-[11px] text-ak-charcoal-muted mt-1">Active inventory items displayed in the storefront.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Inventory Alerts</span>
                  <span className="text-base font-bold text-rose-600 mt-0.5 block">Stock &lt; 5 units</span>
                  <p className="text-[11px] text-ak-charcoal-muted mt-1">Items nearing exhaustion requiring restocking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Order Management */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-burgundy pb-2 border-b border-ak-charcoal/5">
              <Truck className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                3. Order Fulfillment &amp; Manual Payment Workflow (Order Now)
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <p>
                Navigate to <strong className="text-ak-charcoal">Orders</strong> (<code className="bg-ak-charcoal/5 px-1.5 py-0.5 rounded font-mono text-[11px]">/admin/orders</code>) to manage customer orders received through the <strong>Order Now</strong> checkout workflow.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <span className="font-bold text-amber-950 block">Operational Order Procedure:</span>
                <ol className="list-decimal list-inside space-y-1 text-amber-900 text-[11px]">
                  <li>Review the newly placed order in the queue with initial status <strong>Pending</strong>.</li>
                  <li>Click to expand customer details and note their contact phone number and email address.</li>
                  <li>Contact the customer promptly to verify item availability, confirm the Oberhausen delivery address or pickup window, and agree on the payment method.</li>
                  <li>Once payment is collected (e.g. in cash or card upon delivery/counter pickup), update the payment status to <strong>Paid</strong> and the order status to <strong>Confirmed</strong>.</li>
                </ol>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ak-charcoal/10 text-ak-charcoal-muted font-bold text-[10px] uppercase">
                      <th className="py-2 pr-4">Order Status</th>
                      <th className="py-2 pr-4">Payment Method</th>
                      <th className="py-2">Operational Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ak-charcoal/5">
                    <tr>
                      <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Pending</span></td>
                      <td className="py-2.5 pr-4">Order Now (Manual)</td>
                      <td className="py-2.5 text-ak-charcoal-muted">New order awaiting store contact. Call or email customer to confirm items and coordinate manual payment.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Confirmed</span></td>
                      <td className="py-2.5 pr-4">Order Now / Settled</td>
                      <td className="py-2.5 text-ak-charcoal-muted">Order verified with customer and payment arranged/received. Package items and prepare for dispatch or pickup.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Delivered</span></td>
                      <td className="py-2.5 pr-4">Order Now / Settled</td>
                      <td className="py-2.5 text-ak-charcoal-muted">Order has reached the customer or has been collected at the store. Fulfillment is complete.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">Canceled</span></td>
                      <td className="py-2.5 pr-4">Any</td>
                      <td className="py-2.5 text-ak-charcoal-muted">Customer canceled or could not be reached. Manually audit physical inventory if items were pre-packed.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card: Inquiries & Subscribers */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-charcoal pb-2 border-b border-ak-charcoal/5">
              <Mail className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                4. Customer Inquiries & Marketing Subscribers
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5 space-y-2">
                  <h3 className="font-bold text-ak-charcoal">Customer Inquiries</h3>
                  <p className="text-ak-charcoal-muted leading-relaxed">
                    Submissions from <code className="bg-ak-charcoal/5 px-1 py-0.5 rounded text-ak-burgundy">/contact</code> appear in real-time under <strong className="text-ak-charcoal">Inquiries</strong>. You can change their status from <span className="text-amber-700 font-semibold">New</span> to <span className="text-blue-700 font-semibold">In Progress</span> and <span className="text-emerald-700 font-semibold">Resolved</span>, and record private internal staff notes.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5 space-y-2">
                  <h3 className="font-bold text-ak-charcoal">Newsletter Subscribers & CSV Export</h3>
                  <p className="text-ak-charcoal-muted leading-relaxed">
                    Customer emails entered into the footer newsletter form are saved with double-opt-in timestamps and unique unsubscribe tokens. Use the <strong>Export CSV</strong> button to download contacts. All cells are hardened against formula injection attacks (<code className="text-[10px] font-mono">=, +, -, @</code> prefixes).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Troubleshooting Common Problems */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-amber-700 pb-2 border-b border-ak-charcoal/5">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                5. Troubleshooting Common Administrative Issues
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <strong className="text-amber-900 block mb-1">Issue: &ldquo;Session Expired&rdquo; or unexpected redirect to login</strong>
                <p className="text-amber-800 leading-relaxed">
                  JWT sessions expire after 24 hours (or 7 days if &ldquo;Remember me&rdquo; was checked). Additionally, if another administrator changed the account password or email, all active sessions are revoked. Simply log back in.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <strong className="text-amber-900 block mb-1">Issue: Product image upload fails with &ldquo;Cloudinary Error&rdquo;</strong>
                <p className="text-amber-800 leading-relaxed">
                  Verify that <code className="font-mono text-[11px]">CLOUDINARY_CLOUD_NAME</code>, <code className="font-mono text-[11px]">CLOUDINARY_API_KEY</code>, and <code className="font-mono text-[11px]">CLOUDINARY_API_SECRET</code> are configured in your hosting environment. Ensure uploaded image files are in JPG, PNG, or WebP format under 5MB.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: PRODUCT MANAGEMENT GUIDELINES */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Card: Product Creation */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-burgundy pb-2 border-b border-ak-charcoal/5">
              <Package className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                1. Product Creation & Cataloging Standards
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <p>
                To create a product, go to <strong className="text-ak-charcoal">Products</strong> (<code className="bg-ak-charcoal/5 px-1.5 py-0.5 rounded font-mono text-[11px]">/admin/products</code>) and click the <strong>&ldquo;+ Add Product&rdquo;</strong> button. Complete each field according to the store taxonomy:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="font-bold text-ak-charcoal block mb-1">Title & Brand</span>
                  <p className="text-ak-charcoal-muted leading-relaxed">
                    Include the brand name, exact flavor/variant, and size (e.g. <em>&ldquo;Samyang Buldak Carbonara Ramen 130g&rdquo;</em>).
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="font-bold text-ak-charcoal block mb-1">Category Assignment</span>
                  <p className="text-ak-charcoal-muted leading-relaxed">
                    Assign to one of the 4 core categories: <strong>Asian Groceries</strong>, <strong>Snacks & Sweets</strong>, <strong>Drinks & Teas</strong>, or <strong>Instant Ramen & Noodles</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="font-bold text-ak-charcoal block mb-1">Pricing & Discounts</span>
                  <p className="text-ak-charcoal-muted leading-relaxed">
                    Set <strong>Price</strong> (the selling price, VAT inclusive). If the item is discounted, enter the pre-sale price in <strong>Original Price</strong> to show a strikethrough badge.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                  <span className="font-bold text-ak-charcoal block mb-1">Stock & Availability</span>
                  <p className="text-ak-charcoal-muted leading-relaxed">
                    Set the exact physical inventory available. Setting stock to <strong>0</strong> marks the product as &ldquo;Out of Stock&rdquo; on the storefront and disables the &ldquo;Add to Cart&rdquo; button.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Images & Cloudinary */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-gold pb-2 border-b border-ak-charcoal/5">
              <Layers className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                2. Product Image Standards & Cloudinary Uploads
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <p>
                High-quality visual presentation directly drives customer conversion:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-ak-charcoal-muted ml-2">
                <li><strong className="text-ak-charcoal">Primary Image:</strong> The main image displayed on product cards, category pages, and search previews. Recommended aspect ratio is 1:1 square or 4:3, minimum 800x800 pixels.</li>
                <li><strong className="text-ak-charcoal">Additional Gallery Images:</strong> You can upload up to 2 additional images showing the nutrition label, packaging reverse, or prepared food.</li>
                <li><strong className="text-ak-charcoal">Upload Mechanism:</strong> You can either drag & drop an image file directly into the Cloudinary uploader, or paste an existing HTTPS image link.</li>
                <li><strong className="text-ak-charcoal">File Constraints:</strong> Supported formats are JPEG, PNG, and WebP. Maximum file size is 5MB per upload.</li>
              </ul>
            </div>
          </div>

          {/* Card: Common Mistakes */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700 pb-2 border-b border-ak-charcoal/5">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                3. Common Product Management Pitfalls to Avoid
              </h2>
            </div>
            <div className="space-y-2 text-xs text-ak-charcoal leading-relaxed">
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/60 space-y-1">
                <span className="font-bold text-rose-900 block">1. Setting Original Price lower than Selling Price</span>
                <p className="text-rose-800 text-[11px]">
                  If &ldquo;Original Price&rdquo; is entered, ensure it is greater than &ldquo;Price&rdquo;, otherwise the discount percentage calculation will be negative.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/60 space-y-1">
                <span className="font-bold text-rose-900 block">2. Inaccurate Physical Stock</span>
                <p className="text-rose-800 text-[11px]">
                  Because the checkout engine atomically decrements MongoDB stock in real-time, keeping inaccurate inventory counts will allow customers to place orders for products you cannot fulfill.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: DEVELOPER REFERENCE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "developer" && (
        <div className="space-y-6">
          {/* Card: Technology Stack */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-burgundy pb-2 border-b border-ak-charcoal/5">
              <Server className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                1. System Architecture & Tech Stack
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Framework</span>
                <span className="font-bold text-ak-charcoal text-sm block mt-0.5">Next.js 14.2 (App Router)</span>
                <span className="text-ak-charcoal-muted text-[11px]">React 18, Server Components, API route handlers</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Database & ODM</span>
                <span className="font-bold text-ak-charcoal text-sm block mt-0.5">MongoDB Atlas / Mongoose 9</span>
                <span className="text-ak-charcoal-muted text-[11px]">Cached connection pool singleton in lib/mongodb.js</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Authentication</span>
                <span className="font-bold text-ak-charcoal text-sm block mt-0.5">Signed JWT (jose) + bcryptjs</span>
                <span className="text-ak-charcoal-muted text-[11px]">HTTP-only cookies ak_admin_session & ak_customer_session</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Payments</span>
                <span className="font-bold text-ak-charcoal text-sm block mt-0.5">Stripe 23.1 + COD</span>
                <span className="text-ak-charcoal-muted text-[11px]">Checkout sessions, return verification, webhook idempotency</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Transactional Email</span>
                <span className="font-bold text-ak-charcoal text-sm block mt-0.5">Nodemailer 10.3</span>
                <span className="text-ak-charcoal-muted text-[11px]">HTML receipts, inquiry notifications, double-send locks</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-ak-charcoal-muted block">Media Storage</span>
                <span className="font-bold text-ak-charcoal text-sm block mt-0.5">Cloudinary v2</span>
                <span className="text-ak-charcoal-muted text-[11px]">Server-side buffer upload, auto-format & CDN delivery</span>
              </div>
            </div>
          </div>

          {/* Card: Client Handover & Initial Provisioning */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-700 pb-2 border-b border-ak-charcoal/5">
              <Key className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                2. Client Handover & Credential Management Specifications
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <p>
                To allow the client full sovereignty over their administrative login credentials without risk of deployment overwrites:
              </p>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
                <h4 className="font-bold text-emerald-900">Initial Admin Provisioning Policy</h4>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  The initial administrator account is automatically created from <code className="font-mono bg-white/70 px-1 py-0.5 rounded">ADMIN_EMAIL</code>, <code className="font-mono bg-white/70 px-1 py-0.5 rounded">ADMIN_PASSWORD</code>, and <code className="font-mono bg-white/70 px-1 py-0.5 rounded">ADMIN_NAME</code> <strong>only when zero administrator accounts exist</strong> in MongoDB Atlas (<code className="font-mono text-[10px]">Admin.countDocuments() === 0</code>). Once provisioned, environment variables will <strong>never overwrite</strong> credentials updated by the client in Admin Profile.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-ak-charcoal">How the Client Changes Credentials:</h4>
                <ol className="list-decimal list-inside space-y-1 text-ak-charcoal-muted ml-1">
                  <li>Navigate to <strong className="text-ak-charcoal">Admin Profile</strong> (<code className="bg-ak-charcoal/5 px-1 py-0.5 rounded font-mono text-[10px]">/admin/profile</code>).</li>
                  <li>To update email: Enter new email address and verify by typing current password.</li>
                  <li>To update password: Enter current password, new strong password (8+ chars, uppercase, lowercase, number), and confirm password.</li>
                  <li>Submitting changes updates the hashed record in MongoDB and automatically invalidates the session cookie, redirecting the admin to log in with their new credentials.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <span className="font-bold text-xs block">Emergency Password Recovery Procedure</span>
                <p className="text-[11px] leading-relaxed">
                  If the client completely forgets their password and cannot access their account: A system engineer with MongoDB Atlas database access can either update the hash directly or delete the record from the <code className="font-mono">admins</code> collection. Upon the next visit to <code className="font-mono">/admin/login</code>, the system will detect 0 admins and re-provision using the hosting environment variables.
                </p>
              </div>
            </div>
          </div>

          {/* Card: API Endpoints Table */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-burgundy pb-2 border-b border-ak-charcoal/5">
              <FileText className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                3. Complete API Endpoint Reference
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ak-charcoal/10 text-ak-charcoal-muted font-bold text-[10px] uppercase">
                    <th className="py-2 pr-3">Endpoint Route</th>
                    <th className="py-2 pr-3">Method</th>
                    <th className="py-2 pr-3">Authentication</th>
                    <th className="py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ak-charcoal/5 font-mono text-[11px]">
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/login</td>
                    <td className="py-2 pr-3 text-emerald-700 font-bold">POST</td>
                    <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Public</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Authenticates admin credentials, sets HTTP-only session cookie.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/logout</td>
                    <td className="py-2 pr-3 text-rose-700 font-bold">POST</td>
                    <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Public</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Clears admin session cookie.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/profile</td>
                    <td className="py-2 pr-3 text-blue-700 font-bold">GET, PUT</td>
                    <td className="py-2 pr-3 text-ak-burgundy font-bold font-sans">Admin Session</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Reads or updates name, email, and password with current password verification.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/settings</td>
                    <td className="py-2 pr-3 text-blue-700 font-bold">GET, PUT</td>
                    <td className="py-2 pr-3 text-ak-burgundy font-bold font-sans">Admin Session</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Reads or updates store hours, delivery fees, tax rates, and notifications.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/orders</td>
                    <td className="py-2 pr-3 text-blue-700 font-bold">GET, PATCH</td>
                    <td className="py-2 pr-3 text-ak-burgundy font-bold font-sans">Admin Session</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Lists orders with pagination; updates orderStatus (pending/confirmed/delivered/canceled) and paymentStatus (pending/paid).</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/settings</td>
                    <td className="py-2 pr-3 text-blue-700 font-bold">GET</td>
                    <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Public</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Returns public store settings (delivery fee, free delivery threshold, store info, hours).</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/subscribers</td>
                    <td className="py-2 pr-3 text-blue-700 font-bold">GET, DELETE</td>
                    <td className="py-2 pr-3 text-ak-burgundy font-bold font-sans">Admin Session</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Rosters newsletter subscribers; supports ?format=csv export.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/inquiries</td>
                    <td className="py-2 pr-3 text-blue-700 font-bold">GET, PATCH</td>
                    <td className="py-2 pr-3 text-ak-burgundy font-bold font-sans">Admin Session</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Reads inquiries or updates status & admin staff notes.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/admin/upload</td>
                    <td className="py-2 pr-3 text-emerald-700 font-bold">POST</td>
                    <td className="py-2 pr-3 text-ak-burgundy font-bold font-sans">Admin Session</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Uploads multipart/form-data images to Cloudinary bucket.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/orders</td>
                    <td className="py-2 pr-3 text-emerald-700 font-bold">POST</td>
                    <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Public</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Creates new order via Order Now manual workflow with atomic stock decrement.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-ak-charcoal">/api/orders/stripe</td>
                    <td className="py-2 pr-3 text-emerald-700 font-bold">POST</td>
                    <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Public (Preserved)</td>
                    <td className="py-2 text-ak-charcoal-muted font-sans">Historical Stripe session creator (preserved for future reactivation).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Hosting Environment Variables on Netlify */}
          <div className="bg-white rounded-3xl border border-ak-charcoal/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-ak-charcoal pb-2 border-b border-ak-charcoal/5">
              <Terminal className="w-5 h-5" />
              <h2 className="font-serif text-lg font-bold text-ak-charcoal">
                4. Netlify Production Deployment &amp; Environment Variables
              </h2>
            </div>
            <div className="text-xs text-ak-charcoal leading-relaxed space-y-3">
              <p>
                Configure the following variables in your <strong>Netlify Site Settings &rarr; Environment Variables</strong> dashboard. <em>Never commit these values to public Git repositories!</em>
              </p>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5 space-y-1 text-[11px] text-ak-charcoal-muted">
                <span className="font-bold text-ak-charcoal block">Netlify Build Settings:</span>
                <div>&bull; <strong>Build Command:</strong> <code className="font-mono bg-white px-1 py-0.5 rounded border border-ak-charcoal/10">npm run build</code></div>
                <div>&bull; <strong>Publish Directory:</strong> <code className="font-mono bg-white px-1 py-0.5 rounded border border-ak-charcoal/10">.next</code></div>
                <div>&bull; <strong>Next.js Runtime:</strong> Netlify detects Next.js 14 App Router automatically using the essential Next.js plugin.</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ak-charcoal/10 text-ak-charcoal-muted font-bold text-[10px] uppercase">
                      <th className="py-2 pr-3">Variable Name</th>
                      <th className="py-2 pr-3">Requirement</th>
                      <th className="py-2">Purpose &amp; Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ak-charcoal/5 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">MONGODB_URI</td>
                      <td className="py-2 pr-3 text-rose-700 font-bold font-sans">Mandatory Secret</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">MongoDB Atlas connection string with cluster credentials.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">ADMIN_JWT_SECRET</td>
                      <td className="py-2 pr-3 text-rose-700 font-bold font-sans">Mandatory Secret</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Cryptographic HMAC key used to sign administrative JWT cookies.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">CUSTOMER_JWT_SECRET</td>
                      <td className="py-2 pr-3 text-rose-700 font-bold font-sans">Mandatory Secret</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Cryptographic key used to sign customer session cookies.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">ADMIN_EMAIL</td>
                      <td className="py-2 pr-3 text-amber-700 font-bold font-sans">Initial Provisioning</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Initial admin email (only seeded when 0 admins exist in database).</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">ADMIN_PASSWORD</td>
                      <td className="py-2 pr-3 text-rose-700 font-bold font-sans">Initial Secret</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Initial admin password (only seeded when 0 admins exist in database).</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">NEXT_PUBLIC_BASE_URL</td>
                      <td className="py-2 pr-3 text-blue-700 font-bold font-sans">Public Config</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Canonical domain (e.g. https://ak-kiosk.netlify.app) for redirects.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">CLOUDINARY_CLOUD_NAME</td>
                      <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Media Uploads</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Cloudinary bucket cloud name for product photo uploads.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">CLOUDINARY_API_KEY</td>
                      <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Media Uploads</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Cloudinary public API key.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">CLOUDINARY_API_SECRET</td>
                      <td className="py-2 pr-3 text-rose-700 font-bold font-sans">Mandatory Secret</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Cloudinary API secret key.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">SMTP_HOST / USER / PASS</td>
                      <td className="py-2 pr-3 text-amber-700 font-bold font-sans">Email Notifications</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Gmail SMTP / App password for order &amp; inquiry alerts.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-ak-charcoal font-semibold">STRIPE_SECRET_KEY</td>
                      <td className="py-2 pr-3 text-ak-charcoal-muted font-sans">Optional (Preserved)</td>
                      <td className="py-2 text-ak-charcoal-muted font-sans">Stripe secret key — only required if online card payments are re-enabled.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
