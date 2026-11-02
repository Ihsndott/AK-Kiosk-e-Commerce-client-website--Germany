"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  ShoppingBag,
  Flame,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";

const FALLBACK_PRODUCTS = [
  {
    id: "6ae45e524afe5bdb4c24e625",
    _id: "6ae45e524afe5bdb4c24e625",
    slug: "samyang-buldak-hot-chicken-ramen",
    name: "Samyang Buldak Hot Chicken Ramen",
    brand: "Samyang",
    category: "Groceries",
    origin: "Direct Import • South Korea",
    badge: "Korean Buldak Ramen",
    price: 1.99,
    stock: 50,
    weight: "140g",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "6ae4afa3982a096cda0d68fc",
    _id: "6ae4afa3982a096cda0d68fc",
    slug: "caramel-latte",
    name: "Caramel Latte",
    brand: "AK Kiosk Cafe",
    category: "Drinks & Teas",
    origin: "Specialty Drink • Oberhausen",
    badge: "Chilled Drinks",
    price: 4.49,
    stock: 35,
    weight: "350ml",
    image: "https://res.cloudinary.com/hjkibpkd/image/upload/v1793371911/ak-kiosk/products/yuuraz4mhpkngydt7s2s.jpg",
  },
  {
    id: "6ae4b4c3982a096cda0d68fd",
    _id: "6ae4b4c3982a096cda0d68fd",
    slug: "burfi",
    name: "Burfi",
    brand: "AK Asian Sweets",
    category: "Snacks & Sweets",
    origin: "Fresh Sweets • Handcrafted",
    badge: "Asian Sweets",
    price: 1.5,
    stock: 40,
    weight: "100g",
    image: "https://res.cloudinary.com/hjkibpkd/image/upload/v1793373375/ak-kiosk/products/k9vksjfvzhokcgpmu0az.jpg",
  },
];

export default function HeroSection() {
  const { addToCart } = useCart();
  const heroRef = useRef(null);

  // Desktop mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 140 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothMouseX, [-400, 400], [-10, 10]);
  const parallaxY = useTransform(smoothMouseY, [-400, 400], [-8, 8]);

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

  const [heroProducts, setHeroProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    async function loadHeroProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            const prods = json.data;
            const samyang = prods.find(
              (p) =>
                p.slug?.includes("samyang") ||
                p.slug?.includes("buldak") ||
                p.name?.toLowerCase().includes("buldak")
            ) || prods[0];

            const drink = prods.find(
              (p) =>
                p._id !== samyang._id &&
                (p.slug === "caramel-latte" ||
                 p.category?.toLowerCase().includes("drink") ||
                 p.slug === "lemon-mojito")
            ) || prods[1] || prods[0];

            const snack = prods.find(
              (p) =>
                p._id !== samyang._id &&
                p._id !== drink._id &&
                (p.slug === "burfi" ||
                 p.category?.toLowerCase().includes("snack") ||
                 p.slug === "citrusy-shrimp-skewers")
            ) || prods[2] || prods[0];

            setHeroProducts([
              {
                ...samyang,
                id: samyang._id,
                origin: "Direct Import • South Korea",
                badge: samyang.badge || "Korean Buldak Ramen",
                image: samyang.image || FALLBACK_PRODUCTS[0].image,
              },
              {
                ...drink,
                id: drink._id,
                origin: "Specialty Drink • Oberhausen",
                badge: drink.badge || "Chilled Drinks",
                image: drink.image || FALLBACK_PRODUCTS[1].image,
              },
              {
                ...snack,
                id: snack._id,
                origin: "Fresh Sweets • Handcrafted",
                badge: snack.badge || "Asian Sweets",
                image: snack.image || FALLBACK_PRODUCTS[2].image,
              },
            ]);
          }
        }
      } catch {
        // Keep fallback products
      }
    }
    loadHeroProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-ak-pale-grey p-3 sm:p-5 md:p-8 select-none"
    >
      {/* ============================================================ */}
      {/* LARGE ROUNDED HERO FRAME                                     */}
      {/* ============================================================ */}
      <div className="relative w-full min-h-[680px] lg:min-h-[820px] rounded-[2.2rem] sm:rounded-[3rem] md:rounded-[3.5rem] bg-gradient-to-b from-ak-icy-blue via-[#E4EFF2] to-[#D5E3E7] border-[2px] border-ak-ivory shadow-frame overflow-hidden flex flex-col justify-between">

        {/* Architectural Perspective Guidelines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <line x1="600" y1="420" x2="0" y2="120" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="600" y1="420" x2="1200" y2="120" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="600" y1="420" x2="60" y2="800" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="600" y1="420" x2="1140" y2="800" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" />
            <ellipse cx="600" cy="500" rx="420" ry="170" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 4" />
          </svg>
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-72 bg-white/50 blur-3xl rounded-full pointer-events-none" />

        {/* ------------------------------------------------------------ */}
        {/* TOP: Flush Integrated Notched Navbar                         */}
        {/* ------------------------------------------------------------ */}
        <div className="relative z-30 w-full">
          <Navbar variant="hero-integrated" />
        </div>

        {/* ------------------------------------------------------------ */}
        {/* HERO CANVAS                                                  */}
        {/* ------------------------------------------------------------ */}
        <div className="relative z-10 w-full flex-1 flex flex-col justify-between px-4 sm:px-8 lg:px-12 pt-3 pb-6 sm:pb-10">

          {/* UPPER CENTER: Pill Eyebrow & Two Main Pill CTAs */}
          <div className="flex flex-col items-center text-center mt-2 sm:mt-3 z-20">
            {/* Minimal Eyebrow & Location */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-ak-burgundy"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ak-burgundy animate-pulse" />
              <span>DISCOVER YOUR ASIAN FAVORITES</span>
              <span className="text-ak-charcoal/40">•</span>
              <span className="text-ak-charcoal/70">OBERHAUSEN, GERMANY</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-ak-charcoal tracking-tight max-w-2xl leading-tight mb-4 sm:mb-5"
            >
              Your Asian Market. One Click Away.
            </motion.h1>

            {/* Two Pill-Shaped CTA Buttons Side-by-Side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center gap-3 sm:gap-4"
            >
              <Link
                href="/shop"
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-ak-charcoal text-ak-ivory text-xs sm:text-[13px] font-semibold tracking-[0.2em] uppercase hover:bg-ak-burgundy hover:shadow-lg transition-all duration-300"
              >
                SHOP NOW
              </Link>
              <Link
                href="/categories/groceries"
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-ak-ivory text-ak-charcoal text-xs sm:text-[13px] font-semibold tracking-[0.2em] uppercase hover:bg-white hover:shadow-md border border-ak-charcoal/15 transition-all duration-300"
              >
                EXPLORE ALL
              </Link>
            </motion.div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* THREE PRODUCT IMAGES IN ONE HORIZONTAL ROW (Directly Below)  */}
          {/* ------------------------------------------------------------ */}
          <motion.div
            style={{ x: parallaxX, y: parallaxY }}
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mx-auto my-6 sm:my-8 z-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch justify-center">
              {heroProducts.map((product, idx) => (
                <div
                  key={product._id || product.id || idx}
                  className="relative group flex flex-col justify-between rounded-3xl overflow-hidden bg-white/55 p-3 sm:p-4 border border-white/80 shadow-xl backdrop-blur-sm hover:shadow-2xl hover:bg-white/70 transition-all duration-300 max-w-xs sm:max-w-sm md:max-w-none mx-auto w-full"
                >
                  {/* Grounding Shadow */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-ak-charcoal/15 blur-lg rounded-full pointer-events-none" />

                  {/* Equal-Dimension Image Container */}
                  <Link
                    href={`/product/${product.slug || product._id || product.id}`}
                    className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-ak-icy-blue/50 block"
                  >
                    <Image
                      src={product.image || FALLBACK_PRODUCTS[idx]?.image}
                      alt={product.name || "AK Kiosk Asian Product"}
                      fill
                      priority={idx === 0}
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 280px, (max-width: 1024px) 30vw, 340px"
                      onError={() => {
                        setHeroProducts((prev) => {
                          const updated = [...prev];
                          if (updated[idx]) {
                            updated[idx] = {
                              ...updated[idx],
                              image: FALLBACK_PRODUCTS[idx]?.image,
                            };
                          }
                          return updated;
                        });
                      }}
                    />

                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-ak-charcoal/85 backdrop-blur-md text-ak-ivory text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1.5 shadow-sm">
                      <Flame className="w-3 h-3 text-ak-gold fill-ak-gold shrink-0" />
                      <span className="truncate max-w-[130px]">{product.badge || "Featured"}</span>
                    </div>

                    {/* Price Label */}
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-ak-ivory/95 backdrop-blur-md text-ak-charcoal font-mono text-xs font-bold shadow-md">
                      €{Number(product.price || 1.99).toFixed(2)}
                    </div>
                  </Link>

                  {/* Quick Bar below Image */}
                  <div className="mt-2.5 px-1 flex items-center justify-between">
                    <Link
                      href={`/product/${product.slug || product._id || product.id}`}
                      className="hover:text-ak-burgundy transition-colors block min-w-0 flex-1 mr-2"
                    >
                      <span className="text-[9px] uppercase tracking-wider font-bold text-ak-burgundy block truncate">
                        {product.origin || "Direct Import • Oberhausen"}
                      </span>
                      <h3 className="text-xs font-semibold text-ak-charcoal truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-full bg-ak-charcoal text-ak-ivory hover:bg-ak-burgundy text-[10px] font-semibold tracking-wider uppercase transition-colors flex items-center gap-1 shrink-0"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>+ Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ------------------------------------------------------------ */}
          {/* BOTTOM TRUST & LOCATION FOOTER BAR                           */}
          {/* ------------------------------------------------------------ */}
          <div className="w-full max-w-5xl mx-auto mt-2 pt-3 border-t border-ak-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
            {/* Overlapping Avatar Stack with Star Ratings */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-ak-ivory overflow-hidden relative bg-slate-300">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-ak-ivory overflow-hidden relative bg-slate-400">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-ak-ivory overflow-hidden relative bg-slate-500">
                  <Image
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                    alt="Customer"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-ak-charcoal-light block">
                  800+ Oberhausen Shoppers
                </span>
              </div>
            </div>

            {/* Description Snippet */}
            <p className="text-xs text-ak-charcoal-muted font-normal text-center sm:text-left hidden lg:block">
              Authentic Asian groceries, drinks, and snacks direct to your doorstep in Oberhausen.
            </p>

            {/* Location Tag */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-ak-charcoal font-medium">
              <MapPin className="w-3.5 h-3.5 text-ak-burgundy" />
              <span>Buschhausener Str. 63, 46049 Oberhausen</span>
            </div>
          </div>

          {/* BOTTOM CORNER CONTROLS */}
          <div className="absolute bottom-4 left-6 sm:left-10 flex items-center gap-2 z-30 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-ak-charcoal/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/50 border border-ak-charcoal/15" />
          </div>

        </div>
      </div>
    </section>
  );
}
