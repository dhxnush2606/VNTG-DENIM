"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/features/auth/supabase-auth";
import { hasSupabaseConfiguration } from "@/features/supabase/client";

export function AccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const configured = hasSupabaseConfiguration();
  const submit = async (mode: "sign-in" | "sign-up") => {
    setError(""); setMessage("");
    try {
      const result = mode === "sign-in" ? await signInWithEmail(email, password) : await signUpWithEmail(email, password);
      if (result.error) throw result.error;
      setMessage(mode === "sign-up" ? "Account request sent. Check your email if confirmation is enabled in Supabase." : "You are signed in on this browser.");
      setPassword("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to continue."); }
  };
  return <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12 sm:px-8 sm:py-16"><p className="text-xs font-bold uppercase tracking-[0.13em] text-muted">Optional account</p><h1 className="mt-3 text-4xl tracking-[-0.05em]">Sign in or register</h1><p className="mt-4 leading-7 text-muted">An account is optional. Guest checkout remains available. VNTG DENIM never stores your password; when configured, Supabase Auth handles it.</p>{!configured ? <p className="mt-8 border border-line p-4 text-sm leading-6">Account sign-in is not connected yet. Add the public Supabase values in <code>.env.local</code> after completing the manual setup.</p> : <form className="mt-8 grid gap-5" onSubmit={(event) => { event.preventDefault(); void submit("sign-in"); }}><div><label className="text-sm font-semibold" htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required className="mt-2 w-full border border-line bg-transparent p-3 outline-none focus:border-ink" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><label className="text-sm font-semibold" htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required minLength={8} className="mt-2 w-full border border-line bg-transparent p-3 outline-none focus:border-ink" value={password} onChange={(event) => setPassword(event.target.value)} /></div><div className="grid gap-3 sm:grid-cols-2"><button className="border border-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.13em]" type="submit">Sign in</button><button className="bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.13em] text-paper" type="button" onClick={() => void submit("sign-up")}>Create account</button></div>{error && <p className="text-sm text-red-800" role="alert">{error}</p>}{message && <p className="text-sm" role="status">{message}</p>}</form>}</main>;
}
