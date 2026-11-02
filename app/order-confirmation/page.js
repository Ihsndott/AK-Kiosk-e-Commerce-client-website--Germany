"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Package,
  Truck,
  Store,
  Clock,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";

function OrderStatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    delivered: "bg-blue-100 text-blue-800",
    canceled: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
        Payment: Pending
      </span>
    );
  }
  const styles = {
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-rose-100 text-rose-800",
    refunded: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      Payment: {status}
    </span>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");
  const orderId = searchParams.get("orderId") || searchParams.get("id");
  const orderNumber = searchParams.get("orderNumber");
  const email = searchParams.get("email");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId && (!orderNumber && !orderId || !email)) {
      setError("Missing order details. Please check your confirmation email or order link.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        let query = "";
        if (sessionId) {
          query = `sessionId=${encodeURIComponent(sessionId)}`;
        } else {
          const parts = [`email=${encodeURIComponent(email)}`];
          if (orderNumber) parts.push(`orderNumber=${encodeURIComponent(orderNumber)}`);
          if (orderId) parts.push(`orderId=${encodeURIComponent(orderId)}`);
          query = parts.join("&");
        }

        const res = await fetch(`/api/orders?${query}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Order not found. Please contact us if you believe this is an error.");
        } else {
          setOrder(data.data);
        }
      } catch {
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId, orderNumber, orderId, email]);

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col">
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 text-center">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight">
              {loading ? "Loading Order…" : error ? "Order Lookup" : "Order Confirmation"}
            </h1>
            {!loading && !error && order && (
              <p className="text-sm text-ak-charcoal-muted mt-1">
                {order.paymentMethod === "stripe" && order.paymentStatus === "paid"
                  ? "Your payment has been verified and your order is confirmed."
                  : "Thank you for your order! Our store team will contact you shortly to confirm your order and arrange payment."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-12 flex-1 w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-ak-charcoal-muted">
            <Loader2 className="w-10 h-10 animate-spin text-ak-charcoal" />
            <p className="text-sm">Loading your order details…</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 bg-white/80 rounded-3xl border border-ak-charcoal/10 p-8 shadow-float">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-xl font-bold text-ak-charcoal mb-2">
              Order Not Found
            </h2>
            <p className="text-sm text-ak-charcoal-muted mb-6 max-w-sm mx-auto">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-widest font-semibold hover:bg-ak-burgundy transition-all"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="text-center bg-white/80 rounded-3xl border border-ak-charcoal/10 p-8 shadow-float">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-ak-burgundy block mb-2">
                Order #{order.orderNumber}
              </span>
              <h2 className="font-serif text-2xl font-bold text-ak-charcoal mb-1">
                {order.paymentMethod === "stripe" && order.paymentStatus === "paid"
                  ? "Payment Confirmed — Thank You!"
                  : "Order Successfully Placed!"}
              </h2>
              {order.customer?.fullName && (
                <p className="text-xs font-semibold text-ak-charcoal mb-3">
                  Customer: <span className="font-normal text-ak-charcoal-muted">{order.customer.fullName}</span>
                </p>
              )}
              <div className="my-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 max-w-lg mx-auto text-xs text-amber-950 leading-relaxed font-medium">
                {order.paymentMethod === "stripe" && order.paymentStatus === "paid" ? (
                  <span>Your card payment was processed securely via Stripe.</span>
                ) : (
                  <span>
                    Thank you for your order! Our store team will contact you shortly to confirm your order and arrange payment.
                  </span>
                )}
              </div>
              <p className="text-xs text-ak-charcoal-muted mb-4">
                A confirmation email has been dispatched to <strong>{order.customer?.email}</strong>
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <OrderStatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white/80 rounded-3xl border border-ak-charcoal/10 p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-ak-charcoal uppercase tracking-wider mb-4 flex items-center gap-2">
                {order.deliveryMethod === "pickup" ? (
                  <Store className="w-4 h-4 text-ak-burgundy" />
                ) : (
                  <Truck className="w-4 h-4 text-ak-gold" />
                )}
                {order.deliveryMethod === "pickup" ? "Store Pickup" : "Home Delivery"}
              </h3>
              {order.deliveryMethod === "pickup" ? (
                <p className="text-sm text-ak-charcoal-muted">
                  AK Kiosk &amp; Asian Market<br />
                  Buschhausener Str. 63, 46049 Oberhausen, Germany<br />
                  <span className="font-semibold text-ak-charcoal">Hours:</span> Mon–Sat 09:00–22:00 · Sun 12:00–20:00
                </p>
              ) : (
                <p className="text-sm text-ak-charcoal-muted">
                  Your order will be delivered to your address. We&apos;ll contact you for delivery coordination.
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white/80 rounded-3xl border border-ak-charcoal/10 p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-ak-charcoal uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-ak-charcoal" />
                Order Items ({order.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 py-3 border-b border-ak-charcoal/10 last:border-0"
                  >
                    {item.image && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-ak-icy-blue/20 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ak-charcoal truncate">{item.name}</p>
                      {item.category && (
                        <p className="text-[11px] text-ak-charcoal-muted uppercase tracking-wider">
                          {item.category}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-ak-charcoal-muted">
                        {item.quantity} × {formatPrice(item.priceAtOrder)}
                      </p>
                      <p className="text-sm font-bold font-mono text-ak-charcoal">
                        {formatPrice(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-ak-charcoal/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-ak-charcoal-muted">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-ak-charcoal">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-ak-charcoal-muted">
                  <span>Delivery Fee</span>
                  <span className="font-mono text-ak-charcoal">
                    {order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-ak-charcoal pt-2 border-t border-ak-charcoal/10">
                  <span>Total</span>
                  <span className="font-mono text-xl text-ak-burgundy">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white/80 rounded-3xl border border-ak-charcoal/10 p-6 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-ak-icy-blue/30 flex items-center justify-center text-ak-charcoal shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-ak-charcoal uppercase tracking-wider">
                  Payment Method
                </p>
                <p className="text-sm text-ak-charcoal-muted mt-0.5">
                  {order.paymentMethod === "stripe"
                    ? "Paid online via Stripe (card payment)"
                    : order.paymentMethod === "cod"
                    ? "Cash on Delivery — payment due on receipt"
                    : "Manual Payment — our store team will contact you to arrange payment"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-widest font-semibold hover:bg-ak-burgundy transition-all"
              >
                <Home className="w-4 h-4" />
                Return to Homepage
              </Link>
              <Link
                href="/shop"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-ak-charcoal/20 text-ak-charcoal text-xs uppercase tracking-widest font-semibold hover:border-ak-burgundy hover:text-ak-burgundy transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ak-pale-grey">
          <Loader2 className="w-8 h-8 animate-spin text-ak-charcoal" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

