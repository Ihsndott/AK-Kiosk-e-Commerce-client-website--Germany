"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { ArrowLeft, AlertCircle, PackageOpen, RotateCw } from "lucide-react";

const CATEGORY_TABS = [
  { id: "all", label: "All Items" },
  { id: "groceries", label: "Asian Groceries" },
  { id: "snacks", label: "Snacks & Sweets" },
  { id: "drinks", label: "Drinks & Teas" },
];

function ProductSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-3xl bg-white/60 border border-ak-charcoal/10 p-4 animate-pulse">
      <div className="aspect-square w-full rounded-2xl bg-ak-icy-blue/60" />
      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3 w-24 bg-ak-charcoal/10 rounded-full mb-3" />
          <div className="h-4 w-3/4 bg-ak-charcoal/10 rounded-full mb-2" />
          <div className="h-3 w-1/2 bg-ak-charcoal/10 rounded-full mb-4" />
        </div>
        <div className="pt-4 mt-3 border-t border-ak-charcoal/10 flex items-center justify-between">
          <div className="h-5 w-16 bg-ak-charcoal/10 rounded-full" />
          <div className="h-8 w-20 bg-ak-charcoal/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const url =
          selectedCategory === "all"
            ? "/api/products"
            : `/api/products?category=${encodeURIComponent(selectedCategory)}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to load products (HTTP ${res.status})`);
        }

        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setProducts(json.data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error("[ShopPage] Error fetching products:", err);
        if (isMounted) {
          setError(
            "Unable to load products at the moment. Please check your connection and try again."
          );
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, retryCount]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col">
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
              Full Market Catalog
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight">
              Shop Authentic Asian Goods
            </h1>
            <p className="text-sm text-ak-charcoal-muted mt-2 max-w-xl mx-auto">
              Imported instant noodles, crispy snacks, refreshing drinks, and pantry essentials from Japan, Korea, China, and Taiwan.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 flex-1 w-full">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-ak-charcoal/10">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  selectedCategory === tab.id
                    ? "bg-ak-charcoal text-ak-ivory shadow-sm"
                    : "bg-white/70 hover:bg-white text-ak-charcoal border border-ak-charcoal/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-ak-charcoal-light uppercase tracking-wider font-semibold">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/80 border border-ak-charcoal/10 text-xs rounded-full px-3 py-1.5 text-ak-charcoal focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Content area: Loading / Error / Empty / Success */}
        <div className="py-8">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center max-w-md mx-auto rounded-3xl bg-white/60 border border-ak-charcoal/10 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-ak-burgundy/10 text-ak-burgundy mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ak-charcoal mb-2">
                Unable to Load Products
              </h3>
              <p className="text-sm text-ak-charcoal-muted mb-6">
                {error}
              </p>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory transition-all shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {!loading && !error && sortedProducts.length === 0 && (
            <div className="py-16 text-center max-w-md mx-auto rounded-3xl bg-white/60 border border-ak-charcoal/10 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-ak-icy-blue text-ak-charcoal mx-auto flex items-center justify-center mb-4">
                <PackageOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ak-charcoal mb-2">
                No products available yet.
              </h3>
              <p className="text-sm text-ak-charcoal-muted mb-6">
                {selectedCategory === "all"
                  ? "Our store catalog is currently empty. Please check back later."
                  : "No products currently found in this category."}
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory transition-all shadow-sm"
                >
                  View All Products
                </button>
              )}
            </div>
          )}

          {!loading && !error && sortedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
