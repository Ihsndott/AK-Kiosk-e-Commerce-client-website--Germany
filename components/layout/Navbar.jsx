"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, User, ShoppingBag, Menu, Sparkles, MapPin, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { FEATURES } from "@/lib/features";
import MobileMenu from "./MobileMenu";
import CartDrawer from "./CartDrawer";
import SearchModal from "./SearchModal";

export default function Navbar({ variant = "hero-integrated" }) {
  const { totalItems, openCart } = useCart();
  const { user, login, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const leftNavLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="relative w-full z-40 select-none">
        {/* ============================================================ */}
        {/* DESKTOP NOTCHED ARCHITECTURAL HEADER (Inspired by Reference) */}
        {/* ============================================================ */}
        <div className="hidden lg:block relative w-full h-[88px]">
          {/* Futuristic Notched SVG Background */}
          <div className="absolute inset-0 w-full h-full drop-shadow-sm pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 1200 90"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 0 0 L 1200 0 L 1200 64 L 750 64 L 710 88 L 490 88 L 450 64 L 0 64 Z"
                fill="#F7F5EF"
              />
              {/* Subtle architectural border along the bottom edge */}
              <path
                d="M 0 64 L 450 64 L 490 88 L 710 88 L 750 64 L 1200 64"
                stroke="rgba(23, 25, 27, 0.08)"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </div>

          {/* Header Content Grid */}
          <div className="relative z-10 w-full h-full grid grid-cols-12 items-start px-6 xl:px-10">
            
            {/* Left Wing Navigation Links (Cols 1 to 4) */}
            <nav className="col-span-4 h-[64px] flex items-center gap-5 xl:gap-7 justify-start">
              {leftNavLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[11px] xl:text-xs tracking-[0.2em] uppercase font-medium text-ak-charcoal/85 hover:text-ak-burgundy transition-colors relative py-1 group"
                >
                  <span>{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-ak-burgundy transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Center Tab Brand Identity (Cols 5 to 8) - Anchored inside the lowered notch */}
            <div className="col-span-4 h-[88px] flex flex-col items-center justify-center text-center -mt-0.5">
              <Link href="/" className="group inline-flex flex-col items-center">
                <span className="font-serif tracking-[0.32em] text-xl xl:text-2xl font-bold text-ak-charcoal uppercase group-hover:text-ak-burgundy transition-colors">
                  AK KIOSK
                </span>
                <span className="text-[8px] xl:text-[9px] tracking-[0.42em] uppercase font-semibold text-ak-burgundy -mt-0.5">
                  ASIAN MARKET
                </span>
              </Link>
            </div>

            {/* Right Wing Controls (Cols 9 to 12) */}
            <div className="col-span-4 h-[64px] flex items-center justify-end gap-3 xl:gap-4">
              {/* Search Icon Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search catalog"
                className="w-9 h-9 rounded-full flex items-center justify-center text-ak-charcoal/80 hover:text-ak-charcoal hover:bg-black/5 transition-all"
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Account Dropdown (Temporarily hidden when customer auth is disabled) */}
              {FEATURES.ENABLE_CUSTOMER_AUTH && (
                <div className="relative">
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    aria-label="User account"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-ak-charcoal/80 hover:text-ak-charcoal hover:bg-black/5 transition-all"
                    title="Account"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  {isAccountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-ak-ivory p-4 shadow-xl border border-ak-ivory-border z-50 text-ak-charcoal"
                    >
                      <div className="pb-3 border-b border-ak-charcoal/10">
                        <p className="text-[10px] uppercase tracking-wider text-ak-charcoal-light font-semibold">
                          Store Account
                        </p>
                        <p className="text-sm font-semibold truncate mt-0.5">
                          {user.isLoggedIn ? user.name : "Welcome Shopper"}
                        </p>
                        <p className="text-[11px] text-ak-charcoal-muted flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-ak-burgundy" />
                          Oberhausen, Germany
                        </p>
                      </div>

                      <div className="py-2 space-y-1">
                        {user.isLoggedIn ? (
                          <>
                            <Link
                              href="/account"
                              onClick={() => setIsAccountOpen(false)}
                              className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-ak-burgundy hover:bg-ak-pale-grey/40 transition-colors"
                            >
                              My Account & Orders
                            </Link>
                            <Link
                              href="/cart"
                              onClick={() => setIsAccountOpen(false)}
                              className="block px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-ak-pale-grey/40 transition-colors"
                            >
                              Shopping Bag
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/login"
                            onClick={() => setIsAccountOpen(false)}
                            className="block px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-ak-pale-grey/40 transition-colors"
                          >
                            Customer Sign In
                          </Link>
                        )}
                        <Link
                          href="/contact"
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-ak-pale-grey/40 transition-colors"
                        >
                          Store Hours & Directions
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-ak-charcoal/10">
                        {user.isLoggedIn ? (
                          <button
                            onClick={() => {
                              logout();
                              setIsAccountOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-ak-burgundy font-medium hover:bg-ak-pale-grey/40 rounded-lg"
                          >
                            Sign Out
                          </button>
                        ) : (
                          <Link
                            href="/login"
                            onClick={() => setIsAccountOpen(false)}
                            className="block w-full py-2 text-center rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ak-burgundy transition-all"
                          >
                            Sign In / Register
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* SHOP NOW / SIGN IN Pill Button (Matching Reference) */}
              <Link
                href="/shop"
                className="px-5 py-2 rounded-full bg-ak-charcoal text-ak-ivory text-[11px] xl:text-xs font-medium tracking-[0.18em] uppercase hover:bg-ak-burgundy hover:shadow-md transition-all duration-300"
              >
                Shop Now
              </Link>

              {/* Shopping Bag Icon Pill (Matching Reference) */}
              <button
                onClick={openCart}
                aria-label="Shopping bag"
                className="relative w-9 h-9 rounded-full bg-ak-charcoal text-ak-ivory flex items-center justify-center hover:bg-ak-burgundy transition-colors shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full bg-ak-burgundy text-ak-ivory text-[9px] font-bold flex items-center justify-center px-1 border border-ak-ivory">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE COMPACT HEADER (Flush and Responsive)                 */}
        {/* ============================================================ */}
        <div className="lg:hidden relative w-full h-16 bg-ak-ivory border-b border-ak-charcoal/10 px-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-full text-ak-charcoal hover:bg-ak-charcoal/5"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex flex-col items-center justify-center">
            <span className="font-serif tracking-[0.25em] text-base font-bold text-ak-charcoal uppercase">
              AK KIOSK
            </span>
            <span className="text-[7.5px] tracking-[0.35em] uppercase font-semibold text-ak-burgundy -mt-0.5">
              ASIAN MARKET
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="p-2 rounded-full text-ak-charcoal hover:bg-ak-charcoal/5"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={openCart}
              aria-label="Cart"
              className="relative p-2 rounded-full bg-ak-charcoal text-ak-ivory hover:bg-ak-burgundy transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-ak-burgundy text-ak-ivory text-[9px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawers & Modals */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
