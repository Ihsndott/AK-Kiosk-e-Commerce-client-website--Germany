import { PRODUCTS, CATEGORIES, STORE_INFO } from "@/lib/products";

export async function getProducts(category) {
  if (category) {
    return PRODUCTS.filter((p) => p.category === category);
  }
  return PRODUCTS;
}

export async function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function getCategories() {
  return CATEGORIES;
}

export async function getStoreInfo() {
  return STORE_INFO;
}

export async function searchProducts(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q)
  );
}
