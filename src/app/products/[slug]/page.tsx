import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { ProductPurchaseControls } from "@/components/storefront/product-purchase-controls";
import { formatPrice, getFit } from "@/features/catalog/catalog-data";
import { getPublicProductBySlug } from "@/features/catalog/public-catalog";
import { ProductImage } from "@/components/storefront/product-image";

export const instant = false;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();
  const fit = getFit(product.fit);
  return <><SiteHeader /><main className="px-5 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-7xl"><Link href={`/collections/${product.fit}`} className="text-xs font-bold uppercase tracking-[0.13em] underline">← {fit?.name} collection</Link><div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]"><div className="grid gap-4 sm:grid-cols-2">{product.images.map((image) => <div className="relative aspect-[3/4] overflow-hidden bg-zinc-200" key={image.src}><ProductImage src={image.src} alt={image.alt} /></div>)}</div><div className="lg:sticky lg:top-8 lg:self-start"><p className="text-xs font-bold uppercase tracking-[0.13em] text-muted">{fit?.name}</p><h1 className="mt-3 text-4xl tracking-[-0.05em]">{product.name}</h1><p className="mt-3 font-mono text-lg">{formatPrice(product.priceInPaise)}</p><p className="mt-6 leading-7 text-muted">{product.description}</p>{product.details.length > 0 && <div className="mt-6"><p className="text-xs font-bold uppercase tracking-[0.13em]">Details</p><ul className="mt-3 space-y-2 text-sm text-muted">{product.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></div>}<p className="mt-8 inline-block bg-ink px-3 py-2 text-xs font-bold uppercase tracking-[0.13em] text-paper">{product.status}</p><ProductPurchaseControls productId={product.id} sizes={product.sizes} available={product.status === "Preorder open"} />{product.images[0]?.src.includes("/images/fits/") && <p className="mt-4 text-xs leading-5 text-muted">Image note: no product photography has been uploaded yet; this concept fit study is not a product photograph.</p>}</div></div></div></main><SiteFooter /></>;
}
