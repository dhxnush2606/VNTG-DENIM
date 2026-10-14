export function rupeesToPaise(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const rupees = Number(value);
  return Number.isSafeInteger(rupees) && rupees >= 0 && rupees <= Math.floor(Number.MAX_SAFE_INTEGER / 100) ? rupees * 100 : null;
}

export function paiseToRupees(value) {
  return Number.isSafeInteger(value) && value >= 0 && value % 100 === 0 ? String(value / 100) : null;
}
