import { NextResponse } from "next/server";
import { getAdminAccess } from "@/features/admin/authorization";
import { validateAdminProduct } from "@/features/admin/validation.mjs";
import { createSupabaseServerClient } from "@/features/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess(); if (!access.authorized) return NextResponse.json({ error: "Administrator access required." }, { status: access.configured ? 403 : 503 });
  const parsed = validateAdminProduct(await request.json().catch(() => null)); if (!parsed.ok || !parsed.product) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { id } = await params; const client = await createSupabaseServerClient();
  const { error } = await client.from("products").update(parsed.product).eq("id", id);
  if (error) return NextResponse.json({ error: "Unable to update product." }, { status: 400 });
  const { error: deleteError } = await client.from("product_sizes").delete().eq("product_id", id);
  if (deleteError) return NextResponse.json({ error: "Product updated, but sizes need attention." }, { status: 500 });
  if (parsed.sizes.length) { const { error: sizeError } = await client.from("product_sizes").insert(parsed.sizes.map((size) => ({ product_id: id, ...size }))); if (sizeError) return NextResponse.json({ error: "Product updated, but sizes need attention." }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
