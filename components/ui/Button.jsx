"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Button({
  children,
  href,
  variant = "primary", // primary, secondary, outline, ghost, gold
  size = "md", // sm, md, lg
  className,
  icon: Icon,
  iconPosition = "right",
  onClick,
  disabled = false,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants = {
    // Primary: deep charcoal or rich burgundy with ivory text
    primary:
      "bg-ak-charcoal text-ak-ivory hover:bg-ak-burgundy hover:shadow-lg focus:ring-ak-charcoal border border-ak-charcoal hover:border-ak-burgundy",
    burgundy:
      "bg-ak-burgundy text-ak-ivory hover:bg-ak-burgundy-hover hover:shadow-lg focus:ring-ak-burgundy border border-ak-burgundy",
    // Secondary: soft warm ivory pill with subtle border and crisp charcoal text
    secondary:
      "bg-ak-ivory text-ak-charcoal hover:bg-white hover:shadow-md border border-ak-ivory-border focus:ring-ak-charcoal",
    outline:
      "bg-transparent text-ak-charcoal border border-ak-charcoal/30 hover:border-ak-charcoal hover:bg-ak-charcoal/5 focus:ring-ak-charcoal",
    gold:
      "bg-ak-gold text-ak-charcoal font-semibold hover:bg-[#e0be7e] hover:shadow-glow-gold focus:ring-ak-gold border border-ak-gold",
    ghost:
      "bg-transparent text-ak-charcoal hover:bg-ak-charcoal/5 focus:ring-ak-charcoal",
  };

  const sizes = {
    sm: "text-xs px-4 py-2 gap-1.5",
    md: "text-xs md:text-sm px-6 py-3 gap-2",
    lg: "text-sm md:text-base px-8 py-4 gap-2.5 shadow-pill hover:shadow-pill-hover",
  };

  const content = (
    <>
      {Icon && iconPosition === "left" && (
        <Icon className={cn("w-4 h-4 transition-transform group-hover:-translate-x-0.5")} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === "right" && (
        <Icon className={cn("w-4 h-4 transition-transform group-hover:translate-x-0.5")} />
      )}
    </>
  );

  const combinedClass = cn(
    baseStyles,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    "group active:scale-[0.98]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={combinedClass} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </motion.button>
  );
}
