"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  ShoppingCart,
  ArrowRight,
  MapPin,
  Truck,
  Star,
  Soup,
  Cookie,
  CupSoda,
  Leaf,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function HeroSection() {
  const heroRef = useRef(null);
  //hero images motion
  const heroImages = [
    "/images/hero/market-1.png",
    "/images/hero/market-2.png",
    "/images/hero/market-3.png",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Desktop mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 140 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothMouseX, [-400, 400], [-8, 8]);
  const parallaxY = useTransform(smoothMouseY, [-400, 400], [-6, 6]);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-ak-pale-grey p-3 sm:p-5 md:p-8 select-none"
    >
      {/* ============================================================ */}
      {/* LARGE ROUNDED HERO FRAME (Preserved outer frame & styling)   */}
      {/* ============================================================ */}
      <div className="relative w-full min-h-[720px] lg:min-h-[860px] rounded-[2.2rem] sm:rounded-[3rem] md:rounded-[3.5rem] bg-gradient-to-b from-[#E7F3F6] via-[#EEF6F8] to-[#DFEFF3] border-[2px] border-ak-ivory shadow-frame overflow-hidden flex flex-col justify-between">

        {/* Traditional Wave Pattern in Bottom Corners (Reference Match) */}
        <div className="absolute bottom-0 left-0 w-44 sm:w-64 h-32 sm:h-44 pointer-events-none opacity-40 overflow-hidden z-0">
          <svg className="w-full h-full text-[#9CC0CB]" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="0" cy="140" r="120" />
            <circle cx="0" cy="140" r="95" />
            <circle cx="0" cy="140" r="70" />
            <circle cx="0" cy="140" r="45" />
            <circle cx="0" cy="140" r="20" />
            <circle cx="80" cy="140" r="100" />
            <circle cx="80" cy="140" r="75" />
            <circle cx="80" cy="140" r="50" />
            <circle cx="80" cy="140" r="25" />
            <circle cx="40" cy="80" r="60" />
            <circle cx="40" cy="80" r="40" />
            <circle cx="40" cy="80" r="20" />
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-44 sm:w-64 h-32 sm:h-44 pointer-events-none opacity-40 overflow-hidden z-0 scale-x-[-1]">
          <svg className="w-full h-full text-[#9CC0CB]" viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="0" cy="140" r="120" />
            <circle cx="0" cy="140" r="95" />
            <circle cx="0" cy="140" r="70" />
            <circle cx="0" cy="140" r="45" />
            <circle cx="0" cy="140" r="20" />
            <circle cx="80" cy="140" r="100" />
            <circle cx="80" cy="140" r="75" />
            <circle cx="80" cy="140" r="50" />
            <circle cx="80" cy="140" r="25" />
            <circle cx="40" cy="80" r="60" />
            <circle cx="40" cy="80" r="40" />
            <circle cx="40" cy="80" r="20" />
          </svg>
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-72 bg-white/50 blur-3xl rounded-full pointer-events-none" />

        {/* ------------------------------------------------------------ */}
        {/* TOP: Flush Integrated Notched Navbar (Preserved)             */}
        {/* ------------------------------------------------------------ */}
        <div className="relative z-30 w-full">
          <Navbar variant="hero-integrated" />
        </div>

        {/* ------------------------------------------------------------ */}
        {/* INNER CONTENT CANVAS (Closely matching reference image)      */}
        {/* ------------------------------------------------------------ */}
        <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center text-center px-4 sm:px-8 lg:px-12 pt-2 sm:pt-4 pb-6 sm:pb-8">

          {/* Top Info Group: Badge, Headline, Description */}
          <div className="flex flex-col items-center max-w-3xl mx-auto z-20">
            {/* Centered AK Kiosk & Asian Market Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-4 py-1.5 rounded-full bg-[#FAF6EF] border border-[#E8DCC9] shadow-sm text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-ak-burgundy"
            >
              <Store className="w-3.5 h-3.5 text-ak-burgundy" />
              <span>AK KIOSK & ASIAN MARKET</span>
            </motion.div>

            {/* Headline with Decorative Accent Rays */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-ak-charcoal tracking-tight leading-[1.15] mb-3 text-center"
            >
              <span className="relative inline-block text-ak-charcoal">
                A Little Taste of Asia,
                {/* 3 Red Accent Rays (Upper Right) */}
                <span className="absolute -top-3 -right-6 text-ak-burgundy hidden sm:inline-block">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="6" y1="18" x2="16" y2="8" />
                    <line x1="12" y1="20" x2="22" y2="14" />
                    <line x1="4" y1="12" x2="14" y2="2" />
                  </svg>
                </span>
              </span>
              <br />
              <span className="text-ak-burgundy italic font-serif">
                Right Around the Corner
              </span>
            </motion.h1>

            {/* Short Shop Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-[15px] text-ak-charcoal-muted max-w-xl mx-auto leading-relaxed text-center mb-4 sm:mb-6"
            >
              Discover authentic Asian groceries, delicious snacks, refreshing drinks, and everyday essentials in Oberhausen.
            </motion.p>
          </div>

          {/* Central Section: Shop Image Flanked by 4 Category Cards */}
          <motion.div
            style={{ x: parallaxX, y: parallaxY }}
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-4 lg:gap-5 my-2 sm:my-4 z-20"
          >
            {/* Left Flank Category Cards (Desktop / Tablet) */}
            <div className="hidden sm:flex flex-col gap-6 md:gap-8 shrink-0">
              {/* Asian Groceries Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link
                  href="/categories/groceries"
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-xl hover:scale-105 hover:border-ak-burgundy/30 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F5] border border-red-100 flex items-center justify-center text-ak-burgundy group-hover:scale-110 transition-transform">
                    <Soup className="w-5 h-5" />
                  </div>
                  <div className="text-left font-sans leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">Asian</span>
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">Groceries</span>
                  </div>
                </Link>
              </motion.div>

              {/* Snacks & Treats Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link
                  href="/categories/snacks"
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-xl hover:scale-105 hover:border-ak-burgundy/30 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F5] border border-red-100 flex items-center justify-center text-ak-burgundy group-hover:scale-110 transition-transform">
                    <Cookie className="w-5 h-5" />
                  </div>
                  <div className="text-left font-sans leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">Snacks</span>
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">& Treats</span>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Center Shop Image */}
            <div className="relative w-full max-w-[550px] sm:w-[55%] sm:max-w-[620px] lg:w-[960px] lg:max-w-[960px] lg:shrink-0">
              {/* Decorative Accent Rays - Left of Image */}
              <div className="absolute -top-3 -left-5 hidden md:block text-ak-burgundy pointer-events-none">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="4" y1="14" x2="10" y2="4" />
                  <line x1="12" y1="18" x2="18" y2="8" />
                </svg>
              </div>

              {/* Central Rectangular Shop Image Container */}
              <div className="relative aspect-[16/8] w-full rounded-2xl sm:rounded-3xl overflow-hidden border-4 sm:border-[6px] border-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] bg-ak-icy-blue/50">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={heroImages[currentImage]}
                      alt="Asian grocery market"
                      fill
                      priority={currentImage === 0}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 650px, 760px"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Decorative Accent Rays - Bottom Right of Image */}
              <div className="absolute -bottom-4 -right-5 hidden md:block text-ak-burgundy pointer-events-none">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="6" y1="18" x2="12" y2="8" />
                  <line x1="14" y1="22" x2="20" y2="12" />
                </svg>
              </div>
            </div>

            {/* Right Flank Category Cards (Desktop / Tablet) */}
            <div className="hidden sm:flex flex-col gap-6 md:gap-8 shrink-0">
              {/* Drinks & Beverages Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <Link
                  href="/categories/drinks"
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-xl hover:scale-105 hover:border-ak-burgundy/30 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFF5F5] border border-red-100 flex items-center justify-center text-ak-burgundy group-hover:scale-110 transition-transform">
                    <CupSoda className="w-5 h-5" />
                  </div>
                  <div className="text-left font-sans leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">Drinks</span>
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">& Beverages</span>
                  </div>
                </Link>
              </motion.div>

              {/* Authentic Selection Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <Link
                  href="/shop"
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-xl hover:scale-105 hover:border-ak-burgundy/30 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F4F9F5] border border-emerald-100 flex items-center justify-center text-emerald-800 group-hover:scale-110 transition-transform">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div className="text-left font-sans leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">Authentic</span>
                    <span className="text-xs sm:text-[13px] font-bold text-ak-charcoal block">Selection</span>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Category Cards Grid (Visible only on < sm screens) */}
          <div className="grid grid-cols-2 gap-2.5 sm:hidden w-full max-w-sm mx-auto my-3 z-20">
            <Link
              href="/categories/groceries"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/95 border border-white/80 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFF5F5] flex items-center justify-center text-ak-burgundy shrink-0">
                <Soup className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[11px] font-bold text-ak-charcoal block">Asian</span>
                <span className="text-[11px] font-bold text-ak-charcoal block">Groceries</span>
              </div>
            </Link>

            <Link
              href="/categories/snacks"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/95 border border-white/80 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFF5F5] flex items-center justify-center text-ak-burgundy shrink-0">
                <Cookie className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[11px] font-bold text-ak-charcoal block">Snacks</span>
                <span className="text-[11px] font-bold text-ak-charcoal block">& Treats</span>
              </div>
            </Link>

            <Link
              href="/categories/drinks"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/95 border border-white/80 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFF5F5] flex items-center justify-center text-ak-burgundy shrink-0">
                <CupSoda className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[11px] font-bold text-ak-charcoal block">Drinks</span>
                <span className="text-[11px] font-bold text-ak-charcoal block">& Beverages</span>
              </div>
            </Link>

            <Link
              href="/shop"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/95 border border-white/80 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#F4F9F5] flex items-center justify-center text-emerald-800 shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[11px] font-bold text-ak-charcoal block">Authentic</span>
                <span className="text-[11px] font-bold text-ak-charcoal block">Selection</span>
              </div>
            </Link>
          </div>

          {/* Action Buttons: Centered directly below the central visual */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-3 sm:gap-4 my-3 sm:my-4 z-20"
          >
            <Link
              href="/shop"
              className="px-6 sm:px-8 py-3 rounded-full bg-[#181C20] text-ak-ivory text-xs sm:text-[13px] font-bold tracking-[0.18em] uppercase hover:bg-ak-burgundy hover:shadow-lg transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              <span>SHOP NOW</span>
            </Link>
            <Link
              href="/about"
              className="px-6 sm:px-8 py-3 rounded-full bg-[#FDFBF7] text-ak-charcoal text-xs sm:text-[13px] font-bold tracking-[0.18em] uppercase hover:bg-white hover:shadow-md border border-[#E8DFC9] transition-all duration-300 flex items-center gap-2 shadow-sm"
            >
              <span>ABOUT US</span>
              <ArrowRight className="w-4 h-4 text-ak-charcoal" />
            </Link>
          </motion.div>

          {/* Bottom Trust & Location Bar (3 Columns matching reference) */}
          <div className="w-full max-w-4xl mx-auto pt-3.5 border-t border-ak-charcoal/10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs z-20">
            {/* Left Column: Overlapping Avatars & 800+ Shoppers */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-ak-ivory overflow-hidden relative bg-slate-300">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-ak-ivory overflow-hidden relative bg-slate-400">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-ak-ivory overflow-hidden relative bg-slate-500">
                  <Image
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-ak-charcoal-light">
                  800+ OBERHAUSEN SHOPPERS
                </span>
              </div>
            </div>

            <div className="hidden md:block w-px h-5 bg-ak-charcoal/15" />

            {/* Center Column: Verified Physical Address */}
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-ak-charcoal font-medium">
              <MapPin className="w-3.5 h-3.5 text-ak-burgundy shrink-0" />
              <span>Buschhausener Str. 63, 46049 Oberhausen</span>
            </div>

            <div className="hidden md:block w-px h-5 bg-ak-charcoal/15" />

            {/* Right Column: Local & Reliable Service */}
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-ak-charcoal-light font-medium">
              <Truck className="w-3.5 h-3.5 text-ak-burgundy shrink-0" />
              <span>Local & Reliable Service</span>
            </div>
          </div>

          {/* Bottom Corner Indicator Dots (Preserved) */}
          <div className="absolute bottom-4 left-6 sm:left-10 flex items-center gap-2 z-30 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-ak-charcoal/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/50 border border-ak-charcoal/15" />
          </div>

        </div>
      </div>
    </section>
  );
}
