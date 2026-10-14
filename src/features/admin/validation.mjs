const fits = new Set(["baggy", "straight", "wide-leg", "bootcut"]);
const statuses = new Set(["draft", "published", "preorder_open", "sold_out", "archived"]);
export function validateAdminProduct(input) {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid product." };
  const { slug, name, fit, description, fabric, priceInPaise, status, sizes = [], isFeatured = false, isActive = status !== "archived" } = input;
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { ok: false, error: "Use a lowercase URL slug." };
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 120) return { ok: false, error: "Enter a product name." };
  if (!fits.has(fit) || !statuses.has(status) || typeof description !== "string" || typeof fabric !== "string" || !Number.isInteger(priceInPaise) || priceInPaise < 0 || typeof isFeatured !== "boolean" || typeof isActive !== "boolean") return { ok: false, error: "Product details are invalid." };
  if (!Array.isArray(sizes) || sizes.some((size) => !size || !["28", "30", "32", "34", "36", "38", "40"].includes(size.size) || typeof size.available !== "boolean") || new Set(sizes.map((size) => size.size)).size !== sizes.length) return { ok: false, error: "Select unique supported waist sizes." };
  return { ok: true, product: { slug, name: name.trim(), fit, description: description.trim(), fabric: fabric.trim(), price_in_paise: priceInPaise, status, is_active: isActive && status !== "archived", is_featured: isFeatured }, sizes };
}

export function canTransitionOrderStatus(current, next) {
  const transitions = { pending_payment: ["cancelled"], paid: ["processing", "cancelled"], processing: ["shipped", "cancelled"], shipped: ["completed"], completed: [], cancelled: [] };
  return transitions[current]?.includes(next) ?? false;
}
