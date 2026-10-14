"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addOrIncrement, cartSubtotal, clampQuantity, removeCartItem, updateItemQuantity } from "@/features/cart/cart-math.mjs";
import { products as samples, type Product } from "@/features/catalog/catalog-data";
import { createSupabaseBrowserClient, hasSupabaseConfiguration } from "@/features/supabase/client";
import { productImageUrl } from "@/features/catalog/product-image-url.mjs";

export type CartItem = { productId: string; size: string; quantity: number };
type CartContextValue = { items: CartItem[]; products: Product[]; itemCount: number; subtotal: number; loadingProducts: boolean; addItem: (item: CartItem) => void; setQuantity: (key: string, quantity: number) => void; removeItem: (key: string) => void; clearCart: () => void; };
const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "vntg-denim-cart-v2";
function isCartItem(value: unknown): value is CartItem { return typeof value === "object" && value !== null && "productId" in value && "size" in value && "quantity" in value && typeof (value as CartItem).productId === "string" && typeof (value as CartItem).size === "string" && typeof (value as CartItem).quantity === "number"; }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]); const [products, setProducts] = useState<Product[]>([]); const [ready, setReady] = useState(false); const [loadingProducts, setLoadingProducts] = useState(false);
  useEffect(() => { try { const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]"); if (Array.isArray(saved)) setItems(saved.filter(isCartItem).map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))); } finally { setReady(true); } }, []);
  useEffect(() => { if (ready) window.localStorage.setItem(storageKey, JSON.stringify(items)); }, [items, ready]);
  useEffect(() => { if (!ready) return; const ids = [...new Set(items.map((item) => item.productId))]; if (!ids.length) { setProducts([]); return; }
    if (!hasSupabaseConfiguration()) { const valid = samples.filter((product) => ids.includes(product.id)); setProducts(valid); setItems((current) => current.filter((item) => valid.some((product) => product.id === item.productId && product.sizes.some((size) => size.size === item.size && size.available)))); return; }
    const client = createSupabaseBrowserClient(); if (!client) return; setLoadingProducts(true);
    void Promise.resolve(client.from("products").select("id, slug, name, fit, fabric, description, price_in_paise, status, product_images(storage_path, alt_text, sort_order), product_sizes(size, available)").in("id", ids)).then(({ data }) => {
      const mapped = ((data ?? []) as unknown as Array<any>).map((row) => ({ id: row.id, slug: row.slug, name: row.name, fit: row.fit as Product["fit"], fabric: row.fabric, description: row.description, priceInPaise: row.price_in_paise, status: row.status === "preorder_open" ? "Preorder open" : row.status === "published" ? "Published" : row.status === "draft" ? "Draft" : "Sold out", details: [], sizes: (row.product_sizes ?? []).map((size: { size: string; available: boolean }) => ({ size: size.size, available: size.available })), images: (row.product_images ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((image: { storage_path: string; alt_text: string }) => ({ src: productImageUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, image.storage_path), alt: image.alt_text || `${row.name} product image` })).filter((image: { src: string | null }) => Boolean(image.src)) })) as Product[];
      setProducts(mapped); setItems((current) => current.filter((item) => mapped.some((product) => product.id === item.productId && product.status === "Preorder open" && product.sizes.some((size) => size.size === item.size && size.available))));
    }).finally(() => setLoadingProducts(false));
  }, [ready, items.map((item) => `${item.productId}:${item.size}`).join("|")]);
  const value = useMemo<CartContextValue>(() => ({ items, products, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: cartSubtotal(items, products), loadingProducts, addItem: (item) => setItems((current) => addOrIncrement(current, item)), setQuantity: (key, quantity) => setItems((current) => updateItemQuantity(current, key, quantity)), removeItem: (key) => setItems((current) => removeCartItem(current, key)), clearCart: () => setItems([]) }), [items, products, loadingProducts]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }
