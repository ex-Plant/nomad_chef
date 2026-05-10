import { getPayload } from "payload";
import config from "@payload-config";

async function main() {
  const payload = await getPayload({ config });
  const raw = await payload.findGlobal({
    slug: "site",
    locale: "pl",
    depth: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legal = (raw as any).contact_legal;
  console.log("contact_legal present:", legal != null);
  console.log("typeof:", typeof legal);
  if (legal) {
    console.log("preview:", JSON.stringify(legal).slice(0, 200));
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
