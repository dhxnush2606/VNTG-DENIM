"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/cart-context";

export function CartLink() { const { itemCount } = useCart(); return <Link href="/cart" aria-label={`Shopping bag, ${itemCount} items`}>Bag <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-paper">{itemCount}</span></Link>; }
