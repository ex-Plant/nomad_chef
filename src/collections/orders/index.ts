import type { Access, CollectionConfig } from "payload";
import { generateOrderNumber } from "./hooks/generate-order-number";

const requireAuth: Access = ({ req: { user } }) => Boolean(user);

function getProductFormat(data: unknown): "digital" | "physical" | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as { product?: { format?: string } | string };
  if (typeof d.product === "object" && d.product?.format) {
    return d.product.format as "digital" | "physical";
  }
  return undefined;
}

const whenDigitalOrder = (data: unknown) => getProductFormat(data) === "digital";
const whenPhysicalOrder = (data: unknown) => getProductFormat(data) === "physical";

export const Orders: CollectionConfig = {
  slug: "orders",
  hooks: {
    beforeChange: [generateOrderNumber],
  },
  labels: {
    singular: { pl: "Zamówienie", en: "Order" },
    plural: { pl: "Zamówienia", en: "Orders" },
  },
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "customer", "product", "totalGross", "paymentStatus", "fulfillmentStatus", "createdAt"],
  },
  access: {
    read: requireAuth,
    create: requireAuth,
    update: requireAuth,
    delete: requireAuth,
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true },
      label: { pl: "Numer zamówienia", en: "Order number" },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      required: true,
      label: { pl: "Klient", en: "Customer" },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      label: { pl: "Produkt", en: "Product" },
    },
    {
      name: "quantity",
      type: "number",
      required: true,
      defaultValue: 1,
      min: 1,
      label: { pl: "Ilość", en: "Quantity" },
    },
    {
      name: "unitPriceGross",
      type: "number",
      required: true,
      admin: { readOnly: true, description: { pl: "Snapshot z chwili sprzedaży", en: "Snapshot at sale time" } },
      label: { pl: "Cena jedn. brutto (grosze)", en: "Unit price gross (cents)" },
    },
    {
      name: "totalGross",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Suma brutto (grosze)", en: "Total gross (cents)" },
    },
    {
      name: "priceNet",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Suma netto (grosze)", en: "Total net (cents)" },
    },
    {
      name: "vatRate",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Stawka VAT", en: "VAT rate" },
    },
    {
      name: "vatAmount",
      type: "number",
      required: true,
      admin: { readOnly: true },
      label: { pl: "Kwota VAT (grosze)", en: "VAT amount (cents)" },
    },
    {
      name: "currency",
      type: "select",
      required: true,
      defaultValue: "PLN",
      options: [{ label: "PLN", value: "PLN" }],
    },
    {
      name: "paymentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: [
        { label: { pl: "Oczekuje", en: "Pending" }, value: "pending" },
        { label: { pl: "Opłacone", en: "Paid" }, value: "paid" },
        { label: { pl: "Nieudane", en: "Failed" }, value: "failed" },
        { label: { pl: "Zwrot", en: "Refunded" }, value: "refunded" },
      ],
    },
    {
      name: "paymentProvider",
      type: "text",
      label: { pl: "Operator płatności", en: "Payment provider" },
    },
    {
      name: "paymentRef",
      type: "text",
      index: true,
      label: { pl: "ID transakcji", en: "Transaction ID" },
    },
    {
      name: "fulfillmentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: { pl: "Oczekuje", en: "Pending" }, value: "pending" },
        { label: { pl: "Wysłane / dostarczone", en: "Fulfilled" }, value: "fulfilled" },
        { label: { pl: "Wysłane (kurier)", en: "Shipped" }, value: "shipped" },
        { label: { pl: "Dostarczone", en: "Delivered" }, value: "delivered" },
      ],
    },
    {
      name: "downloadToken",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true, condition: whenDigitalOrder },
      label: { pl: "Token pobrania", en: "Download token" },
    },
    {
      name: "downloadCount",
      type: "number",
      defaultValue: 0,
      admin: { readOnly: true, condition: whenDigitalOrder },
    },
    {
      name: "downloadLimit",
      type: "number",
      defaultValue: 5,
      min: 1,
      admin: { condition: whenDigitalOrder },
    },
    {
      name: "downloadExpiresAt",
      type: "date",
      admin: { readOnly: true, condition: whenDigitalOrder },
    },
    {
      name: "shippingAddress",
      type: "group",
      admin: { condition: whenPhysicalOrder },
      fields: [
        { name: "firstName", type: "text" },
        { name: "lastName", type: "text" },
        { name: "line1", type: "text" },
        { name: "line2", type: "text" },
        { name: "city", type: "text" },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text", defaultValue: "PL" },
      ],
    },
    {
      name: "tracking",
      type: "text",
      admin: { condition: whenPhysicalOrder },
    },
    {
      name: "courier",
      type: "select",
      options: [
        { label: "InPost", value: "inpost" },
        { label: "DPD", value: "dpd" },
        { label: "DHL", value: "dhl" },
        { label: "Poczta Polska", value: "poczta-polska" },
        { label: { pl: "Inny", en: "Other" }, value: "other" },
      ],
      admin: { condition: whenPhysicalOrder },
    },
    {
      name: "shippedAt",
      type: "date",
      admin: { condition: whenPhysicalOrder },
    },
    {
      name: "notes",
      type: "textarea",
      label: { pl: "Notatki wewnętrzne", en: "Internal notes" },
    },
    {
      name: "paidAt",
      type: "date",
      admin: { readOnly: true },
    },
    {
      name: "fulfilledAt",
      type: "date",
      admin: { readOnly: true },
    },
  ],
};
