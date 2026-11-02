"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Clock,
  TrendingUp,
  ArrowRight,
  Database,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setStats(json.data);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-ak-charcoal via-[#23272A] to-ak-charcoal text-ak-ivory p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-ak-gold text-[10px] tracking-widest uppercase font-bold mb-3 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-ak-gold animate-pulse" />
            <span>Store Operations Hub</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Welcome to AK Kiosk Admin
          </h1>
          <p className="text-xs sm:text-sm text-ak-pale-grey/80 mt-2 leading-relaxed">
            Monitor real-time grocery inventory, track incoming customer orders, manage inquiries, and inspect store performance metrics across Oberhausen and surrounding delivery regions.
          </p>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-ak-burgundy/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ak-charcoal uppercase tracking-wider">
            Store Metrics Overview
          </h2>
          <p className="text-xs text-ak-charcoal-muted">
            Live metrics aggregated from your MongoDB Atlas database
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-ak-charcoal/10 text-xs font-medium text-ak-charcoal hover:text-ak-burgundy hover:border-ak-charcoal/20 transition-all shadow-xs"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-ak-gold" : ""}`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-white border border-ak-charcoal/10 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-ak-charcoal-light mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-ak-icy-blue/60 flex items-center justify-center text-ak-charcoal">
              <Package className="w-4 h-4 text-ak-burgundy" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-ak-charcoal">
              {loading ? "..." : stats.totalProducts}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              Live in Atlas
            </span>
          </div>
          <p className="text-[11px] text-ak-charcoal-muted mt-2">
            Active grocery and convenience items in catalog
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-ak-charcoal/10 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-ak-charcoal-light mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-ak-icy-blue/60 flex items-center justify-center text-ak-charcoal">
              <ShoppingCart className="w-4 h-4 text-ak-charcoal" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-ak-charcoal">
              {loading ? "..." : stats.totalOrders}
            </span>
            <span className="text-[11px] text-ak-charcoal-light">
              orders
            </span>
          </div>
          <p className="text-[11px] text-ak-charcoal-muted mt-2">
            Checkout integration scheduled for next stage
          </p>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-white border border-ak-charcoal/10 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-ak-charcoal-light mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-ak-icy-blue/60 flex items-center justify-center text-ak-charcoal">
              <Clock className="w-4 h-4 text-ak-gold" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-ak-charcoal">
              {loading ? "..." : stats.pendingOrders}
            </span>
            <span className="text-[11px] text-ak-charcoal-light">
              awaiting dispatch
            </span>
          </div>
          <p className="text-[11px] text-ak-charcoal-muted mt-2">
            Oberhausen local dispatch queue clear
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-ak-charcoal/10 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-ak-charcoal-light mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-ak-icy-blue/60 flex items-center justify-center text-ak-charcoal">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-ak-charcoal">
              {loading ? "..." : formatPrice(stats.totalRevenue)}
            </span>
            <span className="text-[11px] text-ak-charcoal-light">
              EUR
            </span>
          </div>
          <p className="text-[11px] text-ak-charcoal-muted mt-2">
            Processed transaction volume to date
          </p>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Link
          href="/admin/products"
          className="group p-5 rounded-2xl bg-white border border-ak-charcoal/10 hover:border-ak-burgundy/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-ak-burgundy/10 text-ak-burgundy flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ak-charcoal group-hover:text-ak-burgundy transition-colors">
                Product Catalog
              </h3>
              <p className="text-xs text-ak-charcoal-muted">
                Inspect and manage items in database
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ak-charcoal-light group-hover:text-ak-burgundy group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/orders"
          className="group p-5 rounded-2xl bg-white border border-ak-charcoal/10 hover:border-ak-burgundy/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-ak-gold/15 text-[#9a7631] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ak-charcoal group-hover:text-ak-burgundy transition-colors">
                Orders & Fulfillment
              </h3>
              <p className="text-xs text-ak-charcoal-muted">
                Track customer checkout orders
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ak-charcoal-light group-hover:text-ak-burgundy group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-2xl bg-white border border-ak-charcoal/10 hover:border-ak-burgundy/40 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-ak-charcoal/10 text-ak-charcoal flex items-center justify-center group-hover:scale-105 transition-transform">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ak-charcoal group-hover:text-ak-burgundy transition-colors">
                Preview Live Store
              </h3>
              <p className="text-xs text-ak-charcoal-muted">
                Open customer storefront in new tab
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ak-charcoal-light group-hover:text-ak-burgundy group-hover:translate-x-1 transition-all" />
        </Link>

      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl bg-white border border-ak-charcoal/10 shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-ak-charcoal/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-ak-charcoal">
              Recent Orders
            </h3>
            <p className="text-xs text-ak-charcoal-muted mt-0.5">
              Live customer transactions and local Oberhausen deliveries
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-ak-burgundy hover:underline tracking-wider uppercase"
          >
            View All
          </Link>
        </div>

        {/* Empty state for orders */}
        <div className="py-12 text-center max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-full bg-ak-icy-blue/60 text-ak-charcoal mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6 text-ak-charcoal-light" />
          </div>
          <h4 className="font-serif text-base font-bold text-ak-charcoal mb-1.5">
            No orders received yet
          </h4>
          <p className="text-xs text-ak-charcoal-muted leading-relaxed">
            Customer orders placed through the website will appear here with live tracking, customer details, and fulfillment actions.
          </p>
        </div>
      </div>

      {/* System Status Footer Card */}
      <div className="p-4 rounded-2xl bg-white/70 border border-ak-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ak-charcoal-light">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>
            Database: <strong className="text-ak-charcoal font-mono">akkiosk</strong> (MongoDB Atlas)
          </span>
          <span className="text-white/40">•</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        </div>

        <div className="text-[11px] text-ak-charcoal-muted">
          AK Kiosk Admin Core v1.0 • Buschhausener Str. 63
        </div>
      </div>

    </div>
  );
}

