import "server-only";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { fits, getProduct, products, type FitSlug, type Product, type ProductStatus } from "@/features/catalog/catalog-data";
import type { Database } from "@/features/supabase/database.types";
import { getSupabasePublishableKey, hasSupabaseConfiguration } from "@/features/supabase/client";
import { productImageUrl } from "@/features/catalog/product-image-url.mjs";

type DatabaseProduct = { id: string; slug: string; name: string; fit: string; fabric: string; description: string; price_in_paise: number; status: string; product_images: Array<{ storage_path: string; alt_text: string; sort_order: number }> | null; product_sizes: Array<{ size: string; available: boolean }> | null };
const fields = "id, slug, name, fit, fabric, description, price_in_paise, status, product_images(storage_path, alt_text, sort_order), product_sizes(size, available)";

function publicClient() { return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabasePublishableKey()!, { auth: { persistSession: false, autoRefreshToken: false } }); }
async function queryProducts(configure: (query: ReturnType<ReturnType<typeof publicClient>["from"]>) => unknown): Promise<Product[]> {
  await connection();
  const query = publicClient().from("products").select(fields);
  const { data, error } = await (configure(query) as typeof query);
  if (error) throw new Error("Unable to load products.");
  return (data as unknown as DatabaseProduct[]).map(toStorefrontProduct);
}

export async function getPublicCollection(fit: FitSlug) { return hasSupabaseConfiguration() ? queryProducts((query) => query.eq("fit", fit).order("created_at", { ascending: false })) : products.filter((product) => product.fit === fit); }
export async function getPublicFeaturedProducts() { return hasSupabaseConfiguration() ? queryProducts((query) => query.eq("is_featured", true).order("created_at", { ascending: false })) : products; }
export async function getPublicProductBySlug(slug: string) {
  if (!hasSupabaseConfiguration()) return getProduct(slug);
  const productsBySlug = await queryProducts((query) => query.eq("slug", slug).limit(1));
  return productsBySlug[0];
}

function toStorefrontProduct(product: DatabaseProduct): Product {
  const fit = product.fit as FitSlug;
  const fallback = fits.find((candidate) => candidate.slug === fit)!;
  const images = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order).map((image) => ({ src: productImageUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, image.storage_path), alt: image.alt_text || `${product.name} product image` })).filter((image): image is { src: string; alt: string } => Boolean(image.src));
  const statuses: Record<string, ProductStatus> = { draft: "Draft", published: "Published", preorder_open: "Preorder open", sold_out: "Sold out" };
  return { id: product.id, slug: product.slug, name: product.name, fit, fabric: product.fabric, priceInPaise: product.price_in_paise, sizes: product.product_sizes ?? [], status: statuses[product.status] ?? "Sold out", description: product.description, details: [], images: images.length ? images : [{ src: fallback.image, alt: `${product.name}: no product image uploaded; concept fit study shown instead` }] };
}

