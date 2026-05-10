import { getPayload } from "payload";
import config from "@payload-config";
import { LEGAL_SLUGS } from "@/config/legal";

// Minimal Lexical editor state with a single paragraph of plain text.
// Used to populate richText fields with placeholder content that the chef
// can replace via the admin UI.
const richTextStub = (text: string) => ({
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: [
      {
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        textFormat: 0,
        textStyle: "",
        children: [
          {
            type: "text",
            format: 0,
            mode: "normal",
            style: "",
            text,
            detail: 0,
            version: 1,
          },
        ],
      },
    ],
  },
});

type SeedT = {
  slug: string;
  link_label: string;
  title: string;
  body: string;
};

const SEEDS: SeedT[] = [
  {
    slug: LEGAL_SLUGS.terms,
    link_label: "regulamin sprzedaży",
    title: "Regulamin sprzedaży",
    body: "Treść regulaminu — uzupełnij w panelu administracyjnym.",
  },
  {
    slug: LEGAL_SLUGS.privacy,
    link_label: "politykę prywatności",
    title: "Polityka prywatności",
    body: "Treść polityki prywatności — uzupełnij w panelu administracyjnym.",
  },
];

async function main() {
  const payload = await getPayload({ config });

  for (const seed of SEEDS) {
    const existing = await payload.find({
      collection: "legal-pages",
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs[0]) {
      console.log(`exists: #${existing.docs[0].id} ${seed.slug} (skipped)`);
      continue;
    }

    const created = await payload.create({
      collection: "legal-pages",
      data: {
        slug: seed.slug,
        link_label: seed.link_label,
        title: richTextStub(seed.title) as never,
        body: richTextStub(seed.body) as never,
      },
    });
    console.log(`created: #${created.id} ${seed.slug}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
