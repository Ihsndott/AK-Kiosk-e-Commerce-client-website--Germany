
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  PackageOpen,
  RotateCw,
} from "lucide-react";

const PRODUCTS_PER_PAGE = 8;

const CATEGORY_TABS = [
  { id: "all", label: "All Items" },
  { id: "groceries", label: "Asian Groceries" },
  { id: "snacks", label: "Snacks & Sweets" },
  { id: "drinks", label: "Drinks & Teas" },
];

function ProductSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white/60 border border-ak-charcoal/10 p-3 sm:p-4 animate-pulse">
      <div className="aspect-square w-full rounded-xl sm:rounded-2xl bg-ak-icy-blue/60" />

      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3 w-20 sm:w-24 bg-ak-charcoal/10 rounded-full mb-3" />
          <div className="h-4 w-3/4 bg-ak-charcoal/10 rounded-full mb-2" />
          <div className="h-3 w-1/2 bg-ak-charcoal/10 rounded-full mb-4" />
        </div>

        <div className="pt-4 mt-3 border-t border-ak-charcoal/10 flex items-center justify-between gap-2">
          <div className="h-5 w-12 sm:w-16 bg-ak-charcoal/10 rounded-full" />
          <div className="h-8 w-14 sm:w-20 bg-ak-charcoal/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [retryCount, setRetryCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsSectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const url =
          selectedCategory === "all"
            ? "/api/products"
            : `/api/products?category=${encodeURIComponent(
              selectedCategory
            )}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(
            `Failed to load products (HTTP ${res.status})`
          );
        }

        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setProducts(json.data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error(
          "[ShopPage] Error fetching products:",
          err
        );

        if (isMounted) {
          setError(
            "Unable to load products at the moment. Please check your connection and try again."
          );
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, retryCount]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") {
      return Number(a.price) - Number(b.price);
    }

    if (sortBy === "price-high") {
      return Number(b.price) - Number(a.price);
    }

    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }

    return 0;
  });

  // Pagination calculations
  const totalProducts = sortedProducts.length;

  const totalPages = Math.ceil(
    totalProducts / PRODUCTS_PER_PAGE
  );

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex =
    (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  // Reset pagination on category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Reset pagination on sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Navigate between pages
  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === safeCurrentPage
    ) {
      return;
    }

    setCurrentPage(page);

    productsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Show nearby page numbers instead of hundreds
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    const pages = new Set([
      1,
      totalPages,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
    ]);

    const validPages = [...pages]
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);

    const result = [];

    validPages.forEach((page, index) => {
      if (index > 0) {
        const previous = validPages[index - 1];

        if (page - previous > 1) {
          result.push("ellipsis-" + page);
        }
      }

      result.push(page);
    });

    return result;
  };

  return (
    <div className="min-h-screen bg-ak-pale-grey flex flex-col">

      {/* Hero Section */}
      <div className="p-3 sm:p-5 md:p-8">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-ak-icy-blue to-[#E3EDF0] border-[2px] border-ak-ivory shadow-frame overflow-hidden">

          <Navbar variant="hero-integrated" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 text-center">

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-ak-charcoal-light hover:text-ak-burgundy mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
              Full Market Catalog
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ak-charcoal tracking-tight">
              Shop Authentic Asian Goods
            </h1>

            <p className="text-sm text-ak-charcoal-muted mt-2 max-w-xl mx-auto">
              Imported instant noodles, crispy snacks,
              refreshing drinks, and pantry essentials
              from Japan, Korea, China, and Taiwan.
            </p>

          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 flex-1 w-full">

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-ak-charcoal/10">

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  handleCategoryChange(tab.id)
                }
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${selectedCategory === tab.id
                  ? "bg-ak-charcoal text-ak-ivory shadow-sm"
                  : "bg-white/70 hover:bg-white text-ak-charcoal border border-ak-charcoal/10"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">

            <span className="text-xs text-ak-charcoal-light uppercase tracking-wider font-semibold">
              Sort by:
            </span>

            <select
              value={sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value)
              }
              className="bg-white/80 border border-ak-charcoal/10 text-xs rounded-full px-3 py-1.5 text-ak-charcoal focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
            </select>

          </div>
        </div>

        {/* Products Area */}
        <div
          ref={productsSectionRef}
          id="shop-products"
          className="py-8 scroll-mt-6"
        >

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-16 text-center max-w-md mx-auto rounded-3xl bg-white/60 border border-ak-charcoal/10 p-8 shadow-sm">

              <div className="w-12 h-12 rounded-full bg-ak-burgundy/10 text-ak-burgundy mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-lg font-bold text-ak-charcoal mb-2">
                Unable to Load Products
              </h3>

              <p className="text-sm text-ak-charcoal-muted mb-6">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setRetryCount((c) => c + 1)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory transition-all shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            totalProducts === 0 && (
              <div className="py-16 text-center max-w-md mx-auto rounded-3xl bg-white/60 border border-ak-charcoal/10 p-8 shadow-sm">

                <div className="w-12 h-12 rounded-full bg-ak-icy-blue text-ak-charcoal mx-auto flex items-center justify-center mb-4">
                  <PackageOpen className="w-6 h-6" />
                </div>

                <h3 className="font-serif text-lg font-bold text-ak-charcoal mb-2">
                  No products available yet.
                </h3>

                <p className="text-sm text-ak-charcoal-muted mb-6">
                  {selectedCategory === "all"
                    ? "Our store catalog is currently empty. Please check back later."
                    : "No products currently found in this category."}
                </p>

                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange("all")
                    }
                    className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ak-charcoal hover:bg-ak-burgundy text-ak-ivory transition-all shadow-sm"
                  >
                    View All Products
                  </button>
                )}

              </div>
            )}

          {/* Product Grid */}
          {!loading &&
            !error &&
            totalProducts > 0 && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-5">

                    {/* Product Count */}
                    <p className="text-xs sm:text-sm text-ak-charcoal-muted">
                      Showing{" "}
                      <span className="font-semibold text-ak-charcoal">
                        {startIndex + 1}–
                        {Math.min(
                          startIndex + PRODUCTS_PER_PAGE,
                          totalProducts
                        )}
                      </span>{" "}
                      of {totalProducts} products
                    </p>

                    {/* Pagination Controls */}
                    <nav
                      aria-label="Product pagination"
                      className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
                    >

                      {/* Previous */}
                      <button
                        type="button"
                        onClick={() =>
                          handlePageChange(
                            safeCurrentPage - 1
                          )
                        }
                        disabled={safeCurrentPage === 1}
                        aria-label="Previous page"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-ak-charcoal/20 bg-white text-ak-charcoal hover:bg-ak-charcoal hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-ak-charcoal transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      {/* Page Numbers */}
                      {getVisiblePages().map((page) =>
                        typeof page === "string" ? (
                          <span
                            key={page}
                            className="px-1 text-ak-charcoal-muted"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() =>
                              handlePageChange(page)
                            }
                            aria-label={`Page ${page}`}
                            aria-current={
                              safeCurrentPage === page
                                ? "page"
                                : undefined
                            }
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition-all ${safeCurrentPage === page
                              ? "bg-ak-charcoal text-white shadow-md"
                              : "bg-white text-ak-charcoal border border-ak-charcoal/20 hover:bg-ak-icy-blue"
                              }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        type="button"
                        onClick={() =>
                          handlePageChange(
                            safeCurrentPage + 1
                          )
                        }
                        disabled={
                          safeCurrentPage === totalPages
                        }
                        aria-label="Next page"
                        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-ak-charcoal/20 bg-white text-ak-charcoal hover:bg-ak-charcoal hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-ak-charcoal transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>

                    </nav>

                    <p className="text-xs text-ak-charcoal-light">
                      Page {safeCurrentPage} of {totalPages}
                    </p>

                  </div>
                )}
              </>
            )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
