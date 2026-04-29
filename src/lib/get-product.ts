import { getPayload } from "payload";
import config from "@payload-config";
import type { Product } from "@/payload-types";

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "products",
    where: {
      slug: { equals: slug },
      active: { equals: true },
    },
    limit: 1,
    depth: 1,
  });
  return docs[0] ?? null;
}
