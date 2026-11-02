"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { STORE_INFO } from "@/lib/products";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle"); // idle | submitting | success | error
  const [subMessage, setSubMessage] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubStatus("submitting");
    setSubMessage("");

    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubStatus("success");
        setSubMessage(data.message || "You're subscribed!");
        setEmail("");
      } else {
        setSubStatus("error");
        setSubMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setSubStatus("error");
      setSubMessage("Network error. Please check your connection.");
    }
  }

  return (
    <footer className="w-full bg-ak-charcoal text-ak-ivory pt-16 pb-12 mt-20 border-t border-ak-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        
        {/* Top Newsletter / Brand Banner */}
        <div className="pb-14 border-b border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ak-gold block mb-1">
              Join Our Foodie Community
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Discover Authentic Asian Flavors
            </h3>
            <p className="text-xs sm:text-sm text-ak-pale-grey/70 mt-1.5 max-w-md">
              Subscribe for new weekly ramen drops, limited seasonal matcha snacks, and exclusive secret store vouchers.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subStatus === "success" ? (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-900/30 border border-emerald-700/40 max-w-md lg:ml-auto">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-200">{subMessage}</p>
              </div>
            ) : (
              <>
                {subStatus === "error" && (
                  <p className="text-xs text-rose-400 mb-2 max-w-md lg:ml-auto">{subMessage}</p>
                )}
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-2.5 max-w-md lg:ml-auto"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (subStatus === "error") setSubStatus("idle");
                    }}
                    placeholder="Enter your email address"
                    disabled={subStatus === "submitting"}
                    className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder-ak-pale-grey/40 focus:outline-none focus:border-ak-gold disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={subStatus === "submitting"}
                    className="px-6 py-3 rounded-full bg-ak-gold text-ak-charcoal text-xs uppercase tracking-widest font-bold hover:bg-[#deb874] transition-colors shrink-0 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {subStatus === "submitting" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subscribing…</span>
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.25em] text-white block uppercase">
                AK KIOSK
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase font-semibold text-ak-gold block">
                ASIAN MARKET • OBERHAUSEN
              </span>
            </div>
            <p className="text-xs text-ak-pale-grey/70 max-w-sm leading-relaxed">
              Your premier destination for authentic Korean, Japanese, Chinese, and Taiwanese groceries, snacks, beverages, and pantry essentials.
            </p>
            <div className="space-y-2 text-xs text-ak-pale-grey/80 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-ak-burgundy shrink-0" />
                <span>{STORE_INFO.address.full}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-ak-gold shrink-0" />
                <span>{STORE_INFO.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-ak-pale-grey shrink-0" />
                <span>Mon-Sat: 09:00 - 22:00 | Sun: 12:00 - 20:00</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-ak-gold mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-ak-pale-grey/70">
              <li>
                <Link href="/categories/groceries" className="hover:text-white transition-colors">
                  Asian Groceries
                </Link>
              </li>
              <li>
                <Link href="/categories/snacks" className="hover:text-white transition-colors">
                  Snacks & Sweets
                </Link>
              </li>
              <li>
                <Link href="/categories/drinks" className="hover:text-white transition-colors">
                  Drinks & Teas
                </Link>
              </li>
              <li>
                <Link href="/categories/groceries" className="hover:text-white transition-colors">
                  Instant Ramen & Noodles
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-ak-gold mb-4">
              Information
            </h4>
            <ul className="space-y-2.5 text-xs text-ak-pale-grey/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Store
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Store Hours & Directions
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Local Delivery Rates
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-ak-gold mb-4">
              Local Promise
            </h4>
            <div className="space-y-3 text-xs text-ak-pale-grey/70">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-semibold text-white block text-[11px]">
                  Same-Day Oberhausen
                </span>
                <span className="text-[10px] text-ak-pale-grey/60">
                  Fast neighborhood fulfillment
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-semibold text-white block text-[11px]">
                  100% Authentic Imports
                </span>
                <span className="text-[10px] text-ak-pale-grey/60">
                  Certified verified goods
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ak-pale-grey/60 gap-4">
          <p>© {new Date().getFullYear()} AK Kiosk & Asian Market. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Buschhausener Str. 63, 46049 Oberhausen, Germany</span>
            <span className="text-white/20">•</span>
            <Link
              href="/admin/login"
              className="text-ak-pale-grey/40 hover:text-ak-gold transition-colors text-[10px] tracking-wider uppercase"
              title="Admin Portal"
            >
              Admin
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
