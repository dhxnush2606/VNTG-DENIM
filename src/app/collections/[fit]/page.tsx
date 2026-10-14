import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { fits, getFit } from "@/features/catalog/catalog-data";
import { getPublicCollection } from "@/features/catalog/public-catalog";

// A configured public catalogue is read from Supabase at request time.
export const instant = false;

export function generateStaticParams() {
  return fits.map((fit) => ({ fit: fit.slug }));
}

export default async function FitCollectionPage({ params }: { params: Promise<{ fit: string }> }) {
  const { fit: slug } = await params;
  const fit = getFit(slug);
  if (!fit) notFound();
  const collection = await getPublicCollection(fit.slug);
  return <><SiteHeader /><main className="px-5 py-12 sm:px-8 sm:py-16"><div className="mx-auto max-w-7xl"><Link href="/#fits" className="text-xs font-bold uppercase tracking-[0.13em] underline">← All fits</Link><p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Fit collection</p><h1 className="mt-3 text-5xl tracking-[-0.06em] sm:text-6xl">{fit.name}</h1><p className="mt-4 max-w-xl text-lg leading-8 text-muted">{fit.description}</p><p className="mt-6 text-sm text-muted">{collection.length} style{collection.length === 1 ? "" : "s"} in this fit</p><div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{collection.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div></main><SiteFooter /></>;
}
