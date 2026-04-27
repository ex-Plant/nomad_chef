import type { Field, GlobalConfig } from "payload";
import { revalidateTag } from "next/cache";

type LabelT = { pl: string; en: string };

const text = (name: string, label: LabelT, overrides: Partial<Field> = {}) =>
  ({
    name,
    type: "text",
    label,
    localized: true,
    ...overrides,
  }) as Field;

const textarea = (name: string, label: LabelT): Field =>
  ({
    name,
    type: "textarea",
    label,
    localized: true,
  }) as Field;

const upload = (name: string, label: LabelT): Field =>
  ({
    name,
    type: "upload",
    relationTo: "media",
    label,
  }) as Field;

/* Palette slugs kept free of punctuation so they map cleanly to
   Tailwind class names in the loader (`text-off-black` etc.). */
const COLOR_OPTIONS = [
  { label: "Off-black", value: "off-black" },
  { label: "Coral", value: "coral" },
  { label: "Electric blue", value: "blue" },
  { label: "Warm white", value: "white" },
  { label: "Pink", value: "pink" },
  { label: "Yellow", value: "yellow" },
] as const;

const colorSelect = (
  name: string,
  label: LabelT,
  defaultValue: string,
): Field => ({
  name,
  type: "select",
  label,
  options: COLOR_OPTIONS as unknown as { label: string; value: string }[],
  defaultValue,
  required: true,
});

const ctaField = (name: string, label: LabelT): Field => ({
  name,
  type: "group",
  label,
  fields: [
    text("label", { pl: "Etykieta przycisku", en: "Button label" }),
    text("href", { pl: "Link", en: "Link" }, { localized: false }),
  ],
});

const contactChannel = (name: string, label: LabelT): Field => ({
  name,
  type: "group",
  label,
  fields: [
    text("label", { pl: "Etykieta", en: "Label" }),
    text("value", { pl: "Widoczna wartość", en: "Display value" }),
    text("href", { pl: "Link", en: "Link" }, { localized: false }),
  ],
});

export const Site: GlobalConfig = {
  slug: "site",
  label: { pl: "Treść strony", en: "Site content" },
  access: { read: () => true },
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
      type: "tabs",
      tabs: [
        {
          label: { pl: "Sekcja główna", en: "Hero section" },
          fields: [
            text("hero_tagline", {
              pl: "Tekst nad nagłówkiem (mały napis)",
              en: "Text above headline (small)",
            }),
            {
              name: "hero_heading_lines",
              type: "array",
              label: { pl: "Linie nagłówka", en: "Heading lines" },
              localized: true,
              fields: [
                text(
                  "text",
                  { pl: "Tekst linii", en: "Line text" },
                  { required: true },
                ),
              ],
            },
            textarea("hero_lead", {
              pl: "Tekst wprowadzający",
              en: "Intro text",
            }),
            {
              name: "hero_ctas",
              type: "array",
              label: { pl: "Przyciski CTA", en: "CTA buttons" },
              localized: true,
              maxRows: 2,
              fields: [
                text("label", { pl: "Etykieta", en: "Label" }),
                text(
                  "href",
                  { pl: "Link", en: "Link" },
                  { localized: false },
                ),
              ],
            },
            upload("hero_media_desktop", {
              pl: "Wideo/zdjęcie desktop",
              en: "Desktop video/image",
            }),
            upload("hero_media_mobile", {
              pl: "Wideo/zdjęcie mobile",
              en: "Mobile video/image",
            }),
          ],
        },
        {
          label: { pl: "O mnie", en: "About" },
          fields: [
            text("about_eyebrow", {
              pl: "Nadnagłówek",
              en: "Eyebrow",
            }),
            {
              name: "about_heading_lines",
              type: "array",
              label: { pl: "Linie nagłówka", en: "Heading lines" },
              localized: true,
              fields: [
                text(
                  "text",
                  { pl: "Tekst linii", en: "Line text" },
                  { required: true },
                ),
                colorSelect(
                  "color",
                  { pl: "Kolor linii", en: "Line color" },
                  "off-black",
                ),
              ],
            },
            textarea("about_intro", {
              pl: "Wstęp",
              en: "Intro",
            }),
            textarea("about_quote", {
              pl: "Cytat",
              en: "Pull quote",
            }),
            {
              name: "about_paragraphs",
              type: "array",
              label: { pl: "Akapity", en: "Paragraphs" },
              localized: true,
              fields: [
                textarea("text", { pl: "Tekst akapitu", en: "Paragraph text" }),
              ],
            },
            text("about_image_alt", {
              pl: "Opis zdjęcia (alt)",
              en: "Image alt",
            }),
            upload("about_image", {
              pl: "Zdjęcie",
              en: "Image",
            }),
          ],
        },
        {
          label: { pl: "Usługi", en: "Services" },
          fields: [
            text("services_eyebrow", {
              pl: "Nadnagłówek",
              en: "Eyebrow",
            }),
            text("services_background_alt", {
              pl: "Alt tła",
              en: "Background alt",
            }),
            upload("services_background", {
              pl: "Tło (zdjęcie)",
              en: "Background image",
            }),
            {
              name: "services_slides",
              type: "array",
              label: { pl: "Slajdy usług", en: "Services slides" },
              localized: true,
              fields: [
                text("title", { pl: "Tytuł", en: "Title" }),
                textarea("tagline", { pl: "Podpis", en: "Tagline" }),
                textarea("description", { pl: "Opis", en: "Description" }),
              ],
            },
          ],
        },
        {
          label: { pl: "Camp Food", en: "Camp Food" },
          fields: [
            text("camp_food_eyebrow", {
              pl: "Nadnagłówek",
              en: "Eyebrow",
            }),
            text("camp_food_kicker", {
              pl: "Kicker (nad nagłówkiem)",
              en: "Kicker (above heading)",
            }),
            {
              name: "camp_food_heading_lines",
              type: "array",
              label: { pl: "Linie nagłówka", en: "Heading lines" },
              localized: true,
              fields: [
                text(
                  "text",
                  { pl: "Tekst linii", en: "Line text" },
                  { required: true },
                ),
              ],
            },
            ctaField("camp_food_cta", {
              pl: "Przycisk CTA",
              en: "CTA button",
            }),
            {
              name: "camp_food_slides",
              type: "array",
              label: { pl: "Slajdy", en: "Slides" },
              localized: true,
              fields: [
                text("alt", { pl: "Alt zdjęcia", en: "Image alt" }),
                textarea("description", { pl: "Opis", en: "Description" }),
                upload("image", { pl: "Zdjęcie", en: "Image" }),
                {
                  name: "theme",
                  type: "select",
                  label: { pl: "Motyw kolorystyczny", en: "Color theme" },
                  options: [
                    { label: "Pomarańczowy", value: "orange" },
                    { label: "Niebieski", value: "blue" },
                  ],
                  defaultValue: "orange",
                  required: true,
                },
                {
                  name: "image_orientation",
                  type: "select",
                  label: {
                    pl: "Orientacja zdjęcia",
                    en: "Image orientation",
                  },
                  options: [
                    { label: "Pionowe", value: "vertical" },
                    { label: "Poziome", value: "horizontal" },
                  ],
                  defaultValue: "vertical",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: { pl: "Galeria", en: "Gallery" },
          fields: [
            text("gallery_eyebrow", {
              pl: "Nadnagłówek",
              en: "Eyebrow",
            }),
            text("gallery_heading", {
              pl: "Nagłówek",
              en: "Heading",
            }),
            text("gallery_handle", {
              pl: "Uchwyt (np. @instagram)",
              en: "Handle (e.g. @instagram)",
            }),
            {
              name: "gallery_images",
              type: "array",
              label: { pl: "Zdjęcia galerii", en: "Gallery images" },
              fields: [upload("image", { pl: "Zdjęcie", en: "Image" })],
            },
          ],
        },
        {
          label: { pl: "Kontakt", en: "Contact" },
          fields: [
            text("contact_eyebrow", {
              pl: "Nadnagłówek",
              en: "Eyebrow",
            }),
            {
              name: "contact_heading_lines",
              type: "array",
              label: { pl: "Linie nagłówka", en: "Heading lines" },
              localized: true,
              fields: [
                text(
                  "text",
                  { pl: "Tekst linii", en: "Line text" },
                  { required: true },
                ),
                colorSelect(
                  "color",
                  { pl: "Kolor linii", en: "Line color" },
                  "off-black",
                ),
              ],
            },
            textarea("contact_lead", {
              pl: "Tekst wprowadzający",
              en: "Intro text",
            }),
            textarea("contact_description", {
              pl: "Opis",
              en: "Description",
            }),
            contactChannel("contact_email", {
              pl: "Email",
              en: "Email",
            }),
            contactChannel("contact_instagram", {
              pl: "Instagram",
              en: "Instagram",
            }),
            text("contact_form_placeholder", {
              pl: "Placeholder formularza",
              en: "Form placeholder",
            }),
            ctaField("contact_submit", {
              pl: "Przycisk wysyłania",
              en: "Submit button",
            }),
            text("contact_footer", {
              pl: "Stopka",
              en: "Footer",
            }),
          ],
        },
        {
          label: { pl: "Ustawienia", en: "Settings" },
          fields: [
            text("site_title", {
              pl: "Tytuł strony (zakładka przeglądarki)",
              en: "Site title (browser tab)",
            }),
            textarea("site_description", {
              pl: "Opis strony (SEO)",
              en: "Site description (SEO)",
            }),
            {
              name: "nav_items",
              type: "array",
              label: { pl: "Pozycje w menu", en: "Menu items" },
              localized: true,
              fields: [
                text("label", { pl: "Tekst w menu", en: "Menu label" }),
                {
                  name: "section_id",
                  type: "text",
                  label: {
                    pl: "ID sekcji (techniczne, nie zmieniać)",
                    en: "Section ID (technical, do not change)",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
