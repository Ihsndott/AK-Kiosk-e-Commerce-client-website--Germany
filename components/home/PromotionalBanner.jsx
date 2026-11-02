"use client";

import Link from "next/link";
import { Sparkles, MapPin, Tag, Truck } from "lucide-react";

export default function PromotionalBanner() {
  return (
    <section className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto my-12">
      <div className="relative rounded-[2.5rem] bg-gradient-to-r from-ak-charcoal via-ak-charcoal-muted to-ak-charcoal p-8 sm:p-12 text-ak-ivory overflow-hidden border border-ak-charcoal shadow-2xl">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ak-burgundy/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-ak-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-ak-gold text-[10px] tracking-widest uppercase font-bold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Limited First Order Offer</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ak-ivory">
              Get 10% Off Your First Asian Market Order
            </h3>

            <p className="text-sm text-ak-pale-grey/80 max-w-xl leading-relaxed">
              Use code <span className="font-mono text-ak-gold font-bold">AKWELCOME10</span> at
              checkout. Enjoy authentic Korean, Japanese, Chinese, and Taiwanese pantry treasures delivered straight to your door.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-ak-pale-grey/70">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-ak-gold" />
                Free delivery in Oberhausen &gt; €35
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-ak-burgundy" />
                In-store pickup: Buschhausener Str. 63
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-ak-ivory text-ak-charcoal hover:bg-ak-gold hover:text-ak-charcoal text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md"
            >
              Claim Voucher
            </Link>
            <div className="text-[11px] font-mono text-ak-pale-grey/60">
              Valid online and in-store • Oberhausen
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
