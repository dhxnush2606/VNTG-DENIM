import { NextResponse } from "next/server";
import { getAdminAccess } from "@/features/admin/authorization";
import { canTransitionOrderStatus } from "@/features/admin/validation.mjs";
import { createSupabaseServerClient } from "@/features/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess(); if (!access.authorized) return NextResponse.json({ error: "Administrator access required." }, { status: access.configured ? 403 : 503 });
  const body = await request.json().catch(() => null); if (!body || typeof body.status !== "string") return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  const { id } = await params; const client = await createSupabaseServerClient();
  const { data: order, error: lookupError } = await client.from("orders").select("status").eq("id", id).single();
  if (lookupError || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (body.status === "paid") return NextResponse.json({ error: "Paid status can only be set by a verified payment webhook." }, { status: 400 });
  if (!canTransitionOrderStatus(order.status, body.status)) return NextResponse.json({ error: "That order transition is not allowed." }, { status: 400 });
  const update = { status: body.status, shipping_carrier: typeof body.shippingCarrier === "string" ? body.shippingCarrier.slice(0, 80) || null : null, tracking_number: typeof body.trackingNumber === "string" ? body.trackingNumber.slice(0, 120) || null : null };
  const { error } = await client.from("orders").update(update).eq("id", id);
  return error ? NextResponse.json({ error: "Unable to update order." }, { status: 500 }) : NextResponse.json({ ok: true });
}
