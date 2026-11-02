import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-clash",
  display: "swap",
});

export const metadata = {
  title: "AK Kiosk & Asian Market — Your Asian Market. One Click Away.",
  description:
    "Authentic Asian groceries, spicy Korean ramen, Japanese snacks, chilled drinks, and specialty pantry essentials located at Buschhausener Str. 63, 46049 Oberhausen, Germany.",
  keywords: [
    "Asian Market Oberhausen",
    "AK Kiosk",
    "Korean Ramen",
    "Buldak",
    "Japanese Snacks",
    "Pocky Matcha",
    "Ramune",
    "Oberhausen Grocery",
  ],
  openGraph: {
    title: "AK Kiosk & Asian Market — Oberhausen, Germany",
    description: "Explore authentic Asian groceries, snacks, and drinks. One click away.",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-ak-pale-grey text-ak-charcoal antialiased selection:bg-ak-burgundy selection:text-ak-ivory">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
