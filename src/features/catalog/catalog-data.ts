export type FitSlug = "baggy" | "straight" | "wide-leg" | "bootcut";
export type Fit = { slug: FitSlug; name: string; description: string; image: string; imageAlt: string };
export type ProductStatus = "Draft" | "Published" | "Preorder open" | "Sold out";
export type Product = { id: string; slug: string; name: string; fit: FitSlug; fabric: string; priceInPaise: number; sizes: { size: string; available: boolean }[]; status: ProductStatus; description: string; details: string[]; images: { src: string; alt: string }[] };

export const fits: Fit[] = [
  { slug: "baggy", name: "Baggy Fit", description: "Loose and oversized through the hips and thighs, with a generous leg opening.", image: "/images/fits/baggy-fit-concept.png", imageAlt: "Generated fit study showing loose baggy raw denim with a wide leg opening" },
  { slug: "straight", name: "Straight Fit", description: "A consistent width from thigh to ankle, without a strong taper or flare.", image: "/images/fits/straight-fit-concept.png", imageAlt: "Generated fit study showing straight raw denim with a consistent leg width" },
  { slug: "wide-leg", name: "Wide Leg", description: "A visibly wide, relaxed leg from thigh to hem—broader than a classic straight fit.", image: "/images/fits/wide-leg-concept.png", imageAlt: "Generated fit study showing relaxed wide-leg raw denim from thigh to hem" },
  { slug: "bootcut", name: "Bootcut", description: "Narrower through the thigh and knee, with a deliberate flare toward the hem.", image: "/images/fits/bootcut-concept.png", imageAlt: "Generated fit study showing fitted-thigh bootcut raw denim flaring below the knee" },
];

const sampleSizes = ["30", "32", "34", "36"].map((size) => ({ size, available: true }));
// Development fallback only. Configured Supabase storefronts never show these as inventory.
export const products: Product[] = [
  { id: "sample-b01", slug: "b01-baggy-indigo", name: "B01 Baggy Indigo", fit: "baggy", fabric: "14oz raw indigo denim", priceInPaise: 429900, sizes: sampleSizes, status: "Preorder open", description: "A full-volume raw indigo fit with room to move and a pronounced wide opening.", details: ["Loose hip and thigh", "Wide leg opening", "Five-pocket construction"], images: [{ src: "/images/fits/baggy-fit-concept.png", alt: "B01 Baggy Indigo generated fit study" }] },
  { id: "sample-s01", slug: "s01-straight-indigo", name: "S01 Straight Indigo", fit: "straight", fabric: "14oz raw indigo denim", priceInPaise: 399900, sizes: sampleSizes, status: "Preorder open", description: "A balanced, true straight jean with an even line from thigh to ankle.", details: ["Consistent leg width", "No taper or flare", "Five-pocket construction"], images: [{ src: "/images/fits/straight-fit-concept.png", alt: "S01 Straight Indigo generated fit study" }] },
  { id: "sample-w01", slug: "w01-wide-indigo", name: "W01 Wide Indigo", fit: "wide-leg", fabric: "15oz raw indigo denim", priceInPaise: 449900, sizes: sampleSizes, status: "Preorder open", description: "An intentionally broad silhouette, cut generously from the thigh through the hem.", details: ["Relaxed wide leg", "Wide hem", "Five-pocket construction"], images: [{ src: "/images/fits/wide-leg-concept.png", alt: "W01 Wide Indigo generated fit study" }] },
  { id: "sample-c01", slug: "c01-bootcut-indigo", name: "C01 Bootcut Indigo", fit: "bootcut", fabric: "14oz raw indigo denim", priceInPaise: 439900, sizes: sampleSizes, status: "Preorder open", description: "A thigh-hugging bootcut with a clean, noticeable flare beginning below the knee.", details: ["Narrow thigh and knee", "Flared hem", "Five-pocket construction"], images: [{ src: "/images/fits/bootcut-concept.png", alt: "C01 Bootcut Indigo generated fit study" }] },
];

export function getFit(slug: string) { return fits.find((fit) => fit.slug === slug); }
export function getProduct(slug: string) { return products.find((product) => product.slug === slug); }
export function formatPrice(paise: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100); }
