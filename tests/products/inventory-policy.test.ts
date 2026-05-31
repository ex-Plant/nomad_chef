import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  defaultInventoryPolicy,
  resolveInventoryPolicy,
  tracksInventory,
} from "@/lib/products/inventory-policy";

describe("defaultInventoryPolicy", () => {
  it("defaults physical products to tracked inventory", () => {
    assert.equal(defaultInventoryPolicy("physical"), "tracked");
  });

  it("defaults digital products to untracked inventory", () => {
    assert.equal(defaultInventoryPolicy("digital"), "untracked");
  });
});

describe("resolveInventoryPolicy", () => {
  it("prefers an explicit inventoryPolicy", () => {
    assert.equal(
      resolveInventoryPolicy({
        format: "physical",
        inventoryPolicy: "untracked",
      }),
      "untracked",
    );
  });

  it("falls back to physical products as tracked", () => {
    assert.equal(resolveInventoryPolicy({ format: "physical" }), "tracked");
  });

  it("falls back to digital products as untracked", () => {
    assert.equal(resolveInventoryPolicy({ format: "digital" }), "untracked");
  });
});

describe("tracksInventory", () => {
  it("returns true for tracked products", () => {
    assert.equal(tracksInventory({ inventoryPolicy: "tracked" }), true);
  });

  it("returns false for untracked products", () => {
    assert.equal(tracksInventory({ inventoryPolicy: "untracked" }), false);
  });
});
