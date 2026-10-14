export function lineKey(productId, size) {
  return `${productId}:${size}`;
}

export function clampQuantity(quantity) {
  return Math.max(1, Math.min(10, Number.isFinite(quantity) ? Math.floor(quantity) : 1));
}

export function cartSubtotal(items, products) {
  return items.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? total + product.priceInPaise * item.quantity : total;
  }, 0);
}

export function addOrIncrement(items, item) {
  const key = lineKey(item.productId, item.size);
  const existing = items.find((candidate) => lineKey(candidate.productId, candidate.size) === key);
  if (!existing) return [...items, { ...item, quantity: clampQuantity(item.quantity) }];
  return items.map((candidate) => lineKey(candidate.productId, candidate.size) === key
    ? { ...candidate, quantity: clampQuantity(candidate.quantity + item.quantity) }
    : candidate);
}

export function updateItemQuantity(items, itemKey, quantity) {
  return items.map((item) => lineKey(item.productId, item.size) === itemKey
    ? { ...item, quantity: clampQuantity(quantity) }
    : item);
}

export function removeCartItem(items, itemKey) {
  return items.filter((item) => lineKey(item.productId, item.size) !== itemKey);
}
