"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Search, ShoppingBag, MapPin, Clock, Phone, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { STORE_INFO } from "@/lib/products";
import { FEATURES } from "@/lib/features";

export default function MobileMenu({ isOpen, onClose, onOpenSearch }) {
  const { totalItems, openCart } = useCart();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ak-charcoal/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm bg-ak-ivory text-ak-charcoal shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden border-r border-ak-ivory-border"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-ak-charcoal/10 flex items-center justify-between">
              <div>
                <span className="font-serif text-xl tracking-[0.2em] font-semibold text-ak-charcoal block">
                  AK KIOSK
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-ak-burgundy font-medium block">
                  Asian Market • Oberhausen
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-10 h-10 rounded-full flex items-center justify-center text-ak-charcoal hover:bg-ak-charcoal/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Search & Cart */}
            <div className="p-6 pb-2 space-y-3">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenSearch) onOpenSearch();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-ak-pale-grey/40 hover:bg-ak-pale-grey/60 text-ak-charcoal text-xs tracking-wider uppercase transition-all"
              >
                <span className="flex items-center gap-2.5 text-ak-charcoal-light">
                  <Search className="w-4 h-4 text-ak-charcoal" />
                  <span>Search noodles, snacks, teas...</span>
                </span>
                <span className="text-[10px] font-mono bg-ak-ivory px-2 py-0.5 rounded-full border border-ak-charcoal/10">
                  Ctrl+K
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  openCart();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-ak-charcoal text-ak-ivory text-xs tracking-wider uppercase hover:bg-ak-burgundy transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Shopping Bag</span>
                </span>
                <span className="w-5 h-5 rounded-full bg-ak-gold text-ak-charcoal text-[11px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              </button>
            </div>

            {/* Nav Links */}
            <nav className="p-6 py-2 space-y-1 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-ak-charcoal/50 font-bold px-2 py-2">
                Navigation
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium tracking-wide uppercase text-ak-charcoal hover:bg-ak-pale-grey/30 hover:text-ak-burgundy transition-all group"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-ak-charcoal/30 group-hover:text-ak-burgundy group-hover:translate-x-1 transition-all" />
                </Link>
              ))}

              {FEATURES.ENABLE_CUSTOMER_AUTH && (
                <div className="pt-2 space-y-1.5">
                  {user.isLoggedIn ? (
                    <>
                      <Link
                        href="/account"
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-ak-burgundy bg-ak-icy-blue/40 hover:bg-ak-icy-blue/70 border border-ak-charcoal/10 transition-all group"
                      >
                        <span>My Account ({user.name})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ak-burgundy/60 group-hover:translate-x-1 transition-all" />
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold tracking-wider uppercase text-ak-burgundy hover:bg-rose-50 rounded-xl transition-all"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-ak-charcoal/80 bg-white/60 hover:bg-white hover:text-ak-burgundy border border-ak-charcoal/5 transition-all group"
                    >
                      <span>Customer Sign In / Register</span>
                      <ChevronRight className="w-3.5 h-3.5 text-ak-charcoal/30 group-hover:text-ak-burgundy group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                </div>
              )}
            </nav>

            {/* Store Information Footer in Drawer */}
            <div className="p-6 bg-ak-icy-blue/60 border-t border-ak-charcoal/10 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-ak-charcoal-muted">
                <MapPin className="w-4 h-4 text-ak-burgundy shrink-0 mt-0.5" />
                <span>{STORE_INFO.address.full}</span>
              </div>
              <div className="flex items-center gap-2.5 text-ak-charcoal-muted">
                <Clock className="w-4 h-4 text-ak-gold shrink-0" />
                <span>Mon-Sat: 09:00 - 22:00</span>
              </div>
              <div className="flex items-center gap-2.5 text-ak-charcoal-muted">
                <Phone className="w-4 h-4 text-ak-charcoal shrink-0" />
                <span>{STORE_INFO.contact.phone}</span>
              </div>

              <div className="pt-2 text-[10px] text-center text-ak-charcoal-light tracking-widest uppercase">
                Free local delivery in Oberhausen &gt; €35
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
