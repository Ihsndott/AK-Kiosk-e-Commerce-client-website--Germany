"use client";

import ProductCard from "./ProductCard";

export default function ProductGrid({ products, title, subtitle }) {
  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center text-ak-charcoal-light">
        No products available in this selection.
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-8 text-center max-w-2xl mx-auto">
          {subtitle && (
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ak-charcoal tracking-tight">
              {title}
            </h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
