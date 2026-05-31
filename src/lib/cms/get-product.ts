import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Product } from "@/payload-types";

const fetchProductBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<Product | null> => {
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
    },
    ["product", slug],
    { tags: [`product:${slug}`] },
  );

export const getProductBySlug = cache(
  (slug: string): Promise<Product | null> => fetchProductBySlug(slug)(),
);
