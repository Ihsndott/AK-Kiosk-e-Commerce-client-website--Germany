"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { PRODUCTS } from "@/lib/products";

export default function Bestsellers() {
  const [bestsellers, setBestsellers] = useState(PRODUCTS.slice(0, 4));

  useEffect(() => {
    let isMounted = true;
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            // Prioritize customer favorites (e.g. Samyang Buldak) in Bestsellers
            const sortedBestsellers = [...json.data].sort((a, b) => {
              const isA = a.slug?.includes("samyang") || a.badge === "Bestseller";
              const isB = b.slug?.includes("samyang") || b.badge === "Bestseller";
              if (isA && !isB) return -1;
              if (!isA && isB) return 1;
              return 0;
            });
            setBestsellers(sortedBestsellers.slice(0, 4));
          }
        }
      } catch {
        // Keep fallback
      }
    }
    loadLiveProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="pb-8 sm:py-12 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy mb-2">
            <Flame className="w-4 h-4 fill-ak-gold text-ak-gold" />
            <span>Customer Favorites</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ak-charcoal tracking-tight">
            Oberhausen Bestsellers
          </h2>
          <p className="text-xs sm:text-sm text-ak-charcoal-muted mt-1 max-w-lg">
            The most sought-after Asian imports flying off our shelves this week.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal hover:text-ak-burgundy transition-colors group"
        >
          <span>View All</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <ProductGrid products={bestsellers} />
    </section>
  );
}
