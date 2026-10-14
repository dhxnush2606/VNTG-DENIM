import assert from "node:assert/strict";
import test from "node:test";
import { canReadOrder, validateOrderForCreation } from "../src/features/orders/order-validation.mjs";

const catalog = [
  { id: "product-1", slug: "b01-baggy-indigo", name: "B01 Baggy Indigo", priceInPaise: 429900, isActive: true, sizes: [{ size: "32", available: true }, { size: "34", available: false }] },
];

test("server order validation uses trusted price snapshots", () => {
  const result = validateOrderForCreation({ items: [{ productId: "product-1", size: "32", quantity: 2, unitPriceInPaise: 1 }] }, catalog);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.subtotalInPaise, 859800);
    assert.equal(result.items[0].unitPriceInPaise, 429900);
  }
});

test("server order validation rejects unavailable sizes and duplicate lines", () => {
  assert.equal(validateOrderForCreation({ items: [{ productId: "product-1", size: "34", quantity: 1 }] }, catalog).ok, false);
  assert.equal(validateOrderForCreation({ items: [{ productId: "product-1", size: "32", quantity: 1 }, { productId: "product-1", size: "32", quantity: 1 }] }, catalog).ok, false);
});

test("order access is limited to its owner or an administrator", () => {
  const order = { userId: "customer-1" };
  assert.equal(canReadOrder({ id: "customer-1", role: "customer" }, order), true);
  assert.equal(canReadOrder({ id: "customer-2", role: "customer" }, order), false);
  assert.equal(canReadOrder({ id: "admin-1", role: "admin" }, order), true);
  assert.equal(canReadOrder(null, order), false);
});
