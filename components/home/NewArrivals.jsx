"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { PRODUCTS } from "@/lib/products";

export default function NewArrivals() {
  const [newItems, setNewItems] = useState(() => PRODUCTS.slice(0, 4));

  useEffect(() => {
    let isMounted = true;
    async function loadLiveProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            // Sort by createdAt descending (newest first)
            const sortedByDate = [...json.data].sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
            // Display the latest 4 products
            setNewItems(sortedByDate.slice(0, 4));
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
    <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy mb-2">
            <Sparkles className="w-4 h-4 text-ak-gold" />
            <span>Just Landed In Store</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ak-charcoal tracking-tight">
            New Arrivals
          </h2>
          <p className="text-xs sm:text-sm text-ak-charcoal-muted mt-1 max-w-lg">
            Directly imported authentic snacks, drinks, and grocery essentials newly added to our shelves in Oberhausen.
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

      <ProductGrid products={newItems} />
    </section>
  );
}
