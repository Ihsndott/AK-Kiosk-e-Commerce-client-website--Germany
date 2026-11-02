"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, MapPin, Heart, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { STORE_INFO } from "@/lib/products";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col">
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-16 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
              Our Heritage & Vision
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight max-w-3xl mx-auto">
              Authentic Asian Flavors, Rooted in Oberhausen
            </h1>
            <p className="text-sm text-ak-charcoal-muted mt-3 max-w-xl mx-auto">
              Connecting our local community in North Rhine-Westphalia to the rich culinary traditions of East and Southeast Asia.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-12 flex-1 w-full space-y-12">
        <div className="rounded-3xl bg-white/80 p-8 sm:p-12 border border-ak-charcoal/10 shadow-sm space-y-6 text-sm text-ak-charcoal-muted leading-relaxed">
          <h2 className="font-serif text-2xl font-bold text-ak-charcoal">
            Welcome to AK Kiosk & Asian Market
          </h2>
          <p>
            Located at <strong className="text-ak-charcoal">{STORE_INFO.address.full}</strong>, AK Kiosk & Asian Market was born from a passion for authentic culinary experiences. What started as a beloved neighborhood kiosk has blossomed into Oberhausen's go-to boutique grocery for authentic Asian ingredients.
          </p>
          <p>
            Whether you are on a quest to master the art of homemade Japanese ramen broth, hunting for that viral fiery Korean Buldak noodle spice, or looking for comforting Taiwanese fruit jellies and chilled Ramune sodas, our shelves are curated with love and rigor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-ak-charcoal/10">
            <div className="p-5 rounded-2xl bg-ak-icy-blue/30 border border-ak-charcoal/5">
              <Sparkles className="w-6 h-6 text-ak-gold mb-2" />
              <h3 className="font-serif text-base font-bold text-ak-charcoal">
                Direct Imports
              </h3>
              <p className="text-xs text-ak-charcoal-light mt-1">
                Authentic, certified products sourced directly from trusted Asian food distributors.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ak-icy-blue/30 border border-ak-charcoal/5">
              <MapPin className="w-6 h-6 text-ak-burgundy mb-2" />
              <h3 className="font-serif text-base font-bold text-ak-charcoal">
                Local Oberhausen Heart
              </h3>
              <p className="text-xs text-ak-charcoal-light mt-1">
                Conveniently situated on Buschhausener Str. 63 with rapid local same-day delivery.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ak-icy-blue/30 border border-ak-charcoal/5">
              <Heart className="w-6 h-6 text-ak-burgundy mb-2" />
              <h3 className="font-serif text-base font-bold text-ak-charcoal">
                Personal Service
              </h3>
              <p className="text-xs text-ak-charcoal-light mt-1">
                We're always thrilled to recommend sauce pairings, cooking instructions, and snacks.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
