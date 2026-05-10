import { getPayload } from "payload";
import config from "@payload-config";

async function main() {
  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "products",
    where: { slug: { equals: "cookbook-digital" } },
    limit: 1,
  });
  if (existing.docs[0]) {
    console.log(
      `exists: #${existing.docs[0].id} ${existing.docs[0].slug}`,
    );
    process.exit(0);
  }
  const created = await payload.create({
    collection: "products",
    data: {
      slug: "cookbook-digital",
      title: "Książka cyfrowa",
      format: "digital",
      priceGross: 49.99,
      vatRate: "5",
      currency: "PLN",
      active: true,
    },
  });
  console.log(
    `created: #${created.id} ${created.slug} ${created.priceGross} PLN`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
