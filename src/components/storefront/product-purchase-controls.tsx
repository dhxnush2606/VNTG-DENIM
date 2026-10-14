"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart-context";

export function ProductPurchaseControls({ productId, sizes, available }: { productId: string; sizes: { size: string; available: boolean }[]; available: boolean }) {
  const [size, setSize] = useState("");
  const [error, setError] = useState("");
  const { addItem } = useCart();
  const router = useRouter();
  const add = (buyNow: boolean) => { if (!size) { setError("Select an available waist size before continuing."); return; } addItem({ productId, size, quantity: 1 }); setError(""); if (buyNow) router.push("/checkout"); };
  const canPurchase = available && sizes.some((option) => option.available);
  return <div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.13em]">Available waist sizes</p>{sizes.length ? <div className="mt-3 flex flex-wrap gap-2">{sizes.map((option) => <button className={`min-w-11 border px-3 py-2 text-center text-sm disabled:cursor-not-allowed disabled:border-line disabled:text-muted ${size === option.size ? "border-ink bg-ink text-paper" : "border-line"}`} onClick={() => { setSize(option.size); setError(""); }} type="button" key={option.size} disabled={!option.available || !available} aria-pressed={size === option.size} aria-label={`Size ${option.size}${option.available ? "" : ", out of stock"}`}>{option.size}{!option.available && <span className="sr-only"> out of stock</span>}</button>)}</div> : <p className="mt-3 text-sm text-muted">No sizes currently available.</p>}{error && <p className="mt-3 text-sm text-red-800" role="alert">{error}</p>}<div className="mt-6 grid gap-3 sm:grid-cols-2"><button className="border border-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.13em] disabled:cursor-not-allowed disabled:border-line disabled:text-muted" type="button" disabled={!canPurchase} onClick={() => add(false)}>Add to bag</button><button className="bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.13em] text-paper disabled:cursor-not-allowed disabled:bg-zinc-400" type="button" disabled={!canPurchase} onClick={() => add(true)}>Buy now</button></div></div>;
}
