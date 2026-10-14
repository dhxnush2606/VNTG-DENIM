import { NextResponse } from "next/server";
import { getAdminAccess } from "@/features/admin/authorization";
import { createSupabaseServerClient } from "@/features/supabase/server";

async function admin() { const access = await getAdminAccess(); return access.authorized ? null : NextResponse.json({ error: access.configured ? "Administrator access required." : "Supabase is not configured." }, { status: access.configured ? 403 : 503 }); }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await admin(); if (denied) return denied; const body = await request.json().catch(() => null); const { id } = await params;
  if (!body || typeof body.storagePath !== "string" || !body.storagePath.startsWith(`products/${id}/`) || body.storagePath.length > 240) return NextResponse.json({ error: "Invalid product image path." }, { status: 400 });
  const client = await createSupabaseServerClient(); const { data: last } = await client.from("product_images").select("sort_order").eq("product_id", id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await client.from("product_images").insert({ product_id: id, storage_path: body.storagePath, alt_text: typeof body.altText === "string" ? body.altText.slice(0, 200) : "", sort_order: (last?.sort_order ?? -1) + 1 });
  return error ? NextResponse.json({ error: "Unable to save image reference. The uploaded file was kept so you can retry." }, { status: 400 }) : NextResponse.json({ ok: true }, { status: 201 });
}
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await admin(); if (denied) return denied; const body = await request.json().catch(() => null); const { id } = await params;
  if (!body || !Array.isArray(body.imageIds) || !body.imageIds.every((imageId: unknown) => typeof imageId === "string")) return NextResponse.json({ error: "Invalid image order." }, { status: 400 });
  const client = await createSupabaseServerClient(); const { data: existing, error: lookupError } = await client.from("product_images").select("id").eq("product_id", id);
  if (lookupError || existing?.length !== body.imageIds.length || !body.imageIds.every((imageId: string) => existing.some((image) => image.id === imageId))) return NextResponse.json({ error: "Image order does not match this product." }, { status: 400 });
  for (const [sort_order, imageId] of body.imageIds.entries()) { const { error } = await client.from("product_images").update({ sort_order }).eq("id", imageId).eq("product_id", id); if (error) return NextResponse.json({ error: "Unable to reorder images." }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await admin(); if (denied) return denied; const imageId = new URL(request.url).searchParams.get("imageId"); const { id } = await params; if (!imageId) return NextResponse.json({ error: "Choose an image to remove." }, { status: 400 });
  const client = await createSupabaseServerClient(); const { data: image } = await client.from("product_images").select("storage_path").eq("id", imageId).eq("product_id", id).maybeSingle(); if (!image) return NextResponse.json({ error: "Image not found." }, { status: 404 });
  const { error } = await client.from("product_images").delete().eq("id", imageId).eq("product_id", id); if (error) return NextResponse.json({ error: "Unable to remove image reference." }, { status: 500 });
  const { error: storageError } = await client.storage.from("product-images").remove([image.storage_path]);
  return storageError ? NextResponse.json({ ok: true, warning: "Image reference removed, but storage cleanup failed. Retry cleanup manually." }) : NextResponse.json({ ok: true });
}
