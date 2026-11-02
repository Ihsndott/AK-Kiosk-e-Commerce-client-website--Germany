"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";

const DEFAULT_FREE_DELIVERY_THRESHOLD = 35;
const DEFAULT_DELIVERY_FEE = 3.5;

const COUNTRIES = ["Germany", "Netherlands", "Belgium", "Austria", "Switzerland"];

export default function CheckoutPage() {
  const { items, subtotal, clearCart, refreshCartWithServer, hydrated } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const paymentMethod = "manual";

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "Oberhausen",
    postalCode: "",
    country: "Germany",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Store settings loaded from MongoDB
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryFee: DEFAULT_DELIVERY_FEE,
    freeDeliveryThreshold: DEFAULT_FREE_DELIVERY_THRESHOLD,
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData?.success && resData?.data) {
          setDeliverySettings({
            deliveryFee:
              typeof resData.data.deliveryFee === "number"
                ? resData.data.deliveryFee
                : DEFAULT_DELIVERY_FEE,
            freeDeliveryThreshold:
              typeof resData.data.freeDeliveryThreshold === "number"
                ? resData.data.freeDeliveryThreshold
                : DEFAULT_FREE_DELIVERY_THRESHOLD,
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const deliveryFee =
    deliveryMethod === "pickup"
      ? 0
      : subtotal >= deliverySettings.freeDeliveryThreshold
      ? 0
      : deliverySettings.deliveryFee;
  const total = subtotal + deliveryFee;

  // Redirect to cart only if hydrated, empty, and order has NOT just been placed
  useEffect(() => {
    if (hydrated && items.length === 0 && !orderPlaced) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router, orderPlaced]);

  // Refresh and validate cart items against live database data
  useEffect(() => {
    if (hydrated && items.length > 0 && typeof refreshCartWithServer === "function") {
      refreshCartWithServer();
    }
  }, [hydrated, refreshCartWithServer]);

  // Autofill customer profile details if logged in
  useEffect(() => {
    if (user?.isLoggedIn) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email address";
    }
    if (deliveryMethod === "delivery") {
      if (!form.address.trim()) errors.address = "Delivery address is required";
      if (!form.city.trim()) errors.city = "City is required";
      if (!form.postalCode.trim()) errors.postalCode = "Postal code is required";
    }
    return errors;
  };

  const buildItemsPayload = () =>
    items.map((item) => ({
      productId: item._id || item.id,
      quantity: item.quantity,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: deliveryMethod === "delivery" ? form.address.trim() : "",
        city: deliveryMethod === "delivery" ? form.city.trim() : "",
        postalCode: deliveryMethod === "delivery" ? form.postalCode.trim() : "",
        country: form.country,
      },
      items: buildItemsPayload(),
      deliveryMethod,
      paymentMethod: "manual",
      notes: form.notes ? form.notes.trim() : "",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.message || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setOrderPlaced(true);
      clearCart();
      router.push(
        `/order-confirmation?orderNumber=${encodeURIComponent(
          data.data.orderNumber
        )}&email=${encodeURIComponent(form.email.trim())}`
      );
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  // ─── Checkout Form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col">
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 text-center">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shopping Bag</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight">
              Express Checkout
            </h1>
            <p className="text-sm text-ak-charcoal-muted mt-1">
              Secure payment and fast delivery in Oberhausen &amp; surrounding regions.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 flex-1 w-full">
        {submitError && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── Left column ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Fulfillment Method */}
            <div className="p-6 rounded-3xl bg-white/80 border border-ak-charcoal/10 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-ak-charcoal uppercase tracking-wider">
                Fulfillment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    deliveryMethod === "delivery"
                      ? "border-ak-charcoal bg-ak-icy-blue/40 shadow-sm"
                      : "border-ak-charcoal/10 bg-white"
                  }`}
                >
                  <Truck className="w-5 h-5 text-ak-charcoal mb-2" />
                  <span className="text-xs font-bold text-ak-charcoal block">
                    Local Oberhausen Delivery
                  </span>
                  <span className="text-[11px] text-ak-charcoal-muted block">
                    Dispatched directly to door
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-ak-charcoal bg-ak-icy-blue/40 shadow-sm"
                      : "border-ak-charcoal/10 bg-white"
                  }`}
                >
                  <Store className="w-5 h-5 text-ak-burgundy mb-2" />
                  <span className="text-xs font-bold text-ak-charcoal block">
                    Store Pickup (Free)
                  </span>
                  <span className="text-[11px] text-ak-charcoal-muted block">
                    Buschhausener Str. 63
                  </span>
                </button>
              </div>

              {deliveryMethod === "pickup" && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-ak-icy-blue/30 text-xs text-ak-charcoal-muted">
                  <MapPin className="w-4 h-4 shrink-0 text-ak-burgundy mt-0.5" />
                  <span>
                    AK Kiosk &amp; Asian Market · Buschhausener Str. 63, 46049 Oberhausen ·{" "}
                    Mon–Sat 09:00–22:00, Sun 12:00–20:00
                  </span>
                </div>
              )}
            </div>

            {/* Payment & Confirmation Notice */}
            <div className="p-6 rounded-3xl bg-white/80 border border-ak-charcoal/10 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-ak-burgundy/10 text-ak-burgundy flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-ak-charcoal uppercase tracking-wider">
                    Payment &amp; Order Confirmation
                  </h3>
                  <p className="text-xs text-ak-charcoal-muted">
                    Direct confirmation — no online payment required
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-ak-charcoal/5 space-y-2 text-xs text-ak-charcoal leading-relaxed">
                <p>
                  Our store processes orders via direct confirmation. After placing your order, our store team will review the items and contact you shortly to confirm your order and arrange payment.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-800 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified local order fulfillment in Oberhausen</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 rounded-3xl bg-white/80 border border-ak-charcoal/10 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-ak-charcoal uppercase tracking-wider">
                Contact Information
              </h3>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                  Full Name <span className="text-ak-burgundy">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Alex Schmidt"
                  className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs focus:outline-none focus:ring-1 ${
                    formErrors.fullName
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-ak-charcoal/10 focus:ring-ak-charcoal/30"
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                    Email Address <span className="text-ak-burgundy">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alex@example.de"
                    className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs focus:outline-none focus:ring-1 ${
                      formErrors.email
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-ak-charcoal/10 focus:ring-ak-charcoal/30"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+49 208 1234567"
                    className="w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border border-ak-charcoal/10 text-xs focus:outline-none focus:ring-1 focus:ring-ak-charcoal/30"
                  />
                </div>
              </div>

              {/* Delivery address fields — shown only for delivery */}
              {deliveryMethod === "delivery" && (
                <>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                      Street Address &amp; House Number <span className="text-ak-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="e.g. Elsässer Str. 12"
                      className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs focus:outline-none focus:ring-1 ${
                        formErrors.address
                          ? "border-rose-400 focus:ring-rose-400"
                          : "border-ak-charcoal/10 focus:ring-ak-charcoal/30"
                      }`}
                    />
                    {formErrors.address && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                        Postal Code <span className="text-ak-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        placeholder="46049"
                        className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs focus:outline-none focus:ring-1 ${
                          formErrors.postalCode
                            ? "border-rose-400 focus:ring-rose-400"
                            : "border-ak-charcoal/10 focus:ring-ak-charcoal/30"
                        }`}
                      />
                      {formErrors.postalCode && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.postalCode}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                        City <span className="text-ak-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Oberhausen"
                        className={`w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border text-xs focus:outline-none focus:ring-1 ${
                          formErrors.city
                            ? "border-rose-400 focus:ring-rose-400"
                            : "border-ak-charcoal/10 focus:ring-ak-charcoal/30"
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-[11px] text-rose-600 mt-1">{formErrors.city}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                      Country
                    </label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border border-ak-charcoal/10 text-xs focus:outline-none focus:ring-1 focus:ring-ak-charcoal/30"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] uppercase tracking-wider text-ak-charcoal-light block mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Allergies, special requests, or delivery instructions..."
                  className="w-full px-4 py-2.5 rounded-xl bg-ak-pale-grey/30 border border-ak-charcoal/10 text-xs focus:outline-none focus:ring-1 focus:ring-ak-charcoal/30 resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── Right column: Order Summary ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white/80 border border-ak-charcoal/10 shadow-float space-y-4 sticky top-6">
              <h3 className="font-serif text-base font-bold text-ak-charcoal uppercase tracking-wider pb-3 border-b border-ak-charcoal/10">
                Your Order ({items.length})
              </h3>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => {
                  const itemKey = item._id || item.id;
                  return (
                    <div key={itemKey} className="flex items-center gap-3">
                      {item.image && (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-ak-icy-blue/20 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-ak-charcoal truncate block">{item.name}</span>
                        <span className="text-[11px] text-ak-charcoal-muted">
                          {item.quantity} × {formatPrice(item.price)}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-ak-charcoal shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-ak-charcoal/10 space-y-2 text-xs">
                <div className="flex justify-between text-ak-charcoal-muted">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-ak-charcoal">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-ak-charcoal-muted">
                  <span className="flex items-center gap-1">
                    {deliveryMethod === "pickup" ? (
                      <Store className="w-3.5 h-3.5 text-ak-burgundy" />
                    ) : (
                      <Truck className="w-3.5 h-3.5 text-ak-gold" />
                    )}
                    {deliveryMethod === "pickup" ? "Store Pickup" : "Oberhausen Delivery"}
                  </span>
                  <span className="font-mono text-ak-charcoal">
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryMethod === "delivery" && subtotal < deliverySettings.freeDeliveryThreshold && (
                  <p className="text-[11px] text-amber-600">
                    Add {formatPrice(deliverySettings.freeDeliveryThreshold - subtotal)} more for free delivery
                  </p>
                )}
                <div className="pt-2 border-t border-ak-charcoal/10 flex justify-between text-base font-bold text-ak-charcoal">
                  <span>Total</span>
                  <span className="font-mono text-xl text-ak-burgundy">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 rounded-full bg-ak-burgundy hover:bg-[#60122A] disabled:bg-ak-charcoal/40 text-ak-ivory text-xs uppercase tracking-widest font-semibold shadow-pill hover:shadow-pill-hover transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order…</span>
                  </>
                ) : (
                  <span>Order Now ({formatPrice(total)})</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-ak-charcoal-light pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
