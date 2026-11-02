import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

/**
 * Generates dynamic SEO metadata (page title, description, and OpenGraph tags)
 * based on the requested product from MongoDB.
 */
export async function generateMetadata({ params }) {
  const { slug } = params;
  if (!slug) return { title: "Product | AK Kiosk & Asian Market" };

  try {
    await connectToDatabase();
    const normalizedSlug = slug.toLowerCase();
    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const query = isObjectId ? { $or: [{ slug: normalizedSlug }, { _id: slug }] } : { slug: normalizedSlug };
    const product = await Product.findOne(query).lean();

    if (!product) {
      return {
        title: "Product Not Found | AK Kiosk & Asian Market",
        description: "The requested grocery or snack item could not be found in our catalog.",
      };
    }

    const priceFormatted = `€${Number(product.price).toFixed(2)}`;
    return {
      title: `${product.name} (${priceFormatted}) | AK Kiosk & Asian Market`,
      description: (product.description || "").slice(0, 160),
      openGraph: {
        title: `${product.name} | AK Kiosk & Asian Market`,
        description: (product.description || "").slice(0, 160),
        images: product.images?.length > 0 ? product.images : [product.image],
      },
    };
  } catch {
    return {
      title: "Product Details | AK Kiosk & Asian Market",
    };
  }
}

/**
 * Server-rendered product detail route.
 * Queries MongoDB Atlas directly for the product by slug or _id.
 * Invokes notFound() if the item does not exist or has been deleted.
 */
export default async function ProductDetailPage({ params }) {
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  await connectToDatabase();

  const normalizedSlug = slug.toLowerCase();
  const isObjectId = mongoose.Types.ObjectId.isValid(slug);
  const query = isObjectId ? { $or: [{ slug: normalizedSlug }, { _id: slug }] } : { slug: normalizedSlug };
  const product = await Product.findOne(query).lean();

  if (!product) {
    notFound();
  }

  // Fetch related products (prefer same category, exclude current product)
  const currentId = product._id;
  let relatedProducts = [];

  if (product.category) {
    relatedProducts = await Product.find({
      _id: { $ne: currentId },
      category: product.category,
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
  }

  // If fewer than 4 in same category, supplement with other catalog products
  if (relatedProducts.length < 4) {
    const excludedIds = [currentId, ...relatedProducts.map((p) => p._id)];
    const additional = await Product.find({
      _id: { $nin: excludedIds },
    })
      .sort({ createdAt: -1 })
      .limit(4 - relatedProducts.length)
      .lean();
    relatedProducts = [...relatedProducts, ...additional];
  }

  // Serialize Mongoose ObjectIds and Dates for client hydration
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductDetailClient
      product={serializedProduct}
      relatedProducts={serializedRelated}
    />
  );
}
