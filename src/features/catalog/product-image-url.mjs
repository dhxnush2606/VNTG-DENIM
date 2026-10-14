export function productImageUrl(projectUrl, storagePath) {
  if (typeof storagePath !== "string" || !storagePath.trim()) return null;
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  if (!projectUrl) return null;
  const path = storagePath.replace(/^product-images\//, "").replace(/^storage\/v1\/object\/public\/product-images\//, "");
  return new URL(`/storage/v1/object/public/product-images/${path.split("/").map(encodeURIComponent).join("/")}`, projectUrl).toString();
}
