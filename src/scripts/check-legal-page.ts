import { getPayload } from "payload";
import config from "@payload-config";

async function main() {
  const payload = await getPayload({ config });
  for (const slug of ["regulamin", "polityka-prywatnosci"]) {
    const result = await payload.find({
      collection: "legal-pages",
      where: { slug: { equals: slug } },
      locale: "pl",
      limit: 1,
      depth: 0,
    });
    const doc = result.docs[0];
    console.log(`${slug}:`, doc ? "FOUND" : "MISSING", "id=", doc?.id);
    if (doc) {
      console.log("  link_label:", doc.link_label);
      console.log("  has title:", doc.title != null);
      console.log("  has body:", doc.body != null);
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
