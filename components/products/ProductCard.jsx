"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Check, Star, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const productId = product._id || product.id;
  const productSlug = product.slug || product._id || product.id || "";
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart({ ...product, id: productId, _id: productId }, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const badgeColors = {
    gold: "bg-ak-gold text-ak-charcoal",
    burgundy: "bg-ak-burgundy text-ak-ivory",
    blue: "bg-ak-charcoal text-ak-ivory",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col justify-between w-full h-full rounded-2xl sm:rounded-3xl bg-white/70 hover:bg-white border border-ak-charcoal/10 hover:border-ak-charcoal/20 p-2.5 sm:p-4 transition-all duration-300 hover:shadow-float"
    >
      {/* Top Image & Badges */}
      <div className="relative">
        <Link href={`/product/${productSlug}`} className="block relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-ak-icy-blue/40">
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Discount badge if applicable */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-full bg-ak-burgundy text-ak-ivory text-[9px] sm:text-[10px] font-bold font-mono">
              -
              {Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) * 100
              )}
              %
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <div
              className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm max-w-[70%] truncate ${
                badgeColors[product.badgeType] || badgeColors.gold
              }`}
            >
              {product.badge}
            </div>
          )}
        </Link>
      </div>

      {/* Product Information */}
      <div className="pt-2.5 sm:pt-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-ak-charcoal-light mb-1 gap-1">
            <span className="font-semibold uppercase tracking-wider text-ak-burgundy truncate">
              {product.brand || product.category}
            </span>
            <span className="truncate shrink-0 text-[10px]">{product.origin || (product.brand ? product.category : "")}</span>
          </div>

          <Link href={`/product/${productSlug}`}>
            <h3 className="font-serif text-xs sm:text-sm font-semibold text-ak-charcoal line-clamp-2 hover:text-ak-burgundy transition-colors min-h-[32px] sm:min-h-[40px] leading-snug">
              {product.name}
            </h3>
          </Link>

          {product.rating ? (
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-ak-charcoal-light truncate">
              <div className="flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-current shrink-0" />
              </div>
              <span className="font-semibold text-ak-charcoal">{product.rating}</span>
              {product.reviews !== undefined && (
                <span className="text-[10px] sm:text-[11px]">({product.reviews})</span>
              )}
              {product.weight && (
                <>
                  <span className="mx-0.5 sm:mx-1">•</span>
                  <span className="text-[10px] sm:text-[11px] font-mono">{product.weight}</span>
                </>
              )}
            </div>
          ) : product.stock !== undefined ? (
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-ak-charcoal-light truncate">
              <span
                className={`text-[10px] sm:text-[11px] font-mono font-medium ${
                  product.stock > 0 ? "text-emerald-700" : "text-ak-burgundy"
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </span>
            </div>
          ) : null}
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-2.5 sm:pt-4 mt-2 sm:mt-3 border-t border-ak-charcoal/10 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <span className="font-mono text-xs sm:text-base font-bold text-ak-charcoal block truncate">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-[10px] sm:text-xs text-ak-charcoal-light line-through block truncate">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-300 shrink-0 ${
              isOutOfStock
                ? "bg-ak-charcoal/30 text-white/70 cursor-not-allowed"
                : isAdded
                ? "bg-emerald-600 text-white"
                : "bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory shadow-sm hover:shadow-md"
            }`}
          >
            {isOutOfStock ? (
              <span>Sold Out</span>
            ) : isAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
