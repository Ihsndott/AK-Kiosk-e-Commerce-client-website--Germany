import Link from "next/link";
import { ArrowLeft, ShoppingBag, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col justify-between">
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">
          <Navbar variant="hero-integrated" />

          <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
              Page Not Found • 404
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight mb-4">
              Item or Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-ak-charcoal-muted leading-relaxed mb-8 max-w-md mx-auto">
              The product or page you are looking for may have been removed, had its name changed, or is temporarily out of stock in our Oberhausen market.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-ak-charcoal text-ak-ivory text-xs uppercase tracking-wider font-semibold hover:bg-ak-burgundy transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Shop Catalog</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-ak-charcoal/20 bg-white/60 text-ak-charcoal text-xs uppercase tracking-wider font-semibold hover:bg-white transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

