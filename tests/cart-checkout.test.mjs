import assert from "node:assert/strict";
import test from "node:test";
import { addOrIncrement, cartSubtotal, lineKey, removeCartItem, updateItemQuantity } from "../src/features/cart/cart-math.mjs";
import { validateCheckout } from "../src/features/checkout/validation.mjs";

const products = [{ id: "product-baggy", priceInPaise: 899900 }, { id: "product-straight", priceInPaise: 749900 }];

test("cart subtotal combines line prices and quantities", () => {
  const items = [{ productId: "product-baggy", size: "32", quantity: 2 }, { productId: "product-straight", size: "30", quantity: 1 }];
  assert.equal(cartSubtotal(items, products), 2549700);
});

test("cart quantity changes are capped and an item can be removed", () => {
  const starting = [{ productId: "product-baggy", size: "32", quantity: 1 }];
  const increased = addOrIncrement(starting, { productId: "product-baggy", size: "32", quantity: 2 });
  assert.equal(increased[0].quantity, 3);
  const capped = updateItemQuantity(increased, lineKey("product-baggy", "32"), 99);
  assert.equal(capped[0].quantity, 10);
  assert.deepEqual(removeCartItem(capped, lineKey("product-baggy", "32")), []);
});

test("checkout validation reports missing and invalid customer details", () => {
  const errors = validateCheckout({ name: "A", mobile: "123", email: "not-an-email", address: "Short", city: "X", state: "Y", pin: "12" });
  assert.deepEqual(Object.keys(errors).sort(), ["address", "city", "email", "mobile", "name", "pin", "state"]);
});

test("checkout validation accepts a complete demonstration form", () => {
  assert.deepEqual(validateCheckout({ name: "Aarav Sharma", mobile: "9876543210", email: "aarav@example.com", address: "12 Indigo Lane, Ward 4", city: "Mumbai", state: "Maharashtra", pin: "400001" }), {});
});
