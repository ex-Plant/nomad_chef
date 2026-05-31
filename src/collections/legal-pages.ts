import type { Access, CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";

const requireAuth: Access = ({ req: { user } }) => Boolean(user);

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  labels: {
    singular: { pl: "Strona prawna", en: "Legal page" },
    plural: { pl: "Strony prawne", en: "Legal pages" },
  },
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "updatedAt"],
    description: {
      pl: "Statyczne strony tekstowe (regulamin, polityka prywatności).",
      en: "Static text pages (terms, privacy policy).",
    },
  },
  access: {
    read: () => true,
    create: requireAuth,
    update: requireAuth,
    delete: requireAuth,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag(`legal-page:${doc.slug}`, "max");
        } catch {}
      },
    ],
    afterDelete: [
      ({ doc }) => {
        try {
          revalidateTag(`legal-page:${doc.slug}`, "max");
        } catch {}
      },
    ],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { pl: "Slug (URL)", en: "Slug (URL)" },
      admin: {
        description: {
          pl: "Identyfikator strony — fragment URL, np. „regulamin” lub „polityka-prywatnosci”. Nie zmieniać po publikacji.",
          en: "Page identifier — URL segment, e.g. 'regulamin' or 'polityka-prywatnosci'. Do not change after publishing.",
        },
      },
    },
    {
      name: "link_label",
      type: "text",
      required: true,
      localized: true,
      label: { pl: "Etykieta linku", en: "Link label" },
      admin: {
        description: {
          pl: "Tekst widoczny w linkach (np. w checkboxie zgody) — w mianowniku/bierniku zgodnie z gramatyką zdania.",
          en: "Visible link text (e.g. in consent checkboxes).",
        },
      },
    },
    {
      name: "title",
      type: "richText",
      required: true,
      localized: true,
      label: { pl: "Tytuł", en: "Title" },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      localized: true,
      label: { pl: "Treść", en: "Body" },
    },
  ],
};
