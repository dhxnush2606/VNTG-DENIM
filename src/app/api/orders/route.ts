import { NextResponse } from "next/server";
import { validateOrderForCreation } from "@/features/orders/order-validation.mjs";
import { createSupabaseServerClient } from "@/features/supabase/server";
import { hasSupabaseConfiguration } from "@/features/supabase/client";

export async function POST(request: Request) {
  if (!hasSupabaseConfiguration()) return NextResponse.json({ error: "Checkout is not connected yet." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!isOrderPayload(body)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const client = await createSupabaseServerClient();
    const productIds = body.items.map((item) => item.productId);
    const [{ data: productRows, error: productsError }, { data: sizeRows, error: sizesError }] = await Promise.all([
      client.from("products").select("id, slug, name, price_in_paise, is_active").in("id", productIds).eq("status", "preorder_open"),
      client.from("product_sizes").select("product_id, size, available").in("product_id", productIds),
    ]);
    if (productsError || sizesError || !productRows || !sizeRows) throw new Error("Catalog lookup failed.");
    const trustedProducts = productRows.map((product) => ({ id: product.id, slug: product.slug, name: product.name, priceInPaise: product.price_in_paise, isActive: product.is_active, sizes: sizeRows.filter((size) => size.product_id === product.id).map((size) => ({ size: size.size, available: size.available })) }));
    const validated = validateOrderForCreation({ items: body.items }, trustedProducts);
    if (!validated.ok || !validated.items) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { data, error } = await client.rpc("create_pending_order", {
      p_customer: body.customer,
      p_items: validated.items.map((item) => ({ product_id: item.productId, size: item.size, quantity: item.quantity })),
    });
    if (error || !data?.[0]) throw new Error("Order creation failed.");
    return NextResponse.json({ orderNumber: data[0].order_number, status: data[0].status }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create the order. Please try again later." }, { status: 500 });
  }
}

type OrderPayload = { customer: { name: string; mobile: string; email: string; address: string; city: string; state: string; pin: string }; items: Array<{ productId: string; size: string; quantity: number }> };
function isOrderPayload(value: unknown): value is OrderPayload {
  if (!value || typeof value !== "object" || !("customer" in value) || !("items" in value) || !value.customer || typeof value.customer !== "object" || !Array.isArray(value.items)) return false;
  const customer = value.customer as Record<string, unknown>;
  return ["name", "mobile", "email", "address", "city", "state", "pin"].every((key) => typeof customer[key] === "string") && value.items.every((item) => item && typeof item === "object" && typeof item.productId === "string" && typeof item.size === "string" && typeof item.quantity === "number");
}
