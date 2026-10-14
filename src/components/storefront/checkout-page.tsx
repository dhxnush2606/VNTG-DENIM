"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/features/cart/cart-context";
import { formatPrice } from "@/features/catalog/catalog-data";
import { validateCheckout } from "@/features/checkout/validation.mjs";

type CheckoutValues = { name: string; mobile: string; email: string; address: string; city: string; state: string; pin: string };
const initialValues: CheckoutValues = { name: "", mobile: "", email: "", address: "", city: "", state: "", pin: "" };

export function CheckoutPage() {
  const { items, itemCount, subtotal, clearCart, loadingProducts } = useCart();
  const [values, setValues] = useState<CheckoutValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false); const [requestError, setRequestError] = useState(""); const [submitting, setSubmitting] = useState(false); const [orderNumber, setOrderNumber] = useState("");

  if (!itemCount && !submitted) return <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-16 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.13em] text-muted">Checkout</p><h1 className="mt-3 text-4xl tracking-[-0.05em]">Your bag is empty.</h1><p className="mt-4 max-w-lg leading-7 text-muted">Add a denim style before continuing to checkout.</p><Link href="/" className="mt-8 inline-block bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.13em] text-paper">Explore fits</Link></main>;

  const update = (field: keyof CheckoutValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitted(false);
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true); setRequestError(""); setSubmitted(false);
    try { const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customer: values, items: items.map((item) => ({ productId: item.productId, size: item.size, quantity: item.quantity })) }) }); const result = await response.json(); if (!response.ok || !result.orderNumber) throw new Error(result.error || "Unable to create the order request."); setOrderNumber(result.orderNumber); setSubmitted(true); clearCart(); } catch (error) { setRequestError(error instanceof Error ? error.message : "Unable to create the order request."); } finally { setSubmitting(false); }
  };
  const fields: Array<{ field: keyof CheckoutValues; label: string; type?: string; autoComplete?: string }> = [
    { field: "name", label: "Full name", autoComplete: "name" },
    { field: "mobile", label: "Mobile number", type: "tel", autoComplete: "tel" },
    { field: "email", label: "Email address (optional)", type: "email", autoComplete: "email" },
    { field: "city", label: "City", autoComplete: "address-level2" },
    { field: "state", label: "State", autoComplete: "address-level1" },
    { field: "pin", label: "PIN code", type: "text", autoComplete: "postal-code" },
  ];

  return <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-14"><div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]"><section><p className="text-xs font-bold uppercase tracking-[0.13em] text-muted">Checkout request</p><h1 className="mt-3 text-4xl tracking-[-0.05em]">Shipping details</h1><p className="mt-4 max-w-xl leading-7 text-muted">Submitting creates a pending-payment order request only after server-side product, size, and price checks. No payment or phone verification occurs here.</p><form className="mt-10 grid gap-5" noValidate onSubmit={submit}>{fields.slice(0, 3).map((entry) => <Field key={entry.field} entry={entry} value={values[entry.field]} error={errors[entry.field]} onChange={update} />)}<div><label className="text-sm font-semibold" htmlFor="address">Shipping address</label><textarea id="address" name="address" autoComplete="street-address" className="mt-2 min-h-28 w-full border border-line bg-transparent p-3 outline-none focus:border-ink" value={values.address} onChange={(event) => update("address", event.target.value)} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "address-error" : undefined} />{errors.address && <p id="address-error" className="mt-2 text-sm text-red-800" role="alert">{errors.address}</p>}</div><div className="grid gap-5 sm:grid-cols-3">{fields.slice(3).map((entry) => <Field key={entry.field} entry={entry} value={values[entry.field]} error={errors[entry.field]} onChange={update} />)}</div><button className="mt-2 bg-ink px-5 py-4 text-xs font-bold uppercase tracking-[0.13em] text-paper disabled:bg-zinc-400" type="submit" disabled={submitting || loadingProducts}>{submitting ? "Creating request…" : "Create pending-payment request"}</button>{requestError && <p className="text-sm text-red-800" role="alert">{requestError}</p>}{submitted && <p className="border border-ink p-4 text-sm leading-6" role="status">Order request {orderNumber} was created with pending payment. No payment has been received or confirmed.</p>}</form></section><aside className="h-fit border border-line p-6 lg:sticky lg:top-8"><p className="text-xs font-bold uppercase tracking-[0.13em]">Order summary</p><p className="mt-6 flex justify-between text-sm"><span>{itemCount} item{itemCount === 1 ? "" : "s"}</span><span className="font-mono">{formatPrice(subtotal)}</span></p><div className="mt-5 border-t border-line pt-5"><p className="flex justify-between text-lg"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></p><p className="mt-3 text-xs leading-5 text-muted">Shipping and taxes are not calculated. The server recalculates the order price.</p></div><Link href="/cart" className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.13em] underline">Edit bag</Link></aside></div></main>;
}

function Field({ entry, value, error, onChange }: { entry: { field: keyof CheckoutValues; label: string; type?: string; autoComplete?: string }; value: string; error?: string; onChange: (field: keyof CheckoutValues, value: string) => void }) {
  const id = entry.field;
  return <div><label className="text-sm font-semibold" htmlFor={id}>{entry.label}</label><input id={id} name={id} type={entry.type ?? "text"} autoComplete={entry.autoComplete} className="mt-2 w-full border border-line bg-transparent p-3 outline-none focus:border-ink" value={value} onChange={(event) => onChange(entry.field, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />{error && <p id={`${id}-error`} className="mt-2 text-sm text-red-800" role="alert">{error}</p>}</div>;
}
