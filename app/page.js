import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import Bestsellers from "@/components/home/Bestsellers";
import PromotionalBanner from "@/components/home/PromotionalBanner";
import NewArrivals from "@/components/home/NewArrivals";
import StoreLocation from "@/components/home/StoreLocation";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ak-pale-grey flex flex-col">
      {/* Hero Section with Integrated Centered-Logo Navbar */}
      <HeroSection />

      {/* Main Showcase & Shopping Sections */}
      <CategorySection />
      <Bestsellers />
      <PromotionalBanner />
      <NewArrivals />
      <StoreLocation />

      {/* Footer */}
      <Footer />
    </main>
  );
}
