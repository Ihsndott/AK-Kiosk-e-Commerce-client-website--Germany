"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, PackageOpen, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";

export default function GroceriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadGroceries() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/products?category=groceries");
        const json = await res.json();
        if (isMounted) {
          if (res.ok && json.success && Array.isArray(json.data)) {
            setProducts(json.data);
          } else {
            setError(json.message || "Failed to load Asian groceries.");
          }
        }
      } catch {
        if (isMounted) {
          setError("Network error. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGroceries();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col justify-between">
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
              Pantry &amp; Kitchen Staples
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight">
              Asian Groceries &amp; Noodles
            </h1>
            <p className="text-sm text-ak-charcoal-muted mt-2 max-w-xl mx-auto">
              Authentic Korean ramen, Japanese sauces, Chinese chili crisps, curry blocks, and specialty cooking pastes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 flex-1 w-full">
        {loading && (
          <div className="py-20 text-center text-ak-charcoal-muted">
            <Loader2 className="w-8 h-8 text-ak-burgundy animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-wider font-semibold">
              Loading groceries...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16 rounded-3xl bg-white/70 border border-ak-charcoal/10 p-8 max-w-lg mx-auto">
            <PackageOpen className="w-12 h-12 text-ak-charcoal-light mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-ak-charcoal">
              No grocery products listed yet
            </h3>
            <p className="text-xs text-ak-charcoal-muted mt-1 mb-5">
              Items added in the administrator catalog under Asian Groceries will appear here.
            </p>
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs font-semibold uppercase tracking-wider hover:bg-ak-burgundy transition-all"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
