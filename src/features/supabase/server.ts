import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/features/supabase/database.types";
import { getSupabasePublishableKey, hasSupabaseConfiguration } from "@/features/supabase/client";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfiguration()) throw new Error("Supabase is not configured.");
  const cookieStore = await cookies();
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabasePublishableKey()!, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(values) { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
    },
  });
}
