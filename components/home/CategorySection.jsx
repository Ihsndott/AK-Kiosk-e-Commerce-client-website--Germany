"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/products";

export default function CategorySection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
            Curated Collections
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ak-charcoal tracking-tight">
            Explore By Department
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal hover:text-ak-burgundy transition-colors group"
        >
          <span>View All 800+ Products</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/70 border border-ak-charcoal/10 hover:border-ak-charcoal/20 transition-all duration-300 hover:shadow-float flex flex-col justify-between h-full"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-ak-icy-blue/40 shrink-0">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ak-charcoal/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-ak-ivory/90 backdrop-blur-md text-ak-charcoal text-[8px] sm:text-[10px] font-bold tracking-wider uppercase truncate max-w-[80%]">
                {category.itemCount}
              </span>
            </div>

            <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-sm sm:text-lg font-bold text-ak-charcoal group-hover:text-ak-burgundy transition-colors leading-snug line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-ak-charcoal-muted mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="pt-2.5 sm:pt-4 mt-2.5 sm:mt-3 border-t border-ak-charcoal/10 flex items-center justify-between text-[9px] sm:text-xs font-semibold tracking-wider uppercase text-ak-charcoal group-hover:text-ak-burgundy">
                <span className="truncate pr-1">Browse Category</span>
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-ak-pale-grey/50 group-hover:bg-ak-burgundy group-hover:text-ak-ivory flex items-center justify-center transition-all shrink-0">
                  <ArrowUpRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
