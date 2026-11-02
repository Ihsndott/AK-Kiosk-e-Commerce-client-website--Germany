"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Truck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Live store settings from MongoDB Atlas
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryFee: 3.5,
    freeDeliveryThreshold: 35.0,
  });

  useEffect(() => {
    let isMounted = true;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData?.success && resData?.data) {
          setDeliverySettings({
            deliveryFee:
              typeof resData.data.deliveryFee === "number"
                ? resData.data.deliveryFee
                : 3.5,
            freeDeliveryThreshold:
              typeof resData.data.freeDeliveryThreshold === "number"
                ? resData.data.freeDeliveryThreshold
                : 35.0,
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const freeDeliveryThreshold = deliverySettings.freeDeliveryThreshold;
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : deliverySettings.deliveryFee;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  const applyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "AKWELCOME10") {
      setDiscount(subtotal * 0.1);
      setCouponSuccess(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try AKWELCOME10");
      setCouponSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col">
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight">
              Your Shopping Bag
            </h1>
            <p className="text-sm text-ak-charcoal-muted mt-1">
              Review your selected authentic Asian groceries and treats before checkout.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 flex-1 w-full">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-3xl border border-ak-charcoal/10 p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-ak-icy-blue flex items-center justify-center text-ak-charcoal mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 opacity-70" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-ak-charcoal mb-2">
              Your shopping bag is empty
            </h2>
            <p className="text-sm text-ak-charcoal-muted mb-6">
              Looks like you haven't added any Korean ramen, Ramune sodas, or matcha snacks yet!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-widest font-semibold hover:bg-ak-burgundy transition-all"
            >
              <span>Explore Market Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-ak-charcoal/10">
                <span className="text-xs uppercase tracking-wider font-semibold text-ak-charcoal">
                  Products ({totalItems})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-ak-charcoal-light hover:text-ak-burgundy transition-colors"
                >
                  Clear All
                </button>
              </div>

              {items.map((item) => {
                const itemKey = item._id || item.id;
                const itemSlug = item.slug || itemKey;
                return (
                <div
                  key={itemKey}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/80 border border-ak-charcoal/10 shadow-sm"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link
                      href={`/product/${itemSlug}`}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden bg-ak-icy-blue/30 shrink-0 block hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </Link>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-ak-burgundy block">
                        {item.brand || item.category} {item.origin ? `• ${item.origin}` : ""}
                      </span>
                      <Link
                        href={`/product/${itemSlug}`}
                        className="hover:text-ak-burgundy transition-colors"
                      >
                        <h3 className="font-serif text-sm font-semibold text-ak-charcoal line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      <span className="text-xs font-mono text-ak-charcoal-muted block mt-0.5">
                        {formatPrice(item.price)} each
                      </span>
                      {item.stock !== undefined && item.quantity >= item.stock && (
                        <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                          Max stock reached
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-ak-charcoal/10">
                    <div className="flex items-center border border-ak-charcoal/15 rounded-full bg-ak-ivory px-2 py-1">
                      <button
                        onClick={() => updateQuantity(itemKey, -1)}
                        className="w-6 h-6 flex items-center justify-center text-ak-charcoal hover:text-ak-burgundy"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-3 font-mono min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(itemKey, 1)}
                        className="w-6 h-6 flex items-center justify-center text-ak-charcoal hover:text-ak-burgundy"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="font-mono text-sm font-bold text-ak-charcoal block">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(itemKey)}
                      aria-label="Remove item"
                      className="text-ak-charcoal-light hover:text-ak-burgundy p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Order Summary & Voucher Box */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl bg-white/80 border border-ak-charcoal/10 p-6 shadow-float space-y-5">
                <h2 className="font-serif text-lg font-bold text-ak-charcoal tracking-tight border-b border-ak-charcoal/10 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-ak-charcoal-muted">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-ak-charcoal">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Voucher Discount (10%)</span>
                      <span className="font-mono">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-ak-charcoal-muted">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-ak-gold" />
                      Oberhausen Delivery
                    </span>
                    <span className="font-mono text-ak-charcoal">
                      {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal < freeDeliveryThreshold && (
                    <p className="text-[11px] text-amber-600">
                      Add {formatPrice(freeDeliveryThreshold - subtotal)} more for free delivery
                    </p>
                  )}

                  <div className="pt-3 border-t border-ak-charcoal/10 flex justify-between text-base font-bold text-ak-charcoal">
                    <span>Total Due</span>
                    <span className="font-mono text-xl text-ak-burgundy">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={applyCoupon} className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Coupon: AKWELCOME10"
                      className="w-full px-4 py-2 rounded-full bg-ak-pale-grey/30 border border-ak-charcoal/15 text-xs text-ak-charcoal placeholder-ak-charcoal/40 focus:outline-none uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ak-burgundy transition-all shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> 10% coupon discount applied!
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-600 mt-1.5">{couponError}</p>
                  )}
                </form>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-ak-charcoal text-ak-ivory text-xs tracking-widest uppercase font-semibold hover:bg-ak-burgundy shadow-pill hover:shadow-pill-hover transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-[11px] text-center text-ak-charcoal-light">
                  Free local pickup at Buschhausener Str. 63, Oberhausen
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
