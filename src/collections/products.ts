/**
 * Products — the catalogue (digital ebooks and physical goods). Publicly
 * readable; writes are admin-only.
 *
 * Auto-managed fields via the hooks defined below: syncInventoryPolicy defaults
 * inventoryPolicy from format (physical→tracked, digital→untracked) when unset,
 * calculateNetPrice derives priceNet from priceGross + vatRate on save, and
 * revalidateProduct busts the cached product page on change/delete.
 */

import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from "payload";
import { calcVat } from "@/lib/checkout/billing";
import { defaultInventoryPolicy } from "@/lib/products/inventory-policy";
import { revalidateProduct } from "@/helpers/revalidate-product";

const requireAuth: Access = ({ req: { user } }) => Boolean(user);
const whenDigital = (_: unknown, siblingData?: { format?: string }) =>
  siblingData?.format === "digital";
const whenTrackedInventory = (
  _: unknown,
  siblingData?: { inventoryPolicy?: string },
) => siblingData?.inventoryPolicy === "tracked";

const syncInventoryPolicy: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  if (!data) return data;

  const format = data.format ?? originalDoc?.format;

  if (data.inventoryPolicy === undefined && format) {
    data.inventoryPolicy = defaultInventoryPolicy(format);
  }

  return data;
};

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
    beforeValidate: [syncInventoryPolicy],
    beforeChange: [calculateNetPrice],
    afterChange: [revalidateProduct],
    afterDelete: [revalidateProduct],
  },
  labels: {
    singular: { pl: "Produkt", en: "Product" },
    plural: { pl: "Produkty", en: "Products" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "format",
      "inventoryPolicy",
      "priceGross",
      "stockQty",
      "active",
    ],
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
      type: "textarea",
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
      relationTo: "digital-assets",
      label: { pl: "Plik (cyfrowy)", en: "File (digital)" },
      admin: {
        condition: whenDigital,
      },
    },
    {
      name: "inventoryPolicy",
      type: "select",
      required: true,
      options: [
        {
          label: { pl: "Śledź stan magazynowy", en: "Tracked inventory" },
          value: "tracked",
        },
        {
          label: { pl: "Bez limitu stanów", en: "Untracked inventory" },
          value: "untracked",
        },
      ],
      label: { pl: "Polityka magazynowa", en: "Inventory policy" },
      admin: {
        description: {
          pl: "Kontroluje, czy checkout ma pilnować liczby dostępnych sztuk. Domyślnie fizyczne produkty śledzą stan, cyfrowe nie.",
          en: "Controls whether checkout should enforce available units. Physical products default to tracked inventory, digital products to untracked.",
        },
      },
    },
    {
      name: "stockQty",
      type: "number",
      defaultValue: 0,
      min: 0,
      label: { pl: "Stan magazynowy", en: "Stock on hand" },
      admin: {
        condition: whenTrackedInventory,
        description: {
          pl: "Liczba sztuk dostępnych do sprzedaży. Spada dopiero po potwierdzeniu płatności, wraca przy nieudanej płatności lub zwrocie.",
          en: "Units available to sell. Decreases only after payment is confirmed and restores on failed payments or refunds.",
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
