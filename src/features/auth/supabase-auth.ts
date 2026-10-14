"use client";

import { createSupabaseBrowserClient } from "@/features/supabase/client";

export async function signUpWithEmail(email: string, password: string) {
  const client = createSupabaseBrowserClient();
  if (!client) throw new Error("Account sign-in is unavailable until Supabase is configured.");
  return client.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  const client = createSupabaseBrowserClient();
  if (!client) throw new Error("Account sign-in is unavailable until Supabase is configured.");
  return client.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const client = createSupabaseBrowserClient();
  if (!client) return;
  await client.auth.signOut();
}
