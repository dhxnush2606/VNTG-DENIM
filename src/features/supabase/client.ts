import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/features/supabase/database.types";

export function hasSupabaseConfiguration() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublishableKey());
}

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfiguration()) return null;
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabasePublishableKey()!);
}

export function getSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
