import type { Payload } from "payload";
import type { CartFormValuesT } from "@/lib/cart-schema";

export async function findActiveProduct(payload: Payload, values: CartFormValuesT) {
  const products = await payload.find({
    collection: "products",
    where: {
      slug: { equals: values.productSlug },
      active: { equals: true },
    },
    limit: 1,
    depth: 0,
  });

  const product = products.docs[0];

  if (!product) {
    return { ok: false as const, error: "Produkt niedostępny" };
  }

  if (product.format !== values.format) {
    return { ok: false as const, error: "Nieprawidłowy format" };
  }

  return { ok: true as const, product };
}
