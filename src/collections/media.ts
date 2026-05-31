/**
 * Media — general image uploads with public read and localized `alt` text.
 * afterChange revalidates the `site` cache tag because media is referenced from
 * cached site content (e.g. globals), so edits must invalidate those pages.
 */

import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: { pl: "Plik", en: "File" },
    plural: { pl: "Pliki", en: "Files" },
  },
  access: {
    read: () => true,
  },
  upload: true,
  hooks: {
    afterChange: [
      () => {
        try {
          revalidateTag("site", "max");
        } catch {}
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      label: {
        pl: "Opis zdjęcia (tekst alternatywny)",
        en: "Image description (alt text)",
      },
    },
  ],
};
