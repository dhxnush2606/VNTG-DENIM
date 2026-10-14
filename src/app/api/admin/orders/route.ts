import { NextResponse } from "next/server";
import { getAdminAccess } from "@/features/admin/authorization";
import { createSupabaseServerClient } from "@/features/supabase/server";

export async function GET(request: Request) {
  const access = await getAdminAccess(); if (!access.authorized) return NextResponse.json({ error: "Administrator access required." }, { status: access.configured ? 403 : 503 });
  const query = new URL(request.url).searchParams; const search = query.get("search")?.trim(); const status = query.get("status");
  const client = await createSupabaseServerClient(); let statement = client.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(100);
  if (status && isOrderStatus(status)) statement = statement.eq("status", status);
  if (search) statement = statement.or(`order_number.ilike.%${search.replaceAll("%", "")}% ,customer_name.ilike.%${search.replaceAll("%", "")}%`);
  const { data, error } = await statement;
  return error ? NextResponse.json({ error: "Unable to load orders." }, { status: 500 }) : NextResponse.json({ orders: data });
}

function isOrderStatus(value: string): value is "pending_payment" | "paid" | "processing" | "shipped" | "completed" | "cancelled" {
  return ["pending_payment", "paid", "processing", "shipped", "completed", "cancelled"].includes(value);
}
