import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names safely with Tailwind
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Euros for Germany locale
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
