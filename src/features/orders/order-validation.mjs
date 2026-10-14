/** @typedef {{ id: string, slug: string, name: string, priceInPaise: number, isActive: boolean, sizes: Array<{ size: string, available: boolean }> }} TrustedProduct */

/**
 * Converts untrusted cart identifiers into server-calculated immutable price snapshots.
 * Browser price, subtotal, and availability claims are intentionally not accepted.
 * @param {{ items?: unknown }} input
 * @param {TrustedProduct[]} products
 */
export function validateOrderForCreation(input, products) {
  if (!input || !Array.isArray(input.items) || input.items.length === 0 || input.items.length > 20) return { ok: false, error: "A cart must contain between 1 and 20 items." };
  const seen = new Set();
  const items = [];
  for (const item of input.items) {
    if (!item || typeof item !== "object" || typeof item.productId !== "string" || typeof item.size !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) return { ok: false, error: "Cart items are invalid." };
    const key = `${item.productId}:${item.size}`;
    if (seen.has(key)) return { ok: false, error: "Duplicate cart items are not allowed." };
    seen.add(key);
    const product = products.find((candidate) => candidate.id === item.productId);
    const size = product?.sizes.find((candidate) => candidate.size === item.size);
    if (!product || !product.isActive || !size?.available) return { ok: false, error: "One or more selected items are unavailable." };
    items.push({ productId: product.id, productSlug: product.slug, productName: product.name, size: size.size, quantity: item.quantity, unitPriceInPaise: product.priceInPaise, lineTotalInPaise: product.priceInPaise * item.quantity });
  }
  return { ok: true, items, subtotalInPaise: items.reduce((total, item) => total + item.lineTotalInPaise, 0) };
}

export function canReadOrder(viewer, order) {
  return Boolean(viewer && (viewer.role === "admin" || (viewer.id && viewer.id === order.userId)));
}
