import type { CollectionConfig } from "payload";

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
