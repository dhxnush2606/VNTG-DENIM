"use client";

import { useState } from "react";

export function ProductImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`flex items-end bg-zinc-100 p-4 text-xs uppercase tracking-[0.12em] text-zinc-500 ${className}`} role="img" aria-label="Product image unavailable">Image unavailable</div>;
  return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} onError={() => setFailed(true)} />;
}
