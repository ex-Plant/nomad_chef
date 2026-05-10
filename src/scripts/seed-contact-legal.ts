import { getPayload } from "payload";
import config from "@payload-config";

// Minimal Lexical editor state — one paragraph per data line.
// Matches Payload's richText storage shape used by the Site global.
function richTextFromLines(lines: string[]) {
  return {
    root: {
      type: "root" as const,
      version: 1,
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      children: lines.map((text) => ({
        type: "paragraph",
        version: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        children: [
          {
            type: "text",
            version: 1,
            mode: "normal",
            text,
            detail: 0,
            format: 0,
            style: "",
          },
        ],
      })),
    },
  };
}

async function main() {
  const payload = await getPayload({ config });

  const legalPl = richTextFromLines([
    "Marta Leśniewska — Nomad Chef",
    "ul. Przykładowa 1, 00-000 Warszawa",
    "NIP 0000000000",
  ]);

  const legalEn = richTextFromLines([
    "Marta Leśniewska — Nomad Chef",
    "1 Example St, 00-000 Warsaw, Poland",
    "Tax ID 0000000000",
  ]);

  await payload.updateGlobal({
    slug: "site",
    locale: "pl",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { contact_legal: legalPl } as any,
  });
  await payload.updateGlobal({
    slug: "site",
    locale: "en",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { contact_legal: legalEn } as any,
  });

  console.log("seeded contact_legal (pl + en)");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  if (e?.data?.errors) {
    console.error("inner errors:", JSON.stringify(e.data.errors, null, 2));
  }
  process.exit(1);
});
