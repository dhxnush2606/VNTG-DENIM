import Link from "next/link";
import { formatPrice, getFit, type Product } from "@/features/catalog/catalog-data";
import { ProductImage } from "@/components/storefront/product-image";

export function ProductCard({ product }: { product: Product }) {
  const fit = getFit(product.fit);
  const image = product.images[0]; return <article><Link href={`/products/${product.slug}`} className="group block"><div className="relative aspect-[3/4] overflow-hidden bg-zinc-200"><ProductImage src={image?.src} alt={image?.alt ?? `${product.name} product image`} className="transition-transform duration-500 group-hover:scale-[1.02]" /><span className="absolute bottom-3 left-3 bg-paper px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">{product.status}</span></div><div className="flex items-start justify-between gap-3 pt-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted">{fit?.name}</p><h3 className="mt-1 font-semibold">{product.name}</h3><p className="mt-1 text-sm text-muted">{product.fabric}</p></div><p className="font-mono text-sm">{formatPrice(product.priceInPaise)}</p></div></Link><p className="mt-3 text-xs text-muted">Sizes {product.sizes.filter((size) => size.available).map((size) => size.size).join(" · ") || "Unavailable"}</p></article>;
}
