"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  Package,
  Clock,
  Truck,
  CreditCard,
  LogOut,
  ShoppingBag,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";

const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery (Barzahlung)",
  stripe: "Credit Card (Stripe)",
};

const ORDER_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  canceled: "bg-rose-100 text-rose-800 border-rose-200",
};

const PAYMENT_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
  refunded: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redirect to login if user is not authenticated once auth check resolves
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/login?from=/account");
    }
  }, [authLoading, isLoggedIn, router]);

  // Fetch orders for authenticated customer
  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;
    async function fetchOrders() {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const res = await fetch("/api/account/orders");
        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.success) {
            setOrders(data.data || []);
          } else {
            setOrdersError(data.message || "Failed to load order history.");
          }
        }
      } catch {
        if (isMounted) {
          setOrdersError("Network error. Could not retrieve order history.");
        }
      } finally {
        if (isMounted) {
          setOrdersLoading(false);
        }
      }
    }

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleOrderDetails = (orderNumber) => {
    setExpandedOrder((prev) => (prev === orderNumber ? null : orderNumber));
  };

  // While checking initial session, display centered branded loader
  if (authLoading || (!isLoggedIn && !ordersError)) {
    return (
      <div className="min-h-screen bg-ak-pale-grey flex flex-col justify-between">
        <div className="p-3 sm:p-5 md:p-8">
          <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
            <Navbar variant="hero-integrated" />
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-ak-burgundy animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-ak-charcoal-light font-semibold">
                Loading Account...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col justify-between">
      {/* Hero Header Frame */}
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/90 border border-ak-charcoal/10 flex items-center justify-center text-ak-charcoal shadow-sm shrink-0">
                  <User className="w-8 h-8 text-ak-burgundy" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-ak-burgundy">
                      Store Account
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Verified Customer
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ak-charcoal mt-0.5">
                    Welcome back, {user?.name || "Valued Shopper"}
                  </h1>
                  <p className="text-xs text-ak-charcoal-muted flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user?.email}</span>
                  </p>
                </div>
              </div>

              {/* Account Quick Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href="/shop"
                  className="px-5 py-2.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs font-semibold tracking-wider uppercase hover:bg-ak-burgundy transition-all shadow-sm"
                >
                  Browse Shop
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2.5 rounded-full border border-ak-charcoal/20 bg-white/60 text-xs font-semibold text-ak-charcoal hover:border-ak-burgundy hover:text-ak-burgundy hover:bg-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Account Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 w-full -mt-2 mb-16 flex-1 space-y-8">
        
        {/* Account Details Card */}
        <div className="rounded-3xl bg-white/90 border border-ak-ivory-border p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-ak-charcoal mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-ak-gold" />
            <span>Customer Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-ak-pale-grey/30 border border-ak-charcoal/10">
              <span className="text-[10px] uppercase tracking-wider text-ak-charcoal-muted block font-semibold mb-1">
                Full Name
              </span>
              <p className="font-medium text-ak-charcoal text-sm">{user?.name || "—"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-ak-pale-grey/30 border border-ak-charcoal/10">
              <span className="text-[10px] uppercase tracking-wider text-ak-charcoal-muted block font-semibold mb-1">
                Email Address
              </span>
              <p className="font-medium text-ak-charcoal text-sm truncate">{user?.email || "—"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-ak-pale-grey/30 border border-ak-charcoal/10">
              <span className="text-[10px] uppercase tracking-wider text-ak-charcoal-muted block font-semibold mb-1">
                Preferred Store
              </span>
              <p className="font-medium text-ak-charcoal text-sm">Oberhausen, Germany</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="rounded-3xl bg-white/90 border border-ak-ivory-border p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-ak-charcoal flex items-center gap-2">
                <Package className="w-5 h-5 text-ak-burgundy" />
                <span>Your Order History</span>
              </h2>
              <p className="text-xs text-ak-charcoal-muted mt-0.5">
                Review past and active orders placed under your account.
              </p>
            </div>

            <span className="text-xs text-ak-charcoal-light font-semibold self-start sm:self-auto">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {/* Orders Loading */}
          {ordersLoading && (
            <div className="py-16 text-center text-ak-charcoal-muted">
              <Loader2 className="w-7 h-7 text-ak-burgundy animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-wider font-semibold">
                Retrieving your order history...
              </p>
            </div>
          )}

          {/* Orders Error */}
          {!ordersLoading && ordersError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{ordersError}</span>
            </div>
          )}

          {/* Orders Empty State */}
          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="py-14 text-center rounded-2xl bg-ak-pale-grey/20 border border-dashed border-ak-charcoal/15 p-8">
              <div className="w-14 h-14 rounded-full bg-ak-icy-blue/80 flex items-center justify-center mx-auto mb-3 text-ak-charcoal">
                <ShoppingBag className="w-6 h-6 text-ak-burgundy" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ak-charcoal mb-1">
                No orders yet
              </h3>
              <p className="text-xs text-ak-charcoal-muted max-w-sm mx-auto mb-5 leading-relaxed">
                You haven&apos;t placed any orders with this account yet. Discover our fresh Korean noodles, Japanese snacks, and authentic Asian pantry essentials.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs font-semibold tracking-wider uppercase hover:bg-ak-burgundy transition-all"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Orders List */}
          {!ordersLoading && !ordersError && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.orderNumber;
                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <div
                    key={order.orderNumber}
                    className="rounded-2xl border border-ak-charcoal/10 overflow-hidden bg-white hover:border-ak-charcoal/20 transition-all shadow-xs"
                  >
                    {/* Order Summary Row */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ak-pale-grey/15">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-ak-charcoal">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              ORDER_STATUS_STYLES[order.orderStatus] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            Order: {order.orderStatus}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              PAYMENT_STATUS_STYLES[order.paymentStatus] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-ak-charcoal-muted flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-ak-charcoal-light" />
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span className="capitalize">{order.deliveryMethod}</span>
                          <span>•</span>
                          <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-ak-charcoal/10">
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-ak-charcoal-muted block">
                            Total
                          </span>
                          <span className="font-serif text-base font-bold text-ak-burgundy">
                            {formatPrice(order.total)}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleOrderDetails(order.orderNumber)}
                          className="px-3.5 py-1.5 rounded-full border border-ak-charcoal/20 text-xs font-semibold text-ak-charcoal hover:bg-ak-pale-grey/40 transition-colors flex items-center gap-1"
                        >
                          <span>{isExpanded ? "Hide Details" : "View Items"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Order Items Drawer */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-ak-charcoal/10 bg-white space-y-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-light block">
                          Ordered Items ({order.items?.length || 0})
                        </span>

                        <div className="divide-y divide-ak-charcoal/5">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-2.5 flex items-center justify-between text-xs"
                            >
                              <div className="flex-1 pr-4">
                                <p className="font-semibold text-ak-charcoal">
                                  {item.name}
                                </p>
                                <p className="text-[11px] text-ak-charcoal-muted">
                                  Qty: {item.quantity} × {formatPrice(item.priceAtOrder)}
                                </p>
                              </div>
                              <span className="font-semibold text-ak-charcoal">
                                {formatPrice(item.lineTotal || item.priceAtOrder * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-ak-charcoal/10 flex justify-between text-xs text-ak-charcoal-muted">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.deliveryFee > 0 && (
                          <div className="flex justify-between text-xs text-ak-charcoal-muted">
                            <span>Delivery Fee</span>
                            <span>{formatPrice(order.deliveryFee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold text-ak-charcoal pt-1 border-t border-ak-charcoal/10">
                          <span>Final Total</span>
                          <span className="text-ak-burgundy">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

