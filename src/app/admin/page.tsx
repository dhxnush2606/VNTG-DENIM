import Link from "next/link";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminAccess } from "@/features/admin/authorization";

// This page must read the authenticated Supabase session at request time.
export const instant = false;

export default async function AdminPage() {
  const access = await getAdminAccess();
  if (access.authorized) return <AdminDashboard />;
  return <main className="min-h-screen bg-zinc-100 p-6 text-ink sm:p-10"><div className="mx-auto max-w-2xl border border-line bg-paper p-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-muted">VNTG DENIM / Secure operations</p><h1 className="mt-3 text-3xl tracking-[-.05em]">Admin access required</h1>{!access.configured ? <p className="mt-4 leading-7 text-muted">Supabase has not been configured. Add the public project URL and anon key to <code>.env.local</code>, then apply the Phase 5 and Phase 6 migrations. This dashboard does not use a fallback password.</p> : access.reason === "signed_out" ? <p className="mt-4 leading-7 text-muted">Sign in with an account that has been manually granted the administrator role. Registration creates customer accounts only.</p> : <p className="mt-4 leading-7 text-muted">Your account is not authorized to manage this store. Ask the trusted project owner to assign the <code>admin</code> role in Supabase.</p>}<Link className="mt-7 inline-block bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-paper" href="/account">Go to account</Link></div></main>;
}
