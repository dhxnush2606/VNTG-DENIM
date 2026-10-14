import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionOrderStatus, validateAdminProduct } from "../src/features/admin/validation.mjs";
import { paiseToRupees, rupeesToPaise } from "../src/features/catalog/price.mjs";
import { productImageUrl } from "../src/features/catalog/product-image-url.mjs";

const product = { slug: "n01-new-indigo", name: "N01 New Indigo", fit: "baggy", description: "A valid denim product.", fabric: "14oz raw denim", priceInPaise: 400000, status: "draft", sizes: [{ size: "32", available: true }] };
test("admin product validation accepts only valid store data", () => { assert.equal(validateAdminProduct(product).ok, true); assert.equal(validateAdminProduct({ ...product, fit: "unknown" }).ok, false); assert.equal(validateAdminProduct({ ...product, slug: "Not Valid" }).ok, false); });
test("fulfilment transitions cannot manufacture a paid order", () => { assert.equal(canTransitionOrderStatus("pending_payment", "paid"), false); assert.equal(canTransitionOrderStatus("paid", "processing"), true); assert.equal(canTransitionOrderStatus("shipped", "completed"), true); });
test("admin INR input converts exactly once to stored paise", () => { assert.equal(rupeesToPaise("2400"), 240000); assert.equal(paiseToRupees(240000), "2400"); assert.equal(rupeesToPaise("24.00"), null); assert.equal(rupeesToPaise("-1"), null); });
test("product image URLs preserve object paths and normalize common saved prefixes", () => { const base = "https://example.supabase.co"; assert.equal(productImageUrl(base, "products/a/photo one.webp"), "https://example.supabase.co/storage/v1/object/public/product-images/products/a/photo%20one.webp"); assert.equal(productImageUrl(base, "product-images/products/a/photo.webp"), "https://example.supabase.co/storage/v1/object/public/product-images/products/a/photo.webp"); assert.equal(productImageUrl(base, "https://cdn.example/image.webp"), "https://cdn.example/image.webp"); });
