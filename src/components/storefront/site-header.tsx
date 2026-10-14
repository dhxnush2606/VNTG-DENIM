import Link from "next/link";
import { CartLink } from "@/components/storefront/cart-link";

const links = ["Ready Made", "Customization", "Upcoming Drops", "About", "Contact"];

export function SiteHeader() {
  return <header className="border-b border-line bg-paper"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><Link className="text-lg font-bold tracking-[0.18em]" href="/" aria-label="VNTG DENIM home">VNTG<span className="font-light"> DENIM</span></Link><nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.12em] lg:flex" aria-label="Main navigation">{links.map((link) => <a key={link} href={`#${link.toLowerCase().replaceAll(" ", "-")}`}>{link}</a>)}</nav><div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.12em]"><Link href="/account">Account</Link><CartLink /></div></div></header>;
}
