import type { GlobalConfig } from "payload";
import { revalidateTag } from "next/cache";

const text = (name: string, overrides: Record<string, unknown> = {}) => ({
  name,
  type: "text" as const,
  localized: true,
  ...overrides,
});

const textarea = (name: string) => ({
  name,
  type: "textarea" as const,
  localized: true,
});

const image = (name: string) => ({
  name,
  type: "upload" as const,
  relationTo: "media" as const,
});

export const Site: GlobalConfig = {
  slug: "site",
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag("site:pl", "max");
        revalidateTag("site:en", "max");
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero",
          fields: [
            text("hero_eyebrow"),
            text("hero_title"),
            textarea("hero_lead"),
            image("hero_image"),
          ],
        },
        {
          label: "About",
          fields: [
            text("about_title"),
            textarea("about_body"),
            image("about_image"),
          ],
        },
        {
          label: "Services",
          fields: [
            text("services_title"),
            {
              name: "services_items",
              type: "array",
              fields: [text("title"), textarea("body"), image("image")],
            },
          ],
        },
        {
          label: "Camp Food",
          fields: [
            text("camp_food_title"),
            textarea("camp_food_lead"),
            {
              name: "camp_food_images",
              type: "array",
              fields: [image("image")],
            },
          ],
        },
        {
          label: "Gallery",
          fields: [
            text("gallery_title"),
            {
              name: "gallery_items",
              type: "array",
              fields: [image("image")],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            text("contact_title"),
            textarea("contact_lead"),
            text("contact_email"),
            text("contact_phone"),
            text("contact_instagram"),
          ],
        },
        {
          label: "Settings",
          fields: [
            text("site_title"),
            textarea("site_description"),
            {
              name: "nav_items",
              type: "array",
              fields: [text("label"), { name: "section_id", type: "text" }],
            },
          ],
        },
      ],
    },
  ],
};
