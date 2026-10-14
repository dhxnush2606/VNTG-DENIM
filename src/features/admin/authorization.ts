import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { hasSupabaseConfiguration } from "@/features/supabase/client";
import { createSupabaseServerClient } from "@/features/supabase/server";

export type AdminAccess = { configured: boolean; authorized: boolean; reason?: "signed_out" | "forbidden" };

export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  if (!hasSupabaseConfiguration()) return { configured: false, authorized: false };
  // Supabase Auth reads the current time while validating a session. Defer this
  // admin-only check until an actual request rather than the static prerender.
  await connection();
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { configured: true, authorized: false, reason: "signed_out" };
  const { data: profile } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === "admin" ? { configured: true, authorized: true } : { configured: true, authorized: false, reason: "forbidden" };
});
