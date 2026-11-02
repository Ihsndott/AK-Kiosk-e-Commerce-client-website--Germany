"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, totalItems, subtotal, isOpen, closeCart, updateQuantity, removeFromCart } = useCart();

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(35.0);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((resData) => {
        if (
          isMounted &&
          resData?.success &&
          typeof resData?.data?.freeDeliveryThreshold === "number"
        ) {
          setFreeShippingThreshold(resData.data.freeDeliveryThreshold);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-ak-charcoal/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-ak-ivory text-ak-charcoal shadow-2xl flex flex-col border-l border-ak-ivory-border"
          >
            {/* Header */}
            <div className="p-6 border-b border-ak-charcoal/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-ak-icy-blue flex items-center justify-center text-ak-charcoal">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-lg tracking-wider uppercase font-semibold">
                    Shopping Bag
                  </h2>
                  <p className="text-xs text-ak-charcoal-light">
                    {totalItems} {totalItems === 1 ? "item" : "items"} selected
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="w-9 h-9 rounded-full flex items-center justify-center text-ak-charcoal hover:bg-ak-charcoal/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping banner */}
            <div className="bg-ak-icy-blue/70 p-4 border-b border-ak-charcoal/10">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5 text-ak-charcoal">
                  <Sparkles className="w-3.5 h-3.5 text-ak-gold" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-700 font-semibold">
                      You've unlocked Free Oberhausen Delivery!
                    </span>
                  ) : (
                    <span>
                      Add{" "}
                      <strong className="text-ak-burgundy">
                        {formatPrice(remainingForFreeShipping)}
                      </strong>{" "}
                      more for free local delivery
                    </span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-ak-charcoal-muted">
                  {Math.round(progressToFreeShipping)}%
                </span>
              </div>
              <div className="w-full bg-ak-ivory rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToFreeShipping}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-ak-gold to-ak-burgundy rounded-full"
                />
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-ak-pale-grey/40 flex items-center justify-center text-ak-charcoal-light mb-4">
                    <ShoppingBag className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="font-serif text-base tracking-wide uppercase font-semibold text-ak-charcoal mb-1">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-ak-charcoal-light max-w-xs mb-6">
                    Discover authentic ramen, imported snacks, and chilled teas ready to be delivered to your door.
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs tracking-wider uppercase hover:bg-ak-burgundy transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const itemKey = item._id || item.id;
                  const itemSlug = item.slug || itemKey;
                  return (
                    <div
                      key={itemKey}
                      className="flex gap-4 p-3 rounded-2xl bg-white/70 border border-ak-charcoal/5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Link
                        href={`/product/${itemSlug}`}
                        onClick={closeCart}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-ak-pale-grey/30 shrink-0 block hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] tracking-wider uppercase font-semibold text-ak-burgundy block">
                              {item.brand || item.category}
                            </span>
                            <Link
                              href={`/product/${itemSlug}`}
                              onClick={closeCart}
                              className="hover:text-ak-burgundy transition-colors block"
                            >
                              <h4 className="text-xs font-semibold text-ak-charcoal truncate">
                                {item.name}
                              </h4>
                            </Link>
                          </div>
                          <button
                            onClick={() => removeFromCart(itemKey)}
                            aria-label={`Remove ${item.name}`}
                            className="text-ak-charcoal-light hover:text-ak-burgundy p-1 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-ak-charcoal/15 rounded-full bg-ak-ivory px-1.5 py-0.5">
                            <button
                              onClick={() => updateQuantity(itemKey, -1)}
                              className="w-5 h-5 flex items-center justify-center text-ak-charcoal hover:text-ak-burgundy transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold px-2 min-w-[20px] text-center font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(itemKey, 1)}
                              className="w-5 h-5 flex items-center justify-center text-ak-charcoal hover:text-ak-burgundy transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold font-mono text-ak-charcoal">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 bg-white/60 border-t border-ak-charcoal/10 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-ak-charcoal-light">
                    <span>Subtotal</span>
                    <span className="font-mono text-ak-charcoal font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-ak-charcoal-light">
                    <span>Oberhausen Delivery</span>
                    <span className="font-mono text-ak-charcoal">
                      {subtotal >= freeShippingThreshold ? "FREE" : "€3.50"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-ak-charcoal/10 flex justify-between text-sm font-bold text-ak-charcoal">
                    <span>Total (incl. VAT)</span>
                    <span className="font-mono text-base text-ak-burgundy">
                      {formatPrice(subtotal + (subtotal >= freeShippingThreshold ? 0 : 3.5))}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs tracking-wider uppercase font-semibold hover:bg-ak-burgundy shadow-pill hover:shadow-pill-hover transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full block text-center py-2 text-xs tracking-wider uppercase font-medium text-ak-charcoal-light hover:text-ak-charcoal transition-colors"
                  >
                    View Full Cart Details
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
