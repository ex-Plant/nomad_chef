export type ProductFormatT = "digital" | "physical";
export type InventoryPolicyT = "tracked" | "untracked";

type ProductLikeT = {
  format?: string | null;
  inventoryPolicy?: string | null;
};

export function defaultInventoryPolicy(
  format: ProductFormatT,
): InventoryPolicyT {
  return format === "physical" ? "tracked" : "untracked";
}

export function resolveInventoryPolicy(
  product: ProductLikeT,
): InventoryPolicyT {
  if (product.inventoryPolicy === "tracked") return "tracked";
  if (product.inventoryPolicy === "untracked") return "untracked";
  return product.format === "physical" ? "tracked" : "untracked";
}

export function tracksInventory(product: ProductLikeT): boolean {
  return resolveInventoryPolicy(product) === "tracked";
}
