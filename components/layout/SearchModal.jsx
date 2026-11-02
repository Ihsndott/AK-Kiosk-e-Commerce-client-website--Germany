"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState(PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAllProducts(json.data);
          }
        }
      } catch {
        // Keep fallback
      }
    }
    fetchLiveProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = query.trim()
    ? allProducts.filter((p) => {
        const q = query.toLowerCase();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
          (p.origin && p.origin.toLowerCase().includes(q))
        );
      })
    : [];

  const quickPills = ["Buldak Ramen", "Ramune Soda", "Pocky Matcha", "Chili Oil", "Kewpie", "Mochi"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ak-charcoal/70 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-2xl bg-ak-ivory rounded-3xl shadow-2xl border border-ak-ivory-border overflow-hidden"
            >
              {/* Search Input Bar */}
              <div className="relative flex items-center p-4 sm:p-6 border-b border-ak-charcoal/10 bg-white/40">
                <Search className="w-5 h-5 text-ak-charcoal-light mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Asian groceries, spicy ramen, snacks, drinks..."
                  className="w-full bg-transparent text-sm sm:text-base text-ak-charcoal placeholder-ak-charcoal/40 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 text-ak-charcoal/40 hover:text-ak-charcoal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="ml-3 px-2.5 py-1 text-xs tracking-wider uppercase rounded-lg bg-ak-pale-grey/50 text-ak-charcoal hover:bg-ak-pale-grey"
                >
                  ESC
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="px-6 py-3 bg-ak-icy-blue/40 border-b border-ak-charcoal/5 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[10px] tracking-wider uppercase text-ak-charcoal-light font-semibold shrink-0">
                  Popular:
                </span>
                {quickPills.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setQuery(pill)}
                    className="px-3 py-1 rounded-full bg-white/80 hover:bg-white text-ak-charcoal text-[11px] font-medium border border-ak-charcoal/10 transition-colors shrink-0"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Results Area */}
              <div className="max-h-96 overflow-y-auto p-4 sm:p-6">
                {query.trim() === "" ? (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ak-icy-blue text-ak-charcoal mb-3">
                      <Sparkles className="w-5 h-5 text-ak-gold" />
                    </div>
                    <p className="text-xs tracking-wider uppercase font-semibold text-ak-charcoal">
                      Search Our Oberhausen Market Catalog
                    </p>
                    <p className="text-xs text-ak-charcoal-light mt-1">
                      Explore over 800+ authentic Korean, Japanese, Chinese & Taiwanese goods.
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-8 text-center text-ak-charcoal-light text-xs">
                    No products found for "{query}". Try "ramen", "matcha", or "soda".
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-[10px] tracking-widest uppercase font-bold text-ak-charcoal/50 px-1">
                      Found {filtered.length} products
                    </div>
                    {filtered.map((item) => {
                      const itemKey = item._id || item.id;
                      const itemSlug = item.slug || itemKey;
                      const isOutOfStock = typeof item.stock === "number" && item.stock <= 0;
                      return (
                        <div
                          key={itemKey}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/70 hover:bg-white border border-ak-charcoal/5 transition-all group"
                        >
                          <Link
                            href={`/product/${itemSlug}`}
                            onClick={onClose}
                            className="flex items-center gap-3.5 min-w-0 flex-1 hover:opacity-90"
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-ak-pale-grey/30 shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-ak-burgundy block">
                                {item.brand || item.category} {item.origin ? `• ${item.origin}` : ""}
                              </span>
                              <h4 className="text-xs font-semibold text-ak-charcoal truncate">
                                {item.name}
                              </h4>
                              <span className="text-xs font-mono font-bold text-ak-charcoal">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </Link>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <button
                              onClick={() => {
                                if (!isOutOfStock) {
                                  addToCart(item, 1);
                                  onClose();
                                }
                              }}
                              disabled={isOutOfStock}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase transition-colors ${
                                isOutOfStock
                                  ? "bg-ak-charcoal/30 text-white/70 cursor-not-allowed"
                                  : "bg-ak-charcoal text-ak-ivory hover:bg-ak-burgundy"
                              }`}
                            >
                              {isOutOfStock ? "Sold Out" : "+ Add"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
