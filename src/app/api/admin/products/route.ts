import { NextResponse } from "next/server";
import { getAdminAccess } from "@/features/admin/authorization";
import { validateAdminProduct } from "@/features/admin/validation.mjs";
import { createSupabaseServerClient } from "@/features/supabase/server";

async function guard() { const access = await getAdminAccess(); return access.authorized ? null : NextResponse.json({ error: access.configured ? "Administrator access required." : "Supabase is not configured." }, { status: access.configured ? 403 : 503 }); }

export async function GET() {
  const denied = await guard(); if (denied) return denied;
  const client = await createSupabaseServerClient();
  const { data, error } = await client.from("products").select("*, product_images(*), product_sizes(*)").order("updated_at", { ascending: false });
  return error ? NextResponse.json({ error: "Unable to load products." }, { status: 500 }) : NextResponse.json({ products: data });
}

export async function POST(request: Request) {
  const denied = await guard(); if (denied) return denied;
  const parsed = validateAdminProduct(await request.json().catch(() => null));
  if (!parsed.ok || !parsed.product) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const client = await createSupabaseServerClient();
  const { data, error } = await client.from("products").insert(parsed.product).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Unable to create product." }, { status: 400 });
  if (parsed.sizes.length) { const { error: sizeError } = await client.from("product_sizes").insert(parsed.sizes.map((size) => ({ product_id: data.id, ...size }))); if (sizeError) return NextResponse.json({ error: "Product created, but sizes need attention." }, { status: 500 }); }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
