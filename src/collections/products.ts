import type { Access, CollectionConfig } from "payload";

const requireAuth: Access = ({ req: { user } }) => Boolean(user);
const whenDigital = (_: unknown, siblingData?: { format?: string }) =>
  siblingData?.format === "digital";
const whenPhysical = (_: unknown, siblingData?: { format?: string }) =>
  siblingData?.format === "physical";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: { pl: "Produkt", en: "Product" },
    plural: { pl: "Produkty", en: "Products" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "format", "priceGross", "active"],
  },
  access: {
    read: () => true,
    create: requireAuth,
    update: requireAuth,
    delete: requireAuth,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { pl: "Slug", en: "Slug" },
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: { pl: "Tytuł", en: "Title" },
    },
    {
      name: "description",
      type: "richText",
      localized: true,
      label: { pl: "Opis", en: "Description" },
    },
    {
      name: "format",
      type: "select",
      required: true,
      options: [
        { label: { pl: "Cyfrowy", en: "Digital" }, value: "digital" },
        { label: { pl: "Fizyczny", en: "Physical" }, value: "physical" },
      ],
      label: { pl: "Format", en: "Format" },
    },
    {
      name: "priceGross",
      type: "number",
      required: true,
      min: 0,
      label: { pl: "Cena brutto (grosze)", en: "Price gross (cents)" },
      admin: {
        description: { pl: "Wartość w groszach. 49,99 PLN = 4999.", en: "Value in cents. 49.99 PLN = 4999." },
      },
    },
    {
      name: "currency",
      type: "select",
      required: true,
      defaultValue: "PLN",
      options: [{ label: "PLN", value: "PLN" }],
      label: { pl: "Waluta", en: "Currency" },
    },
    {
      name: "vatRate",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
      max: 1,
      label: { pl: "Stawka VAT (ułamek dziesiętny)", en: "VAT rate (decimal)" },
      admin: {
        description: { pl: "0.05 = 5%, 0.23 = 23%, 0 = brak.", en: "0.05 = 5%, 0.23 = 23%, 0 = none." },
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
      label: { pl: "Okładka", en: "Cover image" },
    },
    {
      name: "file",
      type: "upload",
      relationTo: "media",
      label: { pl: "Plik (cyfrowy)", en: "File (digital)" },
      admin: {
        condition: whenDigital,
      },
    },
    {
      name: "weightGrams",
      type: "number",
      label: { pl: "Waga (g)", en: "Weight (g)" },
      admin: {
        condition: whenPhysical,
      },
    },
    {
      name: "dimensions",
      type: "group",
      label: { pl: "Wymiary (mm)", en: "Dimensions (mm)" },
      admin: {
        condition: whenPhysical,
      },
      fields: [
        { name: "length", type: "number" },
        { name: "width", type: "number" },
        { name: "height", type: "number" },
      ],
    },
    {
      name: "active",
      type: "checkbox",
      index: true,
      defaultValue: true,
      label: { pl: "Aktywny", en: "Active" },
    },
  ],
};
