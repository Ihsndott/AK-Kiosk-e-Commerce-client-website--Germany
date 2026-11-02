"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Upload,
  Link as LinkIcon,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowUpDown,
  Boxes,
  AlertTriangle,
  FolderPlus,
  ExternalLink,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Stock status thresholds
const LOW_STOCK_THRESHOLD = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Notifications
  const [notification, setNotification] = useState(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    sku: "",
    description: "",
    images: [],
  });

  // Direct Image URL and Upload states
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Inline Category Creation
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [catInlineError, setCatInlineError] = useState(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Load products and categories on mount
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);

      if (!prodRes.ok) throw new Error("Failed to fetch products");
      const prodJson = await prodRes.json();
      setProducts(prodJson.data || []);

      if (catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson.data || []);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError(err.message || "Failed to load catalog data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show temporary notification
  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  // 2. Computed statistics
  const stats = useMemo(() => {
    const total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const s = Number(p.stock) || 0;
      if (s === 0) outOfStock++;
      else if (s <= LOW_STOCK_THRESHOLD) lowStock++;
      else inStock++;
    });

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // 3. Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search matching (name, sku, description)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = product.name?.toLowerCase().includes(q);
        const matchSku = product.sku?.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchDesc) return false;
      }

      // Category filter
      if (categoryFilter !== "all") {
        if (product.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // Stock filter
      const stock = Number(product.stock) || 0;
      if (stockFilter === "in_stock" && stock <= LOW_STOCK_THRESHOLD) return false;
      if (stockFilter === "low_stock" && (stock <= 0 || stock > LOW_STOCK_THRESHOLD)) return false;
      if (stockFilter === "out_of_stock" && stock > 0) return false;

      return true;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // 4. Modal Open / Close handlers
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: categories.length > 0 ? categories[0].name : "",
      price: "",
      originalPrice: "",
      discountPrice: "",
      stock: "25",
      sku: "",
      description: "",
      images: [],
    });
    setDirectUrlInput("");
    setFormErrors({});
    setUploadError(null);
    setShowNewCatInput(false);
    setNewCatName("");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    // Combine product.images or fallback to [product.image]
    let imgs = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      imgs = [...product.images];
    } else if (product.image) {
      imgs = [product.image];
    }

    setFormData({
      name: product.name || "",
      category: product.category || (categories[0]?.name || ""),
      price: product.price !== undefined ? String(product.price) : "",
      originalPrice: product.originalPrice !== undefined && product.originalPrice !== null ? String(product.originalPrice) : "",
      discountPrice: product.discountPrice !== undefined && product.discountPrice !== null ? String(product.discountPrice) : "",
      stock: product.stock !== undefined ? String(product.stock) : "0",
      sku: product.sku || "",
      description: product.description || "",
      images: imgs,
    });
    setDirectUrlInput("");
    setFormErrors({});
    setUploadError(null);
    setShowNewCatInput(false);
    setNewCatName("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (savingProduct) return;
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormErrors({});
    setUploadError(null);
  };

  // 5. Image Management
  const handleAddDirectUrl = () => {
    const url = directUrlInput.trim();
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      setUploadError("Image URL must start with https://, http://, or /");
      return;
    }

    if (formData.images.length >= 3) {
      setUploadError("Maximum of 3 images allowed per product");
      return;
    }

    if (formData.images.includes(url)) {
      setUploadError("This image URL has already been added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setDirectUrlInput("");
    setUploadError(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.images.length >= 3) {
      setUploadError("Maximum of 3 images allowed per product");
      return;
    }

    // Client-side quick checks
    if (!file.type.startsWith("image/")) {
      setUploadError("Selected file is not an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image file size exceeds 5MB limit");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      const uploadedUrl = data.data?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, uploadedUrl],
        }));
        triggerNotification("success", "Image uploaded successfully to Cloudinary");
      }
    } catch (err) {
      console.warn("Upload error:", err.message);
      setUploadError(
        err.message ||
          "Upload failed. You can paste a direct image URL instead."
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
    setUploadError(null);
  };

  // 6. Inline Category Creation
  const handleCreateCategory = async () => {
    const name = newCatName.trim();
    if (!name) {
      setCatInlineError("Category name cannot be empty");
      return;
    }

    setCreatingCategory(true);
    setCatInlineError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // If already exists, just select it
          setFormData((prev) => ({ ...prev, category: name }));
          setShowNewCatInput(false);
          setNewCatName("");
          return;
        }
        throw new Error(data.message || "Failed to create category");
      }

      const created = data.data;
      setCategories((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, category: created.name }));
      setShowNewCatInput(false);
      setNewCatName("");
      triggerNotification("success", `Category "${created.name}" created`);
    } catch (err) {
      setCatInlineError(err.message || "Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  // 7. Form Submission (Add or Update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.description.trim()) errors.description = "Description is required";

    const parsedPrice = parseFloat(formData.price);
    if (formData.price === "" || isNaN(parsedPrice) || parsedPrice < 0) {
      errors.price = "Valid non-negative price is required";
    }

    const parsedStock = parseInt(formData.stock, 10);
    if (formData.stock === "" || isNaN(parsedStock) || parsedStock < 0) {
      errors.stock = "Valid non-negative stock quantity is required";
    }

    if (formData.images.length === 0) {
      errors.images = "At least one product image or URL is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSavingProduct(true);
    setFormErrors({});

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: parsedPrice,
      stock: parsedStock,
      description: formData.description.trim(),
      sku: formData.sku.trim(),
      images: formData.images,
      image: formData.images[0] || "",
    };

    if (formData.discountPrice !== "") {
      const dPrice = parseFloat(formData.discountPrice);
      if (!isNaN(dPrice) && dPrice >= 0) payload.discountPrice = dPrice;
    } else {
      payload.discountPrice = null;
    }

    if (formData.originalPrice !== "") {
      const oPrice = parseFloat(formData.originalPrice);
      if (!isNaN(oPrice) && oPrice >= 0) payload.originalPrice = oPrice;
    } else {
      payload.originalPrice = null;
    }

    try {
      const isEdit = Boolean(editingProduct);
      const url = isEdit
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to save product");
      }

      const savedProduct = json.data;

      if (isEdit) {
        setProducts((prev) =>
          prev.map((p) => (p._id === savedProduct._id ? savedProduct : p))
        );
        triggerNotification("success", `Product "${savedProduct.name}" updated successfully!`);
      } else {
        setProducts((prev) => [savedProduct, ...prev]);
        triggerNotification("success", `Product "${savedProduct.name}" created successfully!`);
      }

      closeModal();
    } catch (err) {
      console.error("Save product error:", err);
      setFormErrors({ submit: err.message || "Failed to save product" });
    } finally {
      setSavingProduct(false);
    }
  };

  // 8. Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget._id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      triggerNotification("success", `Product "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete error:", err);
      triggerNotification("error", err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-float text-xs font-medium transition-all ${
            notification.type === "success"
              ? "bg-emerald-800 text-white border border-emerald-700"
              : "bg-ak-burgundy text-white border border-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-200 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-75 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ak-charcoal/10">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-ak-charcoal-light mb-1">
            <Link href="/admin/dashboard" className="hover:text-ak-burgundy transition-colors">
              Admin
            </Link>
            <ChevronRight className="w-3 h-3 text-ak-charcoal/40" />
            <span className="text-ak-charcoal font-medium">Products</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ak-charcoal">
            Product Management
          </h1>
          <p className="text-xs text-ak-charcoal-muted mt-0.5">
            Manage your Asian grocery inventory, edit details, and track stock levels
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-ak-charcoal/15 text-ak-charcoal hover:bg-ak-ivory/60 transition-colors disabled:opacity-50"
            title="Refresh product list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-ak-burgundy" : ""}`} />
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ak-burgundy text-white text-xs font-semibold uppercase tracking-wider hover:bg-ak-burgundy-hover shadow-pill hover:shadow-pill-hover transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Products */}
        <div className="rounded-2xl bg-white border border-ak-charcoal/10 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-ak-charcoal-light uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-7 h-7 rounded-lg bg-ak-pale-grey/40 text-ak-charcoal flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-ak-charcoal font-serif">
            {loading ? "—" : stats.total}
          </div>
          <div className="text-[10px] text-ak-charcoal-muted mt-0.5">In catalog</div>
        </div>

        {/* In Stock */}
        <div className="rounded-2xl bg-white border border-ak-charcoal/10 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
              In Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-serif">
            {loading ? "—" : stats.inStock}
          </div>
          <div className="text-[10px] text-ak-charcoal-muted mt-0.5">&gt; 10 units</div>
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl bg-white border border-ak-charcoal/10 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">
              Low Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-serif">
            {loading ? "—" : stats.lowStock}
          </div>
          <div className="text-[10px] text-ak-charcoal-muted mt-0.5">1 - 10 units remaining</div>
        </div>

        {/* Out of Stock */}
        <div className="rounded-2xl bg-white border border-ak-charcoal/10 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-red-700 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-700 font-serif">
            {loading ? "—" : stats.outOfStock}
          </div>
          <div className="text-[10px] text-ak-charcoal-muted mt-0.5">0 units available</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white border border-ak-charcoal/10 p-3.5 md:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ak-charcoal-light absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, or keyword..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-ak-ivory/50 border border-ak-charcoal/15 text-xs text-ak-charcoal placeholder:text-ak-charcoal-light/70 focus:outline-hidden focus:border-ak-burgundy focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ak-charcoal-light hover:text-ak-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="relative min-w-[140px] flex-1 sm:flex-initial">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 rounded-xl bg-ak-ivory/50 border border-ak-charcoal/15 text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-ak-charcoal-light absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Stock Filter */}
            <div className="relative min-w-[130px] flex-1 sm:flex-initial">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 rounded-xl bg-ak-ivory/50 border border-ak-charcoal/15 text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock (&gt;10)</option>
                <option value="low_stock">Low Stock (1-10)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-ak-charcoal-light absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Button (if active) */}
            {(searchQuery || categoryFilter !== "all" || stockFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStockFilter("all");
                }}
                className="px-3 py-2 rounded-xl text-xs text-ak-burgundy hover:bg-ak-burgundy/10 transition-colors font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Products Table / Cards */}
      {loading ? (
        <div className="rounded-3xl bg-white border border-ak-charcoal/10 p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-ak-burgundy animate-spin mx-auto mb-3" />
          <p className="text-xs text-ak-charcoal-muted">Loading product catalog...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-white border border-red-200 p-10 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-ak-burgundy mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-ak-charcoal mb-1">
            Unable to Load Products
          </h3>
          <p className="text-xs text-ak-charcoal-muted mb-4 max-w-sm mx-auto">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 rounded-full bg-ak-burgundy text-white text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl bg-white border border-ak-charcoal/10 p-12 text-center shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-ak-burgundy/10 text-ak-burgundy mx-auto flex items-center justify-center mb-3">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-ak-charcoal mb-1">
            No Products Found
          </h3>
          <p className="text-xs text-ak-charcoal-muted mb-5 leading-relaxed">
            {products.length === 0
              ? "Your store catalog is currently empty. Click below to add your very first Asian grocery product!"
              : "No products matched your current search or filter criteria. Try clearing your filters."}
          </p>
          {products.length === 0 ? (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ak-burgundy text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStockFilter("all");
              }}
              className="px-4 py-2 rounded-full bg-ak-ivory border border-ak-charcoal/15 text-xs text-ak-charcoal font-medium hover:bg-white"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-3xl bg-white border border-ak-charcoal/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ak-charcoal/10 bg-ak-ivory/40 text-[10px] uppercase tracking-wider text-ak-charcoal-light font-bold">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ak-charcoal/5 text-xs">
                  {filteredProducts.map((product) => {
                    const stock = Number(product.stock) || 0;
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
                    const displayImage = product.image || product.images?.[0] || "/images/placeholder.jpg";

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-ak-ivory/30 transition-colors group"
                      >
                        {/* Product Name & Image */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-ak-pale-grey/30 border border-ak-charcoal/10 shrink-0 flex items-center justify-center">
                              {displayImage ? (
                                <Image
                                  src={displayImage}
                                  alt={product.name}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                  unoptimized={displayImage.startsWith("http")}
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-ak-charcoal-light" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <div className="font-semibold text-ak-charcoal truncate">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-ak-charcoal-muted truncate flex items-center gap-2 mt-0.5">
                                {product.sku && (
                                  <span className="font-mono bg-ak-ivory px-1.5 py-0.2 rounded border border-ak-charcoal/10 text-[10px]">
                                    {product.sku}
                                  </span>
                                )}
                                <span className="truncate">{product.description}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-ak-pale-grey/40 text-ak-charcoal-muted text-[11px] font-medium">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-semibold text-ak-charcoal">
                            {formatPrice(product.price)}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-[10px] text-ak-charcoal-light line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-medium text-ak-charcoal">{stock}</span>
                          <span className="text-[10px] text-ak-charcoal-light ml-1">units</span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Low Stock ({stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(product)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ak-charcoal-light hover:text-ak-burgundy hover:bg-ak-burgundy/10 transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-ak-charcoal-light hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Desktop Table Footer */}
            <div className="px-4 py-3 bg-ak-ivory/20 border-t border-ak-charcoal/10 flex items-center justify-between text-[11px] text-ak-charcoal-light">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of{" "}
                <strong>{products.length}</strong> total products
              </span>
              <span className="text-[10px]">AK Kiosk MongoDB Atlas Store Catalog</span>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
            {filteredProducts.map((product) => {
              const stock = Number(product.stock) || 0;
              const isOutOfStock = stock === 0;
              const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
              const displayImage = product.image || product.images?.[0] || "/images/placeholder.jpg";

              return (
                <div
                  key={product._id}
                  className="rounded-2xl bg-white border border-ak-charcoal/10 p-4 shadow-xs space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-ak-pale-grey/30 border border-ak-charcoal/10 shrink-0">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized={displayImage.startsWith("http")}
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-ak-charcoal-light m-auto" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-ak-charcoal text-xs leading-snug line-clamp-1">
                          {product.name}
                        </h4>
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-ak-pale-grey/40 text-ak-charcoal-muted text-[10px] font-medium">
                        {product.category}
                      </span>
                      <div className="mt-1 flex items-baseline gap-2 font-mono">
                        <span className="font-bold text-ak-charcoal text-xs">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] text-ak-charcoal-light line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-ak-charcoal/10 text-xs">
                    <div>
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-red-700">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold text-amber-700">
                          Low: {stock} left
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700">
                          In Stock ({stock})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-2.5 py-1 rounded-lg bg-ak-ivory text-ak-charcoal text-[11px] font-medium hover:bg-ak-burgundy/10 hover:text-ak-burgundy transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[11px] font-medium hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL                                                  */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ak-charcoal/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-ak-charcoal/15 shadow-float overflow-hidden my-8 max-h-[90vh] flex flex-col animate-scaleUp"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ak-charcoal/10 bg-ak-ivory/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-ak-burgundy/10 text-ak-burgundy flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ak-charcoal">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-[11px] text-ak-charcoal-muted">
                    {editingProduct
                      ? "Update existing catalog item details and stock"
                      : "Fill in the product details to add it to your Asian grocery store"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={savingProduct}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ak-charcoal-light hover:text-ak-charcoal hover:bg-ak-charcoal/5 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formErrors.submit && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors.submit}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider mb-1">
                  Product Name <span className="text-ak-burgundy">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Samyang Buldak Hot Chicken Ramen"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-ak-charcoal focus:outline-hidden transition-all ${
                    formErrors.name
                      ? "border-red-400 bg-red-50/30"
                      : "border-ak-charcoal/15 bg-ak-ivory/30 focus:border-ak-burgundy focus:bg-white"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Category Selection & Inline Creation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider">
                    Category <span className="text-ak-burgundy">*</span>
                  </label>
                  {!showNewCatInput && (
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(true)}
                      className="text-[11px] text-ak-burgundy hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add New Category</span>
                    </button>
                  )}
                </div>

                {showNewCatInput ? (
                  <div className="p-3 rounded-xl bg-ak-ivory border border-ak-charcoal/15 space-y-2">
                    <span className="text-[11px] font-semibold text-ak-charcoal block">
                      Create New Category
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Sauces & Seasonings"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-ak-charcoal/20 text-xs bg-white text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory}
                        className="px-3 py-1.5 rounded-lg bg-ak-burgundy text-white text-xs font-semibold hover:bg-ak-burgundy-hover transition-colors disabled:opacity-50"
                      >
                        {creatingCategory ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCatInput(false);
                          setNewCatName("");
                          setCatInlineError(null);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-ak-charcoal/20 text-xs text-ak-charcoal hover:bg-white"
                      >
                        Cancel
                      </button>
                    </div>
                    {catInlineError && (
                      <p className="text-[10px] text-red-600">{catInlineError}</p>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-ak-charcoal focus:outline-hidden transition-all ${
                      formErrors.category
                        ? "border-red-400 bg-red-50/30"
                        : "border-ak-charcoal/15 bg-ak-ivory/30 focus:border-ak-burgundy focus:bg-white"
                    }`}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.category && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.category}</p>
                )}
              </div>

              {/* Price, Original/Discount Price, Stock, SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider mb-1">
                    Price (€) <span className="text-ak-burgundy">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2.99"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs text-ak-charcoal focus:outline-hidden transition-all ${
                      formErrors.price
                        ? "border-red-400 bg-red-50/30"
                        : "border-ak-charcoal/15 bg-ak-ivory/30 focus:border-ak-burgundy focus:bg-white"
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Original / Discount Price */}
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider mb-1">
                    Original Price (€) <span className="text-[10px] text-ak-charcoal-light font-normal">(Optional strike-through)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="3.49"
                    className="w-full px-3.5 py-2 rounded-xl border border-ak-charcoal/15 bg-ak-ivory/30 text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy focus:bg-white transition-all"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider mb-1">
                    Stock Quantity <span className="text-ak-burgundy">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs text-ak-charcoal focus:outline-hidden transition-all ${
                      formErrors.stock
                        ? "border-red-400 bg-red-50/30"
                        : "border-ak-charcoal/15 bg-ak-ivory/30 focus:border-ak-burgundy focus:bg-white"
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.stock}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider mb-1">
                    SKU / Barcode <span className="text-[10px] text-ak-charcoal-light font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="AK-RAM-001"
                    className="w-full px-3.5 py-2 rounded-xl border border-ak-charcoal/15 bg-ak-ivory/30 text-xs text-ak-charcoal font-mono focus:outline-hidden focus:border-ak-burgundy focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider mb-1">
                  Description <span className="text-ak-burgundy">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of taste, origin, packaging, and cooking instructions..."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs text-ak-charcoal focus:outline-hidden transition-all ${
                    formErrors.description
                      ? "border-red-400 bg-red-50/30"
                      : "border-ak-charcoal/15 bg-ak-ivory/30 focus:border-ak-burgundy focus:bg-white"
                  }`}
                />
                {formErrors.description && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Product Images (Cloudinary + Direct URL) */}
              <div className="space-y-3 pt-2 border-t border-ak-charcoal/10">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-ak-charcoal uppercase tracking-wider">
                    Product Images <span className="text-ak-burgundy">*</span>
                  </label>
                  <span className="text-[11px] text-ak-charcoal-light">
                    {formData.images.length}/3 images
                  </span>
                </div>

                {/* Upload or Direct URL Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cloudinary File Upload */}
                  <div className="p-3 rounded-2xl bg-ak-ivory/50 border border-ak-charcoal/15 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-ak-charcoal flex items-center gap-1.5 mb-1">
                        <Upload className="w-3.5 h-3.5 text-ak-burgundy" />
                        Upload File
                      </span>
                      <p className="text-[10px] text-ak-charcoal-muted leading-tight">
                        Upload to Cloudinary (JPEG, PNG, WEBP, max 5MB)
                      </p>
                    </div>

                    <div className="mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileUpload}
                        disabled={uploadingImage || formData.images.length >= 3}
                        className="hidden"
                        id="cloudinary-upload-input"
                      />
                      <label
                        htmlFor="cloudinary-upload-input"
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-ak-charcoal/20 bg-white transition-all cursor-pointer ${
                          uploadingImage || formData.images.length >= 3
                            ? "opacity-50 pointer-events-none"
                            : "hover:border-ak-burgundy hover:text-ak-burgundy"
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-ak-burgundy" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose Image</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Direct Image URL */}
                  <div className="p-3 rounded-2xl bg-ak-ivory/50 border border-ak-charcoal/15 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-ak-charcoal flex items-center gap-1.5 mb-1">
                        <LinkIcon className="w-3.5 h-3.5 text-ak-burgundy" />
                        Direct URL Entry
                      </span>
                      <p className="text-[10px] text-ak-charcoal-muted leading-tight">
                        Paste external image URL or local path
                      </p>
                    </div>

                    <div className="mt-3 flex gap-1.5">
                      <input
                        type="url"
                        value={directUrlInput}
                        onChange={(e) => setDirectUrlInput(e.target.value)}
                        placeholder="https://images.unsplash..."
                        disabled={formData.images.length >= 3}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-ak-charcoal/20 bg-white text-xs text-ak-charcoal focus:outline-hidden focus:border-ak-burgundy disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handleAddDirectUrl}
                        disabled={!directUrlInput.trim() || formData.images.length >= 3}
                        className="px-3 py-1.5 rounded-lg bg-ak-charcoal text-white text-xs font-semibold hover:bg-ak-burgundy transition-colors disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {formErrors.images && (
                  <p className="text-[11px] text-red-600">{formErrors.images}</p>
                )}

                {/* Previews of uploaded / added images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-2xl border border-ak-charcoal/15 overflow-hidden aspect-square bg-ak-pale-grey/20 group"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Product thumbnail ${idx + 1}`}
                          fill
                          sizes="150px"
                          className="object-cover"
                          unoptimized={imgUrl.startsWith("http")}
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-ak-burgundy text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ak-charcoal/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-xs"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-ak-charcoal/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={savingProduct}
                  className="px-4 py-2 rounded-full border border-ak-charcoal/20 text-xs font-semibold text-ak-charcoal hover:bg-ak-ivory transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-ak-burgundy text-white text-xs font-semibold uppercase tracking-wider hover:bg-ak-burgundy-hover shadow-pill hover:shadow-pill-hover transition-all disabled:opacity-50"
                >
                  {savingProduct ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? "Update Product" : "Save Product"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG                                                */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ak-charcoal/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-ak-charcoal/15 p-6 shadow-float space-y-4 animate-scaleUp"
            role="alertdialog"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-ak-charcoal">
                Delete Product?
              </h3>
              <p className="text-xs text-ak-charcoal-muted leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-ak-charcoal">
                  &ldquo;{deleteTarget.name}&rdquo;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-full border border-ak-charcoal/20 text-xs font-semibold text-ak-charcoal hover:bg-ak-ivory transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-red-700 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-800 transition-colors shadow-pill disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
