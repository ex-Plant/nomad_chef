import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from "payload";
import { revalidateTag } from "next/cache";
import { calcVat } from "@/lib/billing";

const requireAuth: Access = ({ req: { user } }) => Boolean(user);
const whenDigital = (_: unknown, siblingData?: { format?: string }) =>
  siblingData?.format === "digital";
const whenPhysical = (_: unknown, siblingData?: { format?: string }) =>
  siblingData?.format === "physical";

const calculateNetPrice: CollectionBeforeChangeHook = ({ data }) => {
  if (typeof data.priceGross !== "number") return data;
  const vatRate = data.vatRate ? Number(data.vatRate) : 0;
  const { priceNet } = calcVat(data.priceGross, vatRate);
  data.priceNet = priceNet;
  return data;
};

export const Products: CollectionConfig = {
  slug: "products",
  hooks: {
    beforeChange: [calculateNetPrice],
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag(`product:${doc.slug}`, "max");
        } catch {}
      },
    ],
    afterDelete: [
      ({ doc }) => {
        try {
          revalidateTag(`product:${doc.slug}`, "max");
        } catch {}
      },
    ],
  },
  labels: {
    singular: { pl: "Produkt", en: "Product" },
    plural: { pl: "Produkty", en: "Products" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "format", "priceGross", "stockQty", "active"],
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
      label: { pl: "Cena brutto (PLN)", en: "Price gross (PLN)" },
      admin: {
        description: { pl: "np. 49.99", en: "e.g. 49.99" },
      },
    },
    {
      name: "vatRate",
      type: "select",
      required: true,
      defaultValue: "5",
      options: [
        { label: "0%", value: "0" },
        { label: "5%", value: "5" },
        { label: "8%", value: "8" },
        { label: "23%", value: "23" },
      ],
      label: { pl: "Stawka VAT", en: "VAT rate" },
    },
    {
      name: "priceNet",
      type: "number",
      admin: {
        readOnly: true,
        description: {
          pl: "Wyliczana automatycznie z brutto i stawki VAT przy zapisie.",
          en: "Auto-calculated from gross + VAT on save.",
        },
      },
      label: { pl: "Cena netto (PLN)", en: "Price net (PLN)" },
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
      name: "coverImage",
      type: "upload",
      relationTo: "media",
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
      name: "stockQty",
      type: "number",
      defaultValue: 0,
      min: 0,
      label: { pl: "Stan magazynowy", en: "Stock on hand" },
      admin: {
        condition: whenPhysical,
        description: {
          pl: "Liczba sztuk dostępnych do sprzedaży. Spada przy złożeniu zamówienia, wraca przy nieudanej płatności lub zwrocie.",
          en: "Units available to sell. Decreases on order create, restores on payment failure or refund.",
        },
      },
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
