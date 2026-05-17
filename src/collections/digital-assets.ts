import type { Access, CollectionConfig } from "payload";

const requireAuth: Access = ({ req: { user } }) => Boolean(user);

export const DigitalAssets: CollectionConfig = {
  slug: "digital-assets",
  labels: {
    singular: { pl: "Plik cyfrowy", en: "Digital asset" },
    plural: { pl: "Pliki cyfrowe", en: "Digital assets" },
  },
  admin: {
    useAsTitle: "label",
    description: {
      pl: "Pliki ebooków sprzedawanych jako produkty cyfrowe. Niedostępne publicznie — odczyt tylko z panelu administracyjnego.",
      en: "Ebook files sold as digital products. Not publicly accessible — admin-only read.",
    },
  },
  access: {
    read: requireAuth,
    create: requireAuth,
    update: requireAuth,
    delete: requireAuth,
  },
  upload: {
    mimeTypes: ["application/pdf", "application/epub+zip"],
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: { pl: "Etykieta", en: "Label" },
    },
  ],
};
