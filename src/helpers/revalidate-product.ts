import { revalidateTag } from "next/cache";

export const revalidateProduct = ({ doc }: { doc: { slug: string } }) => {
  console.log("revalidating product...");
  try {
    revalidateTag(`product:${doc.slug}`, "max");
  } catch {}
};
