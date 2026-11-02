"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MapPin,
  Check,
  AlertCircle,
  Tag,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function ProductDetailClient({ product, relatedProducts = [] }) {
  const { addToCart } = useCart();

  // Resolve images array (fallback to single image if array is empty)
  const allImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);

  const [selectedImage, setSelectedImage] = useState(allImages[0] || "/placeholder.png");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [feedback, setFeedback] = useState("");

  const isOutOfStock = product.stock <= 0;
  const maxAvailable = Math.max(0, product.stock || 0);

  // Discount percentage if originalPrice is higher
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
      setFeedback("");
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < maxAvailable) {
      setQuantity((q) => q + 1);
      setFeedback("");
    } else {
      setFeedback(`Maximum available stock is ${maxAvailable} unit${maxAvailable === 1 ? "" : "s"}.`);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const result = addToCart(
      {
        ...product,
        image: product.image || selectedImage || (product.images && product.images[0]) || "",
      },
      quantity
    );
    if (result && result.success === false) {
      setFeedback(result.message);
      return;
    }

    setIsAdded(true);
    setFeedback("");
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col justify-between">
      {/* Hero Header Frame */}
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Product Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 flex-1 w-full space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Product Images Gallery Stage */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl overflow-hidden bg-white/80 border border-ak-ivory-border p-4 shadow-float">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-ak-icy-blue/30">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  className="object-cover transition-all duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Discount Badge */}
                {hasDiscount && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-ak-burgundy text-ak-ivory text-xs font-bold font-mono shadow-sm flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>-{discountPercent}%</span>
                  </div>
                )}

                {/* Stock Status Pill on Image */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border ${
                      isOutOfStock
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : "bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail Selectors (up to 3 images) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 pt-2">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    aria-label={`Select product image ${idx + 1}`}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white ${
                      selectedImage === imgUrl
                        ? "border-ak-burgundy shadow-sm ring-2 ring-ak-burgundy/20"
                        : "border-ak-charcoal/15 hover:border-ak-charcoal/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover rounded-xl"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-ak-burgundy mb-2">
                <span>{product.category}</span>
                {product.sku && (
                  <>
                    <span>•</span>
                    <span className="text-ak-charcoal-light font-mono">SKU: {product.sku}</span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ak-charcoal tracking-tight">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    isOutOfStock ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-rose-600" : "bg-emerald-600"}`} />
                  {isOutOfStock
                    ? "Currently Unavailable in Store"
                    : `${product.stock} unit${product.stock === 1 ? "" : "s"} ready for dispatch`}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="pt-4 border-t border-ak-charcoal/10">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl font-bold text-ak-charcoal">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="font-mono text-base text-ak-charcoal-light line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-ak-charcoal-light font-normal">
                  incl. 7% VAT (Germany)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal block">
                Product Details
              </span>
              <p className="text-sm text-ak-charcoal-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Feedback / Error Notice */}
            {feedback && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Quantity Selector & Add to Bag */}
            <div className="pt-4 border-t border-ak-charcoal/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Quantity Control */}
                <div className="flex items-center justify-between border border-ak-charcoal/20 rounded-full bg-white px-3 py-1.5 self-start sm:self-auto min-w-[130px]">
                  <button
                    onClick={handleQuantityDecrease}
                    disabled={isOutOfStock || quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-ak-charcoal hover:bg-ak-pale-grey/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-sm font-bold px-3 min-w-[32px] text-center">
                    {quantity}
                  </span>

                  <button
                    onClick={handleQuantityIncrease}
                    disabled={isOutOfStock || quantity >= maxAvailable}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-ak-charcoal hover:bg-ak-pale-grey/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs tracking-wider uppercase font-semibold transition-all duration-300 shadow-md ${
                    isOutOfStock
                      ? "bg-ak-charcoal/40 text-white cursor-not-allowed"
                      : isAdded
                      ? "bg-emerald-600 text-white shadow-emerald-600/20"
                      : "bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory hover:shadow-lg"
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Sold Out</span>
                  ) : isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shopping Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        Add to Bag • {formatPrice(product.price * quantity)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Store Guarantee Badges */}
            <div className="p-5 rounded-3xl bg-white/70 border border-ak-charcoal/10 space-y-3 text-xs text-ak-charcoal-muted">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-ak-gold shrink-0" />
                <span>
                  <strong>Local Oberhausen Delivery:</strong> Same-day dispatch on orders placed before 16:00. Free over €35.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-ak-burgundy shrink-0" />
                <span>
                  <strong>Store Pickup:</strong> Free pickup available at Buschhausener Str. 63, 46049 Oberhausen.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>100% Guaranteed Freshness:</strong> Authentic licensed imports direct from Asian producers.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-ak-charcoal/10">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-1">
                You May Also Like
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ak-charcoal tracking-tight">
                Related Asian Specialties
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

