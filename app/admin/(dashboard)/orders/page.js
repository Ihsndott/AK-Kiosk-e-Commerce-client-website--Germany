"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Banknote,
  Truck,
  Store,
  User,
  Package,
  Phone,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// ─── Badge helpers ───────────────────────────────────────────────────────────

function OrderStatusBadge({ status }) {
  const config = {
    pending: { cls: "bg-amber-100 text-amber-800", label: "Pending", Icon: Clock },
    confirmed: { cls: "bg-emerald-100 text-emerald-800", label: "Confirmed", Icon: CheckCircle2 },
    delivered: { cls: "bg-blue-100 text-blue-800", label: "Delivered", Icon: CheckCircle2 },
    canceled: { cls: "bg-rose-100 text-rose-800", label: "Canceled", Icon: XCircle },
  };
  const { cls, label, Icon } = config[status] || {
    cls: "bg-gray-100 text-gray-600",
    label: status,
    Icon: Clock,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  const config = {
    pending: { cls: "bg-amber-100 text-amber-800", label: "Pending" },
    paid: { cls: "bg-emerald-100 text-emerald-800", label: "Paid" },
    failed: { cls: "bg-rose-100 text-rose-800", label: "Failed" },
    refunded: { cls: "bg-purple-100 text-purple-800", label: "Refunded" },
  };
  const { cls, label } = config[status] || { cls: "bg-gray-100 text-gray-600", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function DeliveryMethodBadge({ method }) {
  if (method === "delivery") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
        <Truck className="w-3 h-3 text-ak-gold" /> Home Delivery
      </span>
    );
  }
  if (method === "pickup") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
        <Store className="w-3 h-3 text-ak-burgundy" /> Store Pickup
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-500 bg-gray-100">
      Not specified
    </span>
  );
}

function PaymentMethodBadge({ method }) {
  if (method === "stripe") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800">
        <CreditCard className="w-3 h-3" /> Stripe
      </span>
    );
  }
  if (method === "cod") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-ak-gold/20 text-[#8a6820]">
        <Banknote className="w-3 h-3" /> COD
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
      <Phone className="w-3 h-3 text-amber-700" /> Manual / Order Now
    </span>
  );
}

// ─── Order Row / Detail Expansion ────────────────────────────────────────────

function OrderRow({ order, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.orderStatus);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(order.paymentStatus || "pending");

  const handleStatusChange = async (newStatus) => {
    if (newStatus === localStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalStatus(newStatus);
        if (typeof onStatusUpdate === "function") {
          onStatusUpdate(order._id, newStatus, null);
        }
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (newPaymentStatus === localPaymentStatus) return;
    setUpdatingPaymentStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalPaymentStatus(newPaymentStatus);
        if (typeof onStatusUpdate === "function") {
          onStatusUpdate(order._id, null, newPaymentStatus);
        }
      }
    } catch (err) {
      console.error("Payment status update failed:", err);
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <>
      <tr
        className="border-b border-ak-charcoal/8 hover:bg-ak-pale-grey/30 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <span className="font-mono text-xs font-bold text-ak-burgundy">{order.orderNumber}</span>
          <p className="text-[10px] text-ak-charcoal-muted mt-0.5">{orderDate}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs font-semibold text-ak-charcoal">{order.customer?.fullName}</p>
          <p className="text-[10px] text-ak-charcoal-muted truncate max-w-[160px]">
            {order.customer?.email}
          </p>
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <PaymentMethodBadge method={order.paymentMethod} />
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <DeliveryMethodBadge method={order.deliveryMethod} />
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <PaymentStatusBadge status={localPaymentStatus} />
        </td>
        <td className="px-4 py-3">
          <OrderStatusBadge status={localStatus} />
        </td>
        <td className="px-4 py-3 text-right">
          <span className="font-mono text-sm font-bold text-ak-charcoal">
            {formatPrice(order.total)}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-ak-charcoal-muted mx-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ak-charcoal-muted mx-auto" />
          )}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-ak-pale-grey/20 border-b border-ak-charcoal/8">
          <td colSpan={8} className="px-4 pb-5 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Customer + Delivery */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted flex items-center gap-1">
                  <User className="w-3 h-3" /> Customer &amp; Delivery
                </h4>
                <div className="text-xs text-ak-charcoal space-y-1">
                  <p><strong>{order.customer?.fullName}</strong></p>
                  <p className="text-ak-charcoal-muted">{order.customer?.email}</p>
                  {order.customer?.phone && (
                    <p className="text-ak-charcoal-muted">Phone: {order.customer.phone}</p>
                  )}
                  <p className="pt-1">
                    <span className="font-semibold text-ak-charcoal">Delivery Method: </span>
                    {order.deliveryMethod === "delivery" ? (
                      <span className="text-amber-800 font-medium">Home Delivery</span>
                    ) : order.deliveryMethod === "pickup" ? (
                      <span className="text-rose-800 font-medium">Store Pickup</span>
                    ) : (
                      <span className="text-gray-500 font-medium">Not specified</span>
                    )}
                  </p>
                  {order.deliveryMethod === "delivery" ? (
                    <div className="flex items-start gap-1 pt-1">
                      <Truck className="w-3.5 h-3.5 text-ak-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="text-ak-charcoal">{order.customer?.address || "Address not specified"}</p>
                        <p className="text-ak-charcoal-muted">
                          {order.customer?.postalCode} {order.customer?.city},{" "}
                          {order.customer?.country || "Germany"}
                        </p>
                      </div>
                    </div>
                  ) : order.deliveryMethod === "pickup" ? (
                    <div className="flex items-center gap-1 pt-1">
                      <Store className="w-3.5 h-3.5 text-ak-burgundy" />
                      <span className="text-ak-charcoal-muted">Store Pickup – Buschhausener Str. 63</span>
                    </div>
                  ) : null}
                </div>

                {/* Status update controls */}
                <div className="pt-2 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted mb-1.5">
                      Order Status
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {["pending", "confirmed", "delivered", "canceled"].map((s) => (
                        <button
                          key={s}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(s);
                          }}
                          disabled={updatingStatus || s === localStatus}
                          className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${
                            s === localStatus
                              ? "bg-ak-charcoal text-ak-ivory cursor-default shadow-xs"
                              : "bg-white border border-ak-charcoal/15 text-ak-charcoal hover:border-ak-charcoal hover:bg-ak-pale-grey/30"
                          } disabled:opacity-50`}
                        >
                          {updatingStatus && s !== localStatus ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : (
                            s.charAt(0).toUpperCase() + s.slice(1)
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted mb-1.5">
                      Payment Status (Manual Reconciliation)
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { id: "pending", label: "Pending" },
                        { id: "paid", label: "Paid (Received)" },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentStatusChange(id);
                          }}
                          disabled={updatingPaymentStatus || id === localPaymentStatus}
                          className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all ${
                            id === localPaymentStatus
                              ? id === "paid"
                                ? "bg-emerald-700 text-white cursor-default shadow-xs"
                                : "bg-amber-700 text-white cursor-default shadow-xs"
                              : "bg-white border border-ak-charcoal/15 text-ak-charcoal hover:border-ak-charcoal hover:bg-ak-pale-grey/30"
                          } disabled:opacity-50`}
                        >
                          {updatingPaymentStatus && id !== localPaymentStatus ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : (
                            label
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted flex items-center gap-1">
                  <Package className="w-3 h-3" /> Order Items
                </h4>
                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-ak-charcoal/8 last:border-0">
                      <div className="flex-1">
                        <span className="text-ak-charcoal">{item.name}</span>
                        {item.sku && (
                          <span className="text-ak-charcoal-muted ml-1">({item.sku})</span>
                        )}
                        <span className="text-ak-charcoal-muted ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-semibold text-ak-charcoal ml-4">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-ak-charcoal-muted">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-ak-charcoal-muted">
                    <span>Delivery Fee</span>
                    <span className="font-mono">
                      {order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-ak-charcoal border-t border-ak-charcoal/10 pt-1">
                    <span>Total</span>
                    <span className="font-mono text-ak-burgundy">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [page, setPage] = useState(1);

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, canceled: 0 });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (filterOrderStatus) params.set("orderStatus", filterOrderStatus);
      if (filterPaymentStatus) params.set("paymentStatus", filterPaymentStatus);
      if (filterPaymentMethod) params.set("paymentMethod", filterPaymentMethod);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load orders");
        return;
      }
      setOrders(data.data);
      setPagination(data.pagination);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterOrderStatus, filterPaymentStatus, filterPaymentMethod]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Recompute stats from current fetched set (approximate)
  useEffect(() => {
    setStats({
      total: pagination.total,
      pending: orders.filter((o) => o.orderStatus === "pending").length,
      confirmed: orders.filter((o) => o.orderStatus === "confirmed").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      canceled: orders.filter((o) => o.orderStatus === "canceled").length,
    });
  }, [orders, pagination.total]);

  const handleStatusUpdate = (orderId, newOrderStatus, newPaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o._id !== orderId) return o;
        const updated = { ...o };
        if (newOrderStatus) updated.orderStatus = newOrderStatus;
        if (newPaymentStatus) updated.paymentStatus = newPaymentStatus;
        return updated;
      })
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const clearFilters = () => {
    setSearch("");
    setFilterOrderStatus("");
    setFilterPaymentStatus("");
    setFilterPaymentMethod("");
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
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
            Customer Orders &amp; Fulfillment
          </h1>
          <p className="text-xs text-ak-charcoal-muted mt-0.5">
            View, filter, and manage all incoming orders in real time
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ak-burgundy transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Orders", value: pagination.total, color: "text-ak-charcoal" },
          { label: "Pending", value: orders.filter(o => o.orderStatus === "pending").length, color: "text-amber-700" },
          { label: "Confirmed", value: orders.filter(o => o.orderStatus === "confirmed").length, color: "text-emerald-700" },
          { label: "Delivered", value: orders.filter(o => o.orderStatus === "delivered").length, color: "text-blue-700" },
          { label: "Canceled", value: orders.filter(o => o.orderStatus === "canceled").length, color: "text-rose-700" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-ak-charcoal/10 p-5 shadow-xs"
          >
            <p className="text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted mb-1">
              {label}
            </p>
            <p className={`font-serif text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-ak-charcoal/10 p-4 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ak-charcoal/15 bg-ak-pale-grey/30">
            <Search className="w-4 h-4 text-ak-charcoal-muted shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order # or customer…"
              className="w-full text-xs bg-transparent focus:outline-none text-ak-charcoal placeholder-ak-charcoal/40"
            />
          </div>

          <select
            value={filterOrderStatus}
            onChange={(e) => { setFilterOrderStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-ak-charcoal/15 bg-ak-pale-grey/30 text-xs text-ak-charcoal focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="canceled">Canceled</option>
          </select>

          <select
            value={filterPaymentStatus}
            onChange={(e) => { setFilterPaymentStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-ak-charcoal/15 bg-ak-pale-grey/30 text-xs text-ak-charcoal focus:outline-none"
          >
            <option value="">All Payments</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={filterPaymentMethod}
            onChange={(e) => { setFilterPaymentMethod(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-ak-charcoal/15 bg-ak-pale-grey/30 text-xs text-ak-charcoal focus:outline-none"
          >
            <option value="">All Methods</option>
            <option value="manual">Manual / Order Now</option>
            <option value="cod">Cash on Delivery</option>
            <option value="stripe">Stripe</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ak-burgundy transition-all flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl border border-ak-charcoal/15 text-ak-charcoal text-xs uppercase tracking-wider font-semibold hover:border-ak-burgundy hover:text-ak-burgundy transition-all"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-ak-charcoal/10 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-ak-charcoal-muted">
            <Loader2 className="w-8 h-8 animate-spin text-ak-charcoal" />
            <p className="text-xs">Loading orders…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-sm text-ak-charcoal font-semibold">{error}</p>
            <button
              onClick={fetchOrders}
              className="text-xs text-ak-burgundy hover:underline"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingCart className="w-10 h-10 text-ak-charcoal/20" />
            <p className="text-sm font-semibold text-ak-charcoal">No orders found</p>
            <p className="text-xs text-ak-charcoal-muted">
              {search || filterOrderStatus || filterPaymentStatus || filterPaymentMethod
                ? "Try adjusting your filters."
                : "Orders will appear here once customers place them."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ak-charcoal/10 bg-ak-pale-grey/20">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted hidden sm:table-cell">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted hidden lg:table-cell">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted hidden md:table-cell">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-ak-charcoal-muted">
                    Total
                  </th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-ak-charcoal-muted">
            Page {pagination.page} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.total} total orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-ak-charcoal/15 text-ak-charcoal hover:border-ak-charcoal disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-ak-charcoal/15 text-ak-charcoal hover:border-ak-charcoal disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
